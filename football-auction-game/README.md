# Football Auction Game ⚽

A real-time multiplayer football player auction game (inspired by the IPL cricket auction game at playauctiongame.com, but crafted specifically for soccer/football managers and fans).

## Features
- **Real-Time Multiplayer**: Built with Express, HTTP, and Socket.io for live synchronisation across devices.
- **In-Memory Room State**: Zero external database dependencies required. Rooms, teams, rosters, and live bids are stored cleanly in memory.
- **Dynamic Bidding & Countdown Timer**:
  - Configurable countdown timer (default 15s per bid).
  - Every valid bid automatically resets the timer to full duration.
  - Live broadcast of timer ticks, bids, and passes.
  - Automatic transfer of player to highest bidder or unsold pool upon timer expiry with a 3-second transition delay.
- **116+ Real Football Players**:
  - **Marquee** (€15–25M): Messi, Ronaldo, Mbappé, Haaland, Vinicius Jr, Bellingham, Rodri, De Bruyne, Salah, Kane, etc.
  - **Elite** (€8–14M): Bruno Fernandes, Ødegaard, Rice, Valverde, Pedri, Saliba, Courtois, etc.
  - **Standard** (€3–7M): Darwin Núñez, Watkins, Isak, Palmer, Mac Allister, Gvardiol, etc.
  - **Budget** (€0.5–2M): Endrick, Mainoo, Arda Güler, Cubarsí, Yoro, etc.
  - Balanced position distribution across Forwards (~30%), Midfielders (~31%), Defenders (~25%), and Goalkeepers (~14%).
- **Two Game Modes**:
  - **Mini Auction**: 25 curated stars across all tiers for quick 15-minute game sessions.
  - **Full Auction**: 115+ player pool for deep squad-building masterclasses.
- **Dual UI Support**:
  - Interactive client app with landing screen (`public/index.html`) and dedicated live auction room (`public/room.html`) featuring Web Audio sound effects, circular progress timers, and squad management.

---

## Getting Started

### 1. Install Dependencies
```bash
cd /Users/daniyyy/.gemini/antigravity/scratch/football-auction-game
npm install
```

### 2. Start the Server
```bash
npm start
# or
node server.js
```
The server will start on port `3000` (or `process.env.PORT`).

### 3. Play
Open your browser and navigate to:
```
http://localhost:3000
```
- Click **"+ Create Auction"** to set budget, timer, and max teams, then share the 6-character room code with friends.
- Friends can click **"Join Room"**, enter the 6-character room code, pick their club crest and name, and begin bidding!

---

## API Endpoints

### REST API
- `POST /api/create-room` (or `POST /api/rooms`)
  - Request Body:
    ```json
    {
      "budget": 100,
      "timerDuration": 15,
      "maxTeams": 6,
      "auctionType": "full"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "roomId": "uuid-v4",
      "roomCode": "A7K9X2",
      "config": { ... }
    }
    ```
- `GET /api/room/:roomCode` (or `GET /api/rooms/:roomCode`)
  - Response: Full serialized room state including teams, current player, current bid, and rosters.
- `GET /api/players`
  - Returns the list of 116 real football players.

### Socket.io Events

#### Client → Server
- `join-room` / `join` `{ roomCode, teamName, emoji }` — Join room and select club crest.
- `start-auction` / `startAuction` — Host starts auction and initializes player pool.
- `place-bid` / `bid` `{ amount }` — Place a bid. Resets timer to full duration.
- `skip-bid` / `pass-bid` / `pass` — Pass on current player.
- `next-player` — Host manually advances to next player.

#### Server → Client
- `room-update` — Updated room state (teams, connection count, host).
- `auction-update` — Current player spotlight, current highest bid and bidder.
- `timer-tick` `{ timerRemaining }` — Emitted every 1 second.
- `player-sold` `{ player, team, price }` — Emitted when timer hits 0 with active bids.
- `player-unsold` `{ player }` — Emitted when timer hits 0 with no bids.
- `auction-complete` `{ soldPlayers, unsoldPlayers, teams }` — Emitted when player pool finishes.
- `error` `{ message }` — Validation or state errors.
