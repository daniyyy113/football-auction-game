const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const playersData = require('./data/players');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory room store: roomCode -> room state
const rooms = new Map();

/**
 * Generate a unique 6-character alphanumeric uppercase room code
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(code));
  return code;
}

/**
 * Fisher-Yates array shuffle
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Convert internal room state to client-safe JSON object
 */
function serializeRoom(room) {
  if (!room) return null;

  const teamsArray = Array.from(room.teams.values()).map(t => ({
    ...t,
    squad: t.players || []
  }));

  const currentBidder = (room.currentBid && room.currentBid.teamId) ? {
    id: room.currentBid.teamId,
    name: room.currentBid.teamName,
    emoji: room.currentBid.emoji || '⚽'
  } : null;

  return {
    roomId: room.roomId,
    roomCode: room.roomCode,
    code: room.roomCode,
    config: room.config,
    maxTeams: room.config.maxTeams,
    budget: room.config.budget,
    bidTimer: room.config.timerDuration,
    timerDuration: room.config.timerDuration,
    status: room.status,
    teams: teamsArray,
    host: room.host,
    hostId: room.host,
    currentPlayer: room.currentPlayer,
    player: room.currentPlayer,
    currentBid: room.currentBid ? room.currentBid.amount : 0,
    bid: room.currentBid ? room.currentBid.amount : 0,
    currentBidObject: room.currentBid,
    currentBidder: currentBidder,
    bidderName: room.currentBid ? room.currentBid.teamName : '',
    bidderEmoji: room.currentBid ? (room.currentBid.emoji || '⚽') : '⚽',
    timerRemaining: room.timerRemaining,
    timeLeft: room.timerRemaining,
    seconds: room.timerRemaining,
    totalTime: room.config.timerDuration,
    round: room.currentPlayerIndex + 1,
    currentPlayerIndex: room.currentPlayerIndex,
    totalPlayers: room.playerPool ? room.playerPool.length : 0,
    soldPlayers: room.soldPlayers,
    unsoldPlayers: room.unsoldPlayers,
    history: [
      ...room.soldPlayers.map(s => ({
        player: s.player,
        winner: { name: s.teamName, emoji: s.teamEmoji || '⚽' },
        amount: s.price,
        sold: true
      })),
      ...room.unsoldPlayers.map(p => ({
        player: p,
        sold: false
      }))
    ]
  };
}

/**
 * Clear any active timers on a room
 */
function clearRoomTimers(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
  if (room.transitionTimeout) {
    clearTimeout(room.transitionTimeout);
    room.transitionTimeout = null;
  }
}

/**
 * Put the next player up for auction or finish auction if pool completed
 */
function startPlayerAuction(room) {
  clearRoomTimers(room);

  if (!room.playerPool || room.currentPlayerIndex >= room.playerPool.length) {
    finishAuction(room);
    return;
  }

  room.currentPlayer = room.playerPool[room.currentPlayerIndex];
  room.currentBid = {
    amount: 0,
    teamId: null,
    teamName: '',
    emoji: ''
  };
  room.timerRemaining = room.config.timerDuration;

  const serialized = serializeRoom(room);
  io.to(room.roomCode).emit('auction-update', serialized);
  io.to(room.roomCode).emit('timer-tick', {
    timerRemaining: room.timerRemaining,
    timeLeft: room.timerRemaining,
    seconds: room.timerRemaining,
    totalTime: room.config.timerDuration,
    roomCode: room.roomCode
  });

  // Start the countdown timer
  room.timerInterval = setInterval(() => {
    room.timerRemaining -= 1;
    io.to(room.roomCode).emit('timer-tick', {
      timerRemaining: room.timerRemaining,
      timeLeft: room.timerRemaining,
      seconds: room.timerRemaining,
      totalTime: room.config.timerDuration,
      roomCode: room.roomCode
    });

    if (room.timerRemaining <= 0) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
      handlePlayerAuctionEnd(room);
    }
  }, 1000);
}

/**
 * Handle end of bidding for the current player (timer reached 0)
 */
function handlePlayerAuctionEnd(room) {
  clearRoomTimers(room);
  const player = room.currentPlayer;
  if (!player) return;

  if (room.currentBid && room.currentBid.teamId) {
    // Sold to the highest bidder
    const winnerTeam = room.teams.get(room.currentBid.teamId);
    if (winnerTeam) {
      winnerTeam.budget = Math.max(0, Number((winnerTeam.budget - room.currentBid.amount).toFixed(2)));
      const boughtPlayer = {
        ...player,
        soldPrice: room.currentBid.amount
      };
      winnerTeam.players.push(boughtPlayer);

      const soldRecord = {
        player,
        teamId: winnerTeam.id,
        teamName: winnerTeam.name,
        teamEmoji: winnerTeam.emoji,
        price: room.currentBid.amount
      };
      room.soldPlayers.push(soldRecord);

      io.to(room.roomCode).emit('player-sold', {
        player,
        team: winnerTeam.name,
        teamEmoji: winnerTeam.emoji,
        winner: { name: winnerTeam.name, emoji: winnerTeam.emoji },
        buyer: { name: winnerTeam.name, emoji: winnerTeam.emoji },
        price: room.currentBid.amount,
        amount: room.currentBid.amount
      });
    }
  } else {
    // Unsold
    room.unsoldPlayers.push(player);
    io.to(room.roomCode).emit('player-unsold', { player });
  }

  // Update room state for all clients
  const serialized = serializeRoom(room);
  io.to(room.roomCode).emit('room-update', serialized);
  io.to(room.roomCode).emit('auction-update', serialized);

  // 3-second delay then auto-move to next player
  room.transitionTimeout = setTimeout(() => {
    room.currentPlayerIndex += 1;
    startPlayerAuction(room);
  }, 3000);
}

/**
 * Finish auction when all players have been auctioned
 */
function finishAuction(room) {
  clearRoomTimers(room);
  room.status = 'completed';
  room.currentPlayer = null;
  room.timerRemaining = 0;

  const serialized = serializeRoom(room);
  io.to(room.roomCode).emit('auction-complete', {
    soldPlayers: room.soldPlayers,
    unsoldPlayers: room.unsoldPlayers,
    teams: Array.from(room.teams.values())
  });

  io.to(room.roomCode).emit('room-update', serialized);
  io.to(room.roomCode).emit('auction-update', serialized);
}

// ==========================================
// REST API Routes
// ==========================================

const handleCreateRoom = (req, res) => {
  try {
    const { budget, timerDuration, bidTimer, maxTeams, auctionType } = req.body || {};

    const parsedBudget = Number(budget) && Number(budget) > 0 ? Number(budget) : 100;
    const rawTimer = timerDuration !== undefined ? timerDuration : bidTimer;
    const parsedTimer = Number(rawTimer) && Number(rawTimer) >= 5 ? Number(rawTimer) : 15;
    const parsedMaxTeams = Math.min(10, Math.max(2, Number(maxTeams) || 6));
    const parsedAuctionType = auctionType === 'mini' ? 'mini' : 'full';

    const roomId = uuidv4();
    const roomCode = generateRoomCode();

    const room = {
      roomId,
      roomCode,
      config: {
        budget: parsedBudget,
        timerDuration: parsedTimer,
        maxTeams: parsedMaxTeams,
        auctionType: parsedAuctionType
      },
      status: 'waiting',
      teams: new Map(),
      playerPool: [],
      currentPlayer: null,
      currentBid: { amount: 0, teamId: null, teamName: '', emoji: '' },
      timerRemaining: parsedTimer,
      timerInterval: null,
      transitionTimeout: null,
      soldPlayers: [],
      unsoldPlayers: [],
      host: null,
      currentPlayerIndex: -1
    };

    rooms.set(roomCode, room);

    return res.status(201).json({
      success: true,
      roomId,
      roomCode,
      code: roomCode,
      config: room.config,
      room: serializeRoom(room)
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

app.post('/api/create-room', handleCreateRoom);
app.post('/api/rooms', handleCreateRoom);

const handleGetRoom = (req, res) => {
  const roomCode = (req.params.roomCode || '').toUpperCase().trim();
  const room = rooms.get(roomCode);

  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }

  return res.json({
    success: true,
    room: serializeRoom(room)
  });
};

app.get('/api/room/:roomCode', handleGetRoom);
app.get('/api/rooms/:roomCode', handleGetRoom);

/**
 * GET /api/players
 * Bonus endpoint to inspect player database
 */
app.get('/api/players', (req, res) => {
  res.json({
    success: true,
    count: playersData.length,
    players: playersData
  });
});

// ==========================================
// Socket.io Real-time Communication
// ==========================================

io.on('connection', (socket) => {
  let currentRoomCode = null;

  // 1. Join room (supports 'join-room' and 'join')
  const handleJoin = ({ roomCode, code, teamName, emoji, teamEmoji }) => {
    const rawCode = roomCode || code;
    const cleanCode = (rawCode || '').toUpperCase().trim();
    const room = rooms.get(cleanCode);

    if (!room) {
      return socket.emit('error', { message: 'Room not found' });
    }

    if (room.status === 'completed') {
      return socket.emit('error', { message: 'Auction for this room has already completed' });
    }

    // Check if team already exists for this socket
    if (!room.teams.has(socket.id)) {
      if (room.teams.size >= room.config.maxTeams) {
        return socket.emit('error', { message: `Room is full (max ${room.config.maxTeams} teams)` });
      }

      const teamCount = room.teams.size + 1;
      const cleanTeamName = (teamName || `FC Team ${teamCount}`).trim();
      const chosenEmoji = emoji || teamEmoji || '⚽';

      const team = {
        id: socket.id,
        name: cleanTeamName,
        emoji: chosenEmoji,
        budget: room.config.budget,
        players: []
      };

      room.teams.set(socket.id, team);
    }

    // If room has no host, this socket becomes host
    if (!room.host) {
      room.host = socket.id;
    }

    currentRoomCode = cleanCode;
    socket.join(cleanCode);

    const team = room.teams.get(socket.id);
    const serialized = serializeRoom(room);

    socket.emit('joined-room', {
      roomCode: cleanCode,
      code: cleanCode,
      team,
      isHost: room.host === socket.id,
      room: serialized
    });

    io.to(cleanCode).emit('room-update', serialized);
  };

  socket.on('join-room', handleJoin);
  socket.on('join', handleJoin);

  // 2. Start auction (supports 'start-auction' and 'startAuction')
  const handleStartAuction = (data = {}) => {
    const code = data.roomCode || data.code || currentRoomCode;
    if (!code) return socket.emit('error', { message: 'Not in a room' });
    const room = rooms.get(code);
    if (!room) return socket.emit('error', { message: 'Room not found' });

    if (room.host !== socket.id) {
      return socket.emit('error', { message: 'Only the host can start the auction' });
    }

    if (room.status !== 'waiting') {
      return socket.emit('error', { message: 'Auction has already started' });
    }

    if (room.teams.size < 1) {
      return socket.emit('error', { message: 'At least 1 team is required to start' });
    }

    // Prepare player pool
    let pool = [...playersData];
    if (room.config.auctionType === 'mini') {
      // For mini auction, select a curated balance of 25 players across tiers
      const marquee = shuffle(pool.filter(p => p.tier === 'marquee')).slice(0, 8);
      const elite = shuffle(pool.filter(p => p.tier === 'elite')).slice(0, 8);
      const standard = shuffle(pool.filter(p => p.tier === 'standard')).slice(0, 5);
      const budget = shuffle(pool.filter(p => p.tier === 'budget')).slice(0, 4);
      pool = shuffle([...marquee, ...elite, ...standard, ...budget]);
    } else {
      // Full auction - all players shuffled
      pool = shuffle(pool);
    }

    room.playerPool = pool;
    room.status = 'in-progress';
    room.currentPlayerIndex = 0;
    room.soldPlayers = [];
    room.unsoldPlayers = [];

    const serialized = serializeRoom(room);
    io.to(room.roomCode).emit('room-update', serialized);
    startPlayerAuction(room);
  };

  socket.on('start-auction', handleStartAuction);
  socket.on('startAuction', handleStartAuction);

  // 3. Place bid (supports 'place-bid' and 'bid')
  const handlePlaceBid = (data = {}) => {
    const code = data.roomCode || data.code || currentRoomCode;
    if (!code) return socket.emit('error', { message: 'Not in a room' });
    const room = rooms.get(code);
    if (!room) return socket.emit('error', { message: 'Room not found' });

    if (room.status !== 'in-progress') {
      return socket.emit('error', { message: 'Auction is not in progress' });
    }

    if (!room.currentPlayer) {
      return socket.emit('error', { message: 'No player currently up for auction' });
    }

    const team = room.teams.get(socket.id);
    if (!team) {
      return socket.emit('error', { message: 'Team not recognized' });
    }

    if (room.currentBid.teamId === socket.id) {
      return socket.emit('error', { message: 'You already hold the highest bid' });
    }

    const currentAmount = room.currentBid.amount || 0;
    const basePrice = room.currentPlayer.basePrice;

    // Calculate minimum bid requirement
    let minBid = currentAmount === 0 ? basePrice : currentAmount + 0.5;

    // If specific amount requested, validate it; else default to minBid
    let bidAmount = data.amount !== undefined && data.amount !== null && !isNaN(Number(data.amount))
      ? Number(data.amount)
      : minBid;

    bidAmount = Number(bidAmount.toFixed(2));

    if (bidAmount < minBid) {
      return socket.emit('error', {
        message: `Bid must be at least €${minBid}M (Current: €${currentAmount}M, Base: €${basePrice}M)`
      });
    }

    if (team.budget < bidAmount) {
      return socket.emit('error', {
        message: `Insufficient budget. You have €${team.budget}M remaining, bid is €${bidAmount}M.`
      });
    }

    // Valid bid placed
    room.currentBid = {
      amount: bidAmount,
      teamId: socket.id,
      teamName: team.name,
      emoji: team.emoji
    };

    // Reset timer on each bid
    room.timerRemaining = room.config.timerDuration;

    const serialized = serializeRoom(room);
    io.to(room.roomCode).emit('auction-update', serialized);
    io.to(room.roomCode).emit('timer-tick', {
      timerRemaining: room.timerRemaining,
      timeLeft: room.timerRemaining,
      seconds: room.timerRemaining,
      totalTime: room.config.timerDuration,
      roomCode: room.roomCode
    });
  };

  socket.on('place-bid', handlePlaceBid);
  socket.on('bid', handlePlaceBid);

  // 4. Skip / Pass bid (supports 'skip-bid', 'pass-bid', and 'pass')
  const handleSkipBid = (data = {}) => {
    const code = data.roomCode || data.code || currentRoomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room || room.status !== 'in-progress') return;

    const team = room.teams.get(socket.id);
    if (!team) return;

    io.to(room.roomCode).emit('team-skipped', {
      teamId: socket.id,
      teamName: team.name,
      emoji: team.emoji
    });
  };

  socket.on('skip-bid', handleSkipBid);
  socket.on('pass-bid', handleSkipBid);
  socket.on('pass', handleSkipBid);

  // 5. Next player (Host manual control or skip)
  socket.on('next-player', (data = {}) => {
    const code = data.roomCode || data.code || currentRoomCode;
    if (!code) return socket.emit('error', { message: 'Not in a room' });
    const room = rooms.get(code);
    if (!room) return socket.emit('error', { message: 'Room not found' });

    if (room.host !== socket.id) {
      return socket.emit('error', { message: 'Only host can advance to next player' });
    }

    if (room.status !== 'in-progress') {
      return socket.emit('error', { message: 'Auction is not in progress' });
    }

    // Force end current player bidding right away
    handlePlayerAuctionEnd(room);
  });

  // 6. Disconnect handler
  socket.on('disconnect', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    if (room.status === 'waiting') {
      room.teams.delete(socket.id);

      // Reassign host if host disconnected
      if (room.host === socket.id) {
        const nextTeamId = room.teams.keys().next().value || null;
        room.host = nextTeamId;
      }

      // If empty room, cleanup
      if (room.teams.size === 0) {
        clearRoomTimers(room);
        rooms.delete(currentRoomCode);
        return;
      }

      io.to(room.roomCode).emit('room-update', serializeRoom(room));
    } else {
      // During active or completed auction, mark team disconnected without erasing roster
      const team = room.teams.get(socket.id);
      if (team) {
        team.disconnected = true;
      }

      // If host left, reassign to another connected team
      if (room.host === socket.id) {
        for (const [tId, tData] of room.teams.entries()) {
          if (!tData.disconnected) {
            room.host = tId;
            break;
          }
        }
      }

      io.to(room.roomCode).emit('room-update', serializeRoom(room));
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`⚽ Football Auction Game server running on port ${PORT}`);
  console.log(`Loaded ${playersData.length} players into database.`);
});
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Store active auction rooms
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join or create room
  socket.on('join-room', ({ roomId, username }) => {
    if (!roomId || !username) return;

    socket.join(roomId);
    socket.roomId = roomId;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        host: socket.id, // First user to join is host
        players: [],
        gameStarted: false,
        currentBid: 0,
        currentHighBidder: null
      };
    }

    const player = {
      id: socket.id,
      username: username,
      isHost: rooms[roomId].host === socket.id
    };

    rooms[roomId].players.push(player);

    // Notify room of updated player list and host identity
    io.to(roomId).emit('update-room', {
      players: rooms[roomId].players,
      host: rooms[roomId].host,
      gameStarted: rooms[roomId].gameStarted
    });

    console.log(`${username} (${socket.id}) joined room ${roomId}`);
  });

  // Host starts the game
  socket.on('start-game', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.host === socket.id) {
      room.gameStarted = true;
      io.to(roomId).emit('game-started', {
        message: 'The Football Auction has officially begun!',
        roomState: room
      });
      console.log(`Game started in room ${roomId} by host ${socket.id}`);
    } else {
      socket.emit('error-message', { message: 'Only the host can start the game.' });
    }
  });

  // Handle Disconnections
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);

      // Reassign host if the host disconnects
      if (rooms[roomId].host === socket.id && rooms[roomId].players.length > 0) {
        rooms[roomId].host = rooms[roomId].players[0].id;
        rooms[roomId].players[0].isHost = true;
      }

      // Cleanup empty rooms
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('update-room', {
          players: rooms[roomId].players,
          host: rooms[roomId].host,
          gameStarted: rooms[roomId].gameStarted
        });
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Dynamic port assignment for cloud platforms like Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Football Auction Game running on port ${PORT}`);
});
