/**
 * FOOTBALL AUCTION GAME - CLIENT APPLICATION
 * Handles landing page interactions, real-time Socket.io communication,
 * Web Audio API synthesized sound effects, circular timer rendering,
 * bidding mechanics, and responsive sidebar tabs.
 */

// =============================================================================
// GLOBAL CONFIGURATION & CONSTANTS
// =============================================================================
const EMOJIS = [
  '⚽', '🏆', '🦁', '🐯', '🦅', '🔥', '💎', '⭐', '🛡️', '⚡',
  '🌟', '🎯', '🏅', '🐺', '🦊', '🐉', '🌊', '💪', '🎭', '🏟️'
];

const TIMER_CIRCUMFERENCE = 2 * Math.PI * 72; // ~452.39 px for r=72

// Rich default player database for robust offline testing, demo mode & sidebar pool
const DEFAULT_PLAYERS_POOL = [
  { id: 1, name: 'Erling Haaland', initials: 'EH', pos: 'FWD', posFull: 'Striker (ST)', nat: 'Norway', flag: '🇳🇴', club: 'Manchester City', age: 24, rating: 5, ovr: 91, basePrice: 35, tier: 'Marquee' },
  { id: 2, name: 'Kylian Mbappé', initials: 'KM', pos: 'FWD', posFull: 'Forward (LW/ST)', nat: 'France', flag: '🇫🇷', club: 'Real Madrid', age: 25, rating: 5, ovr: 91, basePrice: 35, tier: 'Marquee' },
  { id: 3, name: 'Vinícius Júnior', initials: 'VJ', pos: 'FWD', posFull: 'Winger (LW)', nat: 'Brazil', flag: '🇧🇷', club: 'Real Madrid', age: 24, rating: 5, ovr: 90, basePrice: 30, tier: 'Marquee' },
  { id: 4, name: 'Jude Bellingham', initials: 'JB', pos: 'MID', posFull: 'Central Mid (CAM)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Real Madrid', age: 21, rating: 5, ovr: 90, basePrice: 30, tier: 'Marquee' },
  { id: 5, name: 'Rodri', initials: 'RO', pos: 'MID', posFull: 'Defensive Mid (CDM)', nat: 'Spain', flag: '🇪🇸', club: 'Manchester City', age: 28, rating: 5, ovr: 91, basePrice: 30, tier: 'Marquee' },
  { id: 6, name: 'Kevin De Bruyne', initials: 'KD', pos: 'MID', posFull: 'Playmaker (CAM)', nat: 'Belgium', flag: '🇧🇪', club: 'Manchester City', age: 33, rating: 5, ovr: 90, basePrice: 25, tier: 'Elite' },
  { id: 7, name: 'Harry Kane', initials: 'HK', pos: 'FWD', posFull: 'Striker (ST)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Bayern Munich', age: 31, rating: 5, ovr: 90, basePrice: 28, tier: 'Marquee' },
  { id: 8, name: 'Mohamed Salah', initials: 'MS', pos: 'FWD', posFull: 'Winger (RW)', nat: 'Egypt', flag: '🇪🇬', club: 'Liverpool', age: 32, rating: 5, ovr: 89, basePrice: 25, tier: 'Elite' },
  { id: 9, name: 'Virgil van Dijk', initials: 'VD', pos: 'DEF', posFull: 'Center Back (CB)', nat: 'Netherlands', flag: '🇳🇱', club: 'Liverpool', age: 33, rating: 5, ovr: 89, basePrice: 22, tier: 'Elite' },
  { id: 10, name: 'Rúben Dias', initials: 'RD', pos: 'DEF', posFull: 'Center Back (CB)', nat: 'Portugal', flag: '🇵🇹', club: 'Manchester City', age: 27, rating: 4, ovr: 88, basePrice: 20, tier: 'Elite' },
  { id: 11, name: 'William Saliba', initials: 'WS', pos: 'DEF', posFull: 'Center Back (CB)', nat: 'France', flag: '🇫🇷', club: 'Arsenal', age: 23, rating: 4, ovr: 87, basePrice: 18, tier: 'Elite' },
  { id: 12, name: 'Thibaut Courtois', initials: 'TC', pos: 'GK', posFull: 'Goalkeeper (GK)', nat: 'Belgium', flag: '🇧🇪', club: 'Real Madrid', age: 32, rating: 5, ovr: 89, basePrice: 18, tier: 'Elite' },
  { id: 13, name: 'Alisson Becker', initials: 'AB', pos: 'GK', posFull: 'Goalkeeper (GK)', nat: 'Brazil', flag: '🇧🇷', club: 'Liverpool', age: 31, rating: 5, ovr: 89, basePrice: 18, tier: 'Elite' },
  { id: 14, name: 'Bukayo Saka', initials: 'BS', pos: 'FWD', posFull: 'Winger (RW)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Arsenal', age: 23, rating: 4, ovr: 87, basePrice: 20, tier: 'Elite' },
  { id: 15, name: 'Florian Wirtz', initials: 'FW', pos: 'MID', posFull: 'Attacking Mid (CAM)', nat: 'Germany', flag: '🇩🇪', club: 'Bayer Leverkusen', age: 21, rating: 4, ovr: 88, basePrice: 22, tier: 'Elite' },
  { id: 16, name: 'Jamal Musiala', initials: 'JM', pos: 'MID', posFull: 'Attacking Mid (CAM)', nat: 'Germany', flag: '🇩🇪', club: 'Bayern Munich', age: 21, rating: 4, ovr: 87, basePrice: 20, tier: 'Elite' },
  { id: 17, name: 'Federico Valverde', initials: 'FV', pos: 'MID', posFull: 'Box-to-Box (CM)', nat: 'Uruguay', flag: '🇺🇾', club: 'Real Madrid', age: 26, rating: 4, ovr: 88, basePrice: 20, tier: 'Elite' },
  { id: 18, name: 'Lamine Yamal', initials: 'LY', pos: 'FWD', posFull: 'Winger (RW)', nat: 'Spain', flag: '🇪🇸', club: 'Barcelona', age: 17, rating: 4, ovr: 85, basePrice: 20, tier: 'Elite' },
  { id: 19, name: 'Theo Hernández', initials: 'TH', pos: 'DEF', posFull: 'Left Back (LB)', nat: 'France', flag: '🇫🇷', club: 'AC Milan', age: 26, rating: 4, ovr: 86, basePrice: 16, tier: 'Standard' },
  { id: 20, name: 'Alessandro Bastoni', initials: 'AB', pos: 'DEF', posFull: 'Center Back (CB)', nat: 'Italy', flag: '🇮🇹', club: 'Inter Milan', age: 25, rating: 4, ovr: 86, basePrice: 15, tier: 'Standard' },
  { id: 21, name: 'Gianluigi Donnarumma', initials: 'GD', pos: 'GK', posFull: 'Goalkeeper (GK)', nat: 'Italy', flag: '🇮🇹', club: 'Paris Saint-Germain', age: 25, rating: 4, ovr: 87, basePrice: 16, tier: 'Elite' },
  { id: 22, name: 'Cole Palmer', initials: 'CP', pos: 'MID', posFull: 'Attacking Mid (CAM)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Chelsea', age: 22, rating: 4, ovr: 85, basePrice: 15, tier: 'Standard' },
  { id: 23, name: 'Phil Foden', initials: 'PF', pos: 'MID', posFull: 'Winger / Mid (RW/CAM)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Manchester City', age: 24, rating: 4, ovr: 88, basePrice: 22, tier: 'Elite' },
  { id: 24, name: 'Declan Rice', initials: 'DR', pos: 'MID', posFull: 'Defensive Mid (CDM)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Arsenal', age: 25, rating: 4, ovr: 87, basePrice: 18, tier: 'Elite' },
  { id: 25, name: 'Martin Ødegaard', initials: 'MO', pos: 'MID', posFull: 'Attacking Mid (CAM)', nat: 'Norway', flag: '🇳🇴', club: 'Arsenal', age: 25, rating: 4, ovr: 88, basePrice: 20, tier: 'Elite' },
  { id: 26, name: 'Lautaro Martínez', initials: 'LM', pos: 'FWD', posFull: 'Striker (ST)', nat: 'Argentina', flag: '🇦🇷', club: 'Inter Milan', age: 27, rating: 5, ovr: 89, basePrice: 25, tier: 'Elite' },
  { id: 27, name: 'Son Heung-min', initials: 'SH', pos: 'FWD', posFull: 'Winger (LW)', nat: 'South Korea', flag: '🇰🇷', club: 'Tottenham', age: 32, rating: 4, ovr: 87, basePrice: 18, tier: 'Standard' },
  { id: 28, name: 'Trent Alexander-Arnold', initials: 'TA', pos: 'DEF', posFull: 'Right Back (RB)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Liverpool', age: 25, rating: 4, ovr: 86, basePrice: 16, tier: 'Standard' },
  { id: 29, name: 'Antonio Rüdiger', initials: 'AR', pos: 'DEF', posFull: 'Center Back (CB)', nat: 'Germany', flag: '🇩🇪', club: 'Real Madrid', age: 31, rating: 4, ovr: 87, basePrice: 16, tier: 'Standard' },
  { id: 30, name: 'Achraf Hakimi', initials: 'AH', pos: 'DEF', posFull: 'Right Back (RB)', nat: 'Morocco', flag: '🇲🇦', club: 'Paris Saint-Germain', age: 25, rating: 4, ovr: 84, basePrice: 14, tier: 'Standard' },
  { id: 31, name: 'Emiliano Martínez', initials: 'EM', pos: 'GK', posFull: 'Goalkeeper (GK)', nat: 'Argentina', flag: '🇦🇷', club: 'Aston Villa', age: 32, rating: 4, ovr: 86, basePrice: 14, tier: 'Standard' },
  { id: 32, name: 'Ederson', initials: 'ED', pos: 'GK', posFull: 'Goalkeeper (GK)', nat: 'Brazil', flag: '🇧🇷', club: 'Manchester City', age: 31, rating: 4, ovr: 88, basePrice: 16, tier: 'Standard' },
  { id: 33, name: 'Rafael Leão', initials: 'RL', pos: 'FWD', posFull: 'Winger (LW)', nat: 'Portugal', flag: '🇵🇹', club: 'AC Milan', age: 25, rating: 4, ovr: 86, basePrice: 16, tier: 'Standard' },
  { id: 34, name: 'Bruno Fernandes', initials: 'BF', pos: 'MID', posFull: 'Attacking Mid (CAM)', nat: 'Portugal', flag: '🇵🇹', club: 'Manchester United', age: 30, rating: 4, ovr: 87, basePrice: 17, tier: 'Standard' },
  { id: 35, name: 'Bernardo Silva', initials: 'BS', pos: 'MID', posFull: 'Midfielder (CM/RW)', nat: 'Portugal', flag: '🇵🇹', club: 'Manchester City', age: 30, rating: 4, ovr: 88, basePrice: 18, tier: 'Standard' },
  { id: 36, name: 'Alphonso Davies', initials: 'AD', pos: 'DEF', posFull: 'Left Back (LB)', nat: 'Canada', flag: '🇨🇦', club: 'Bayern Munich', age: 23, rating: 4, ovr: 85, basePrice: 15, tier: 'Standard' },
  { id: 37, name: 'Josko Gvardiol', initials: 'JG', pos: 'DEF', posFull: 'Center / Left Back', nat: 'Croatia', flag: '🇭🇷', club: 'Manchester City', age: 22, rating: 3, ovr: 83, basePrice: 14, tier: 'Standard' },
  { id: 38, name: 'Kobbie Mainoo', initials: 'KM', pos: 'MID', posFull: 'Central Mid (CM)', nat: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Manchester United', age: 19, rating: 3, ovr: 79, basePrice: 8, tier: 'Budget' },
  { id: 39, name: 'Pau Cubarsí', initials: 'PC', pos: 'DEF', posFull: 'Center Back (CB)', nat: 'Spain', flag: '🇪🇸', club: 'Barcelona', age: 17, rating: 3, ovr: 78, basePrice: 7, tier: 'Budget' },
  { id: 40, name: 'Arda Güler', initials: 'AG', pos: 'MID', posFull: 'Attacking Mid (CAM)', nat: 'Turkey', flag: '🇹🇷', club: 'Real Madrid', age: 19, rating: 3, ovr: 78, basePrice: 8, tier: 'Budget' }
];

// =============================================================================
// WEB AUDIO API SOUND SYSTEM
// =============================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('football_auction_sound_enabled') !== 'false';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('football_auction_sound_enabled', this.enabled);
    return this.enabled;
  }

  playTick(isUrgent = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 1100 : 800, now);
      osc.frequency.exponentialRampToValueAtTime(isUrgent ? 700 : 400, now + 0.04);

      gain.gain.setValueAtTime(isUrgent ? 0.35 : 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  playBid() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playSold() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Part 1: Gavel strike thud
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(140, now);
      thudOsc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      thudGain.gain.setValueAtTime(0.5, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.15);

      // Part 2: Victory bell chords (C6, E6, G6)
      const notes = [1046.5, 1318.5, 1567.98];
      notes.forEach((freq, idx) => {
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const noteDelay = now + 0.08 + idx * 0.06;

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, noteDelay);

        noteGain.gain.setValueAtTime(0.22, noteDelay);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteDelay + 0.6);

        noteOsc.connect(noteGain);
        noteGain.connect(this.ctx.destination);

        noteOsc.start(noteDelay);
        noteOsc.stop(noteDelay + 0.65);
      });
    } catch (e) {}
  }

  playUnsold() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.exponentialRampToValueAtTime(261.6, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

const sounds = new SoundFX();

// Auto unlock audio on any user interaction
document.addEventListener('click', () => sounds.init(), { once: true });
document.addEventListener('keydown', () => sounds.init(), { once: true });

// =============================================================================
// TOAST NOTIFICATION UTILITY
// =============================================================================
function showToast(message, type = 'info', durationMs = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = {
    success: '✅',
    error: '⚠️',
    warning: '⏳',
    info: 'ℹ️'
  }[type] || 'ℹ️';

  toast.innerHTML = `<span>${icon}</span><span style="flex-grow: 1;">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

// =============================================================================
// CSS CONFETTI GENERATOR
// =============================================================================
function launchConfetti(containerId = 'confetti-container', count = 45) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#38bdf8', '#c084fc', '#f43f5e', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${Math.floor(Math.random() * 7 + 6)}px`;
    piece.style.height = `${Math.floor(Math.random() * 12 + 10)}px`;
    piece.style.animationDuration = `${(Math.random() * 1.5 + 1.8).toFixed(2)}s`;
    piece.style.animationDelay = `${(Math.random() * 0.3).toFixed(2)}s`;
    piece.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
    container.appendChild(piece);
  }
}

// =============================================================================
// REAL CLUBS DATABASE
// =============================================================================
const REAL_CLUBS = [
  { id: 'rma', name: 'Real Madrid', short: 'RMA', badge: '👑', color: '#E5A823', league: 'La Liga 🇪🇸' },
  { id: 'fcb', name: 'FC Barcelona', short: 'BAR', badge: '🔵🔴', color: '#EDBB00', league: 'La Liga 🇪🇸' },
  { id: 'mci', name: 'Manchester City', short: 'MCI', badge: '⚡', color: '#6CABDD', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'ars', name: 'Arsenal', short: 'ARS', badge: '🔴⚪', color: '#EF0107', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'liv', name: 'Liverpool', short: 'LIV', badge: '🦅', color: '#C8102E', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'mun', name: 'Manchester United', short: 'MUN', badge: '👹', color: '#DA291C', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'che', name: 'Chelsea', short: 'CHE', badge: '🦁', color: '#034694', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'bay', name: 'Bayern Munich', short: 'BAY', badge: '⭐', color: '#DC052D', league: 'Bundesliga 🇩🇪' },
  { id: 'psg', name: 'Paris Saint-Germain', short: 'PSG', badge: '🗼', color: '#38BDF8', league: 'Ligue 1 🇫🇷' },
  { id: 'int', name: 'Inter Milan', short: 'INT', badge: '🐍', color: '#0068A8', league: 'Serie A 🇮🇹' },
  { id: 'acm', name: 'AC Milan', short: 'ACM', badge: '🔴⚫', color: '#FB090B', league: 'Serie A 🇮🇹' },
  { id: 'juv', name: 'Juventus', short: 'JUV', badge: '🦓', color: '#E4E4E7', league: 'Serie A 🇮🇹' },
  { id: 'bvb', name: 'Borussia Dortmund', short: 'BVB', badge: '🐝', color: '#FDE100', league: 'Bundesliga 🇩🇪' },
  { id: 'atm', name: 'Atlético Madrid', short: 'ATM', badge: '🛡️', color: '#CB3524', league: 'La Liga 🇪🇸' },
  { id: 'tot', name: 'Tottenham Hotspur', short: 'TOT', badge: '🐓', color: '#818CF8', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'b04', name: 'Bayer Leverkusen', short: 'B04', badge: '🦁', color: '#E32221', league: 'Bundesliga 🇩🇪' },
  { id: 'avl', name: 'Aston Villa', short: 'AVL', badge: '🦁', color: '#95BFE5', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'new', name: 'Newcastle United', short: 'NEW', badge: '🦅', color: '#38BDF8', league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'custom', name: 'Custom Club', short: 'CUSTOM', badge: '✏️', color: '#10B981', league: 'Custom Team ⚽' }
];

// =============================================================================
// REAL CLUB PICKER HELPER
// =============================================================================
function setupClubPicker(containerId, nameInputId, emojiInputId, clubIdInputId, previewPrefix, initialClubId = 'rma', takenClubNames = []) {
  const container = document.getElementById(containerId);
  const nameInput = document.getElementById(nameInputId);
  const emojiInput = document.getElementById(emojiInputId);
  const clubIdInput = document.getElementById(clubIdInputId);
  const customBox = document.getElementById(`${previewPrefix}-custom-club-box`);
  const customNameInput = document.getElementById(`${previewPrefix}-custom-team-name`);

  const previewName = document.getElementById(`${previewPrefix}-team-name-preview`);
  const previewEmoji = document.getElementById(`${previewPrefix}-emoji-preview`);
  const previewLeague = document.getElementById(`${previewPrefix}-league-preview`);
  const previewShort = document.getElementById(`${previewPrefix}-short-preview`);
  const previewBanner = document.getElementById(`${previewPrefix}-club-preview-banner`);

  if (!container || !nameInput || !emojiInput) return;

  container.innerHTML = '';

  let activeClub = REAL_CLUBS.find(c => c.id === initialClubId) || REAL_CLUBS[0];

  function applyClub(club) {
    activeClub = club;
    if (club.id === 'custom') {
      if (customBox) customBox.style.display = 'block';
      const custName = (customNameInput && customNameInput.value.trim()) || 'Custom XI';
      nameInput.value = custName;
      emojiInput.value = '⚽';
      if (clubIdInput) clubIdInput.value = 'custom';

      if (previewName) previewName.textContent = custName;
      if (previewEmoji) previewEmoji.textContent = '⚽';
      if (previewLeague) previewLeague.textContent = 'Custom Manager Club';
      if (previewShort) {
        previewShort.textContent = 'CUST';
        previewShort.style.color = 'var(--accent-light)';
      }
      if (previewBanner) {
        previewBanner.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        previewBanner.style.background = 'rgba(16, 185, 129, 0.1)';
      }
    } else {
      if (customBox) customBox.style.display = 'none';
      nameInput.value = club.name;
      emojiInput.value = club.badge;
      if (clubIdInput) clubIdInput.value = club.id;

      if (previewName) previewName.textContent = club.name;
      if (previewEmoji) previewEmoji.textContent = club.badge;
      if (previewLeague) previewLeague.textContent = club.league;
      if (previewShort) {
        previewShort.textContent = club.short;
        previewShort.style.color = club.color;
      }
      if (previewBanner) {
        previewBanner.style.borderColor = club.color;
        previewBanner.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    }
  }

  if (customNameInput) {
    customNameInput.addEventListener('input', () => {
      if (activeClub && activeClub.id === 'custom') {
        const val = customNameInput.value.trim() || 'Custom XI';
        nameInput.value = val;
        if (previewName) previewName.textContent = val;
      }
    });
  }

  REAL_CLUBS.forEach(club => {
    const isTaken = club.id !== 'custom' && takenClubNames.includes(club.name);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `club-card-btn ${club.id === initialClubId ? 'selected' : ''} ${isTaken ? 'is-taken' : ''}`;
    btn.style.setProperty('--club-accent', club.color);
    btn.disabled = isTaken;
    btn.setAttribute('aria-label', `Select club ${club.name}`);

    btn.innerHTML = `
      <span class="club-card-badge">${club.badge}</span>
      <div class="club-card-info">
        <div class="club-card-name">${club.name}</div>
        <div class="club-card-sub">
          <span class="club-card-short">${club.short}</span>
          <span>•</span>
          <span>${club.league.split(' ')[0]}</span>
        </div>
      </div>
      ${isTaken ? '<span class="club-taken-tag">TAKEN</span>' : ''}
    `;

    btn.addEventListener('click', () => {
      if (isTaken) return;
      container.querySelectorAll('.club-card-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      applyClub(club);
    });

    container.appendChild(btn);
  });

  applyClub(activeClub);
}

// Legacy emoji picker backward compatibility helper
function setupEmojiPicker(containerId, inputId, previewId, initialEmoji = '🦁') {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!container || !input) return;

  container.innerHTML = '';
  input.value = initialEmoji;
  if (preview) preview.textContent = initialEmoji;

  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `emoji-btn ${emoji === initialEmoji ? 'selected' : ''}`;
    btn.textContent = emoji;
    btn.setAttribute('aria-label', `Select emoji ${emoji}`);

    btn.addEventListener('click', () => {
      container.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      input.value = emoji;
      if (preview) preview.textContent = emoji;
    });

    container.appendChild(btn);
  });
}

// =============================================================================
// SOCKET.IO SAFE INITIALIZATION
// =============================================================================
function getSocketInstance() {
  if (typeof io !== 'undefined' && window.location.protocol.startsWith('http')) {
    try {
      return io({ timeout: 2500, reconnectionAttempts: 1 });
    } catch (e) {
      return null;
    }
  }
  return null;
}

// =============================================================================
// LANDING PAGE CONTROLLER (index.html)
// =============================================================================
function initLandingPage() {
  // Modal Elements
  const modalCreate = document.getElementById('modal-create-room');
  const modalJoin = document.getElementById('modal-join-room');
  const btnOpenCreate = document.getElementById('btn-open-create-modal');
  const btnOpenJoin = document.getElementById('btn-open-join-modal');

  // Real Clubs Pickers
  setupClubPicker('create-club-picker', 'create-team-name', 'create-selected-emoji', 'create-selected-club-id', 'create', 'rma');
  setupClubPicker('join-club-picker', 'join-team-name', 'join-selected-emoji', 'join-selected-club-id', 'join', 'fcb');

  // Modal Open Handlers
  if (btnOpenCreate && modalCreate) {
    btnOpenCreate.addEventListener('click', () => {
      modalCreate.classList.add('active');
      document.getElementById('create-team-name')?.focus();
    });
  }

  if (btnOpenJoin && modalJoin) {
    btnOpenJoin.addEventListener('click', () => {
      modalJoin.classList.add('active');
      document.getElementById('join-room-code')?.focus();
    });
  }

  // Close modals on close button or backdrop click
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      modalCreate?.classList.remove('active');
      modalJoin?.classList.remove('active');
    });
  });

  [modalCreate, modalJoin].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalCreate?.classList.remove('active');
      modalJoin?.classList.remove('active');
    }
  });

  // FORM 1: Create Room
  const formCreate = document.getElementById('form-create-room');
  if (formCreate) {
    formCreate.addEventListener('submit', async (e) => {
      e.preventDefault();
      const teamName = document.getElementById('create-team-name').value.trim();
      const teamEmoji = document.getElementById('create-selected-emoji').value;
      const budget = parseInt(document.getElementById('create-budget').value, 10) || 100;
      const bidTimer = parseInt(document.getElementById('create-timer').value, 10) || 15;
      const maxTeams = parseInt(document.getElementById('create-max-teams').value, 10) || 4;
      const auctionType = document.getElementById('create-auction-type').value || 'full';

      if (!teamName) {
        showToast('Please enter a team name', 'error');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-create');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating Room...</span>';
      }

      let roomCode = null;

      // Attempt backend API call
      try {
        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName,
            teamEmoji,
            budget,
            bidTimer,
            maxTeams,
            auctionType
          })
        });

        if (response.ok) {
          const data = await response.json();
          roomCode = data.code || data.roomCode || (data.room && data.room.code);
        }
      } catch (err) {
        console.warn('Backend REST endpoint /api/rooms unavailable, using client room code generation:', err);
      }

      // Fallback code generation if backend REST endpoint is not yet mounted
      if (!roomCode) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        roomCode = '';
        for (let i = 0; i < 6; i++) {
          roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }

      // Store current user identity and room preferences
      const profile = {
        teamName,
        teamEmoji,
        isHost: true,
        budget,
        bidTimer,
        maxTeams,
        auctionType
      };
      sessionStorage.setItem(`auction_user_${roomCode}`, JSON.stringify(profile));
      localStorage.setItem(`auction_user_${roomCode}`, JSON.stringify(profile));
      sessionStorage.setItem('last_room_code', roomCode);

      showToast(`Room ${roomCode} created! Entering lobby...`, 'success', 1500);

      setTimeout(() => {
        window.location.href = `room.html?code=${encodeURIComponent(roomCode)}`;
      }, 500);
    });
  }

  // FORM 2: Join Room
  const formJoin = document.getElementById('form-join-room');
  if (formJoin) {
    formJoin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const roomCode = document.getElementById('join-room-code').value.trim().toUpperCase();
      const teamName = document.getElementById('join-team-name').value.trim();
      const teamEmoji = document.getElementById('join-selected-emoji').value;

      if (!roomCode || roomCode.length < 3) {
        showToast('Please enter a valid room code', 'error');
        return;
      }
      if (!teamName) {
        showToast('Please enter your team name', 'error');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-join');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Joining...</span>';
      }

      // Save user identity
      const profile = {
        teamName,
        teamEmoji,
        isHost: false
      };
      sessionStorage.setItem(`auction_user_${roomCode}`, JSON.stringify(profile));
      localStorage.setItem(`auction_user_${roomCode}`, JSON.stringify(profile));
      sessionStorage.setItem('last_room_code', roomCode);

      showToast(`Joining room ${roomCode}...`, 'info', 1500);

      setTimeout(() => {
        window.location.href = `room.html?code=${encodeURIComponent(roomCode)}`;
      }, 400);
    });
  }
}

// =============================================================================
// AUCTION ROOM CONTROLLER (room.html)
// =============================================================================
function initRoomPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomCode = (urlParams.get('code') || '').trim().toUpperCase();

  if (!roomCode) {
    showToast('No room code provided. Returning to home...', 'error');
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    return;
  }

  // Display Room Code in header
  const displayRoomCode = document.getElementById('display-room-code');
  if (displayRoomCode) displayRoomCode.textContent = roomCode;

  // Share URL
  let shareableUrl = `${window.location.origin}/room.html?code=${roomCode}`;
  if (window.location.protocol === 'file:') {
    shareableUrl = `${window.location.href.split('?')[0]}?code=${roomCode}`;
  }
  const shareLinkText = document.getElementById('shareable-link-text');
  if (shareLinkText) shareLinkText.textContent = shareableUrl;

  // Sound Toggle Button
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  if (btnSoundToggle) {
    btnSoundToggle.textContent = sounds.enabled ? '🔊' : '🔇';
    btnSoundToggle.classList.toggle('muted', !sounds.enabled);
    btnSoundToggle.addEventListener('click', () => {
      const isEnabled = sounds.toggle();
      btnSoundToggle.textContent = isEnabled ? '🔊' : '🔇';
      btnSoundToggle.classList.toggle('muted', !isEnabled);
      showToast(isEnabled ? 'Sound effects enabled' : 'Sound effects muted', 'info', 1500);
    });
  }

  // Copy Room Code & Link Handler
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnShareNative = document.getElementById('btn-share-native');

  function copyRoomLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl).then(() => {
        showToast('Invite link copied to clipboard! 📋', 'success');
      }).catch(() => fallbackCopy(shareableUrl));
    } else {
      fallbackCopy(shareableUrl);
    }
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('Invite link copied! 📋', 'success');
  }

  if (btnCopyCode) btnCopyCode.addEventListener('click', copyRoomLink);
  if (btnCopyLink) btnCopyLink.addEventListener('click', copyRoomLink);

  if (btnShareNative) {
    if (navigator.share) {
      btnShareNative.style.display = 'inline-flex';
      btnShareNative.addEventListener('click', () => {
        navigator.share({
          title: 'Join Football Auction Game',
          text: `Join my live football player auction room: ${roomCode}`,
          url: shareableUrl
        }).catch(() => {});
      });
    }
  }

  // Leave Room Button
  const btnLeaveRoom = document.getElementById('btn-leave-room');
  if (btnLeaveRoom) {
    btnLeaveRoom.addEventListener('click', () => {
      if (confirm('Are you sure you want to leave this auction room?')) {
        window.location.href = 'index.html';
      }
    });
  }

  // Mobile Sidebar Toggle
  const btnMobileSidebar = document.getElementById('btn-mobile-sidebar');
  const sidebar = document.getElementById('auction-sidebar');
  if (btnMobileSidebar && sidebar) {
    btnMobileSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      btnMobileSidebar.textContent = sidebar.classList.contains('mobile-open') ? '✕ Close Squads' : '📋 Squads & Stats';
    });
  }

  // Sidebar Tab Navigation
  const tabButtons = document.querySelectorAll('.sidebar-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPane = document.getElementById(btn.getAttribute('data-tab'));
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // State Store
  const state = {
    roomCode,
    currentUser: null,
    isHost: false,
    status: 'waiting', // 'waiting' | 'live' | 'complete'
    connectedCount: 1,
    maxTeams: 4,
    startingBudget: 100,
    bidTimerDuration: 15,
    timerSeconds: 15,
    teams: [],
    players: [...DEFAULT_PLAYERS_POOL],
    history: [],
    currentPlayer: DEFAULT_PLAYERS_POOL[0],
    currentBid: DEFAULT_PLAYERS_POOL[0].basePrice,
    currentBidder: null,
    playerIndex: 1,
    totalPlayers: DEFAULT_PLAYERS_POOL.length,
    activePosFilter: 'ALL',
    searchQuery: '',
    timerInterval: null
  };

  // Load User Profile or prompt direct join modal
  const storedUserJson = sessionStorage.getItem(`auction_user_${roomCode}`) || localStorage.getItem(`auction_user_${roomCode}`);
  if (storedUserJson) {
    try {
      state.currentUser = JSON.parse(storedUserJson);
      state.isHost = !!state.currentUser.isHost;
      if (state.currentUser.budget) state.startingBudget = state.currentUser.budget;
      if (state.currentUser.bidTimer) state.bidTimerDuration = state.currentUser.bidTimer;
      if (state.currentUser.maxTeams) state.maxTeams = state.currentUser.maxTeams;
    } catch (e) {
      state.currentUser = null;
    }
  }

  // If no user profile found, prompt Direct Join modal
  const modalDirectJoin = document.getElementById('modal-direct-join');
  if (!state.currentUser && modalDirectJoin) {
    modalDirectJoin.classList.add('active');
    const badge = document.getElementById('direct-room-code-badge');
    const takenClubs = state.teams.map(t => t.name);
    setupClubPicker('direct-club-picker', 'direct-team-name', 'direct-selected-emoji', 'direct-selected-club-id', 'direct', 'mci', takenClubs);

    const formDirect = document.getElementById('form-direct-join');
    if (formDirect) {
      formDirect.addEventListener('submit', (e) => {
        e.preventDefault();
        const teamName = document.getElementById('direct-team-name').value.trim();
        const teamEmoji = document.getElementById('direct-selected-emoji').value;
        if (!teamName) return;

        state.currentUser = {
          teamName,
          teamEmoji,
          isHost: false
        };
        sessionStorage.setItem(`auction_user_${roomCode}`, JSON.stringify(state.currentUser));
        localStorage.setItem(`auction_user_${roomCode}`, JSON.stringify(state.currentUser));
        modalDirectJoin.classList.remove('active');
        connectSocket();
        renderHeaderUserInfo();
      });
    }
  } else {
    renderHeaderUserInfo();
    connectSocket();
  }

  function renderHeaderUserInfo() {
    if (!state.currentUser) return;
    const nameEl = document.getElementById('my-team-name');
    const emojiEl = document.getElementById('my-team-emoji');
    const budgetEl = document.getElementById('my-team-budget');

    if (nameEl) nameEl.textContent = state.currentUser.teamName;
    if (emojiEl) emojiEl.textContent = state.currentUser.teamEmoji;
    const myTeam = state.teams.find(t => t.name === state.currentUser.teamName);
    const remBudget = myTeam ? myTeam.budget : state.startingBudget;
    if (budgetEl) budgetEl.textContent = `€${remBudget}M`;
  }

  // ===========================================================================
  // UI RENDERERS
  // ===========================================================================

  // 1. Render Waiting Lobby
  function renderWaitingLobby() {
    const listEl = document.getElementById('lobby-teams-list');
    const countEl = document.getElementById('waiting-count');
    const maxEl = document.getElementById('waiting-max');
    const settingsEl = document.getElementById('waiting-room-settings-desc');
    const hostControls = document.getElementById('host-controls');
    const nonHostMsg = document.getElementById('non-host-waiting-msg');

    if (countEl) countEl.textContent = state.teams.length;
    if (maxEl) maxEl.textContent = state.maxTeams;

    if (settingsEl) {
      settingsEl.textContent = `Settings: €${state.startingBudget}M Budget • ${state.bidTimerDuration}s Timer • ${state.totalPlayers} Players`;
    }

    // Toggle Host Start Controls
    if (hostControls && nonHostMsg) {
      if (state.isHost) {
        hostControls.style.display = 'block';
        nonHostMsg.style.display = 'none';
      } else {
        hostControls.style.display = 'none';
        nonHostMsg.style.display = 'block';
      }
    }

    if (!listEl) return;
    listEl.innerHTML = '';

    // Render joined clubs
    state.teams.forEach(team => {
      const card = document.createElement('div');
      const isMe = state.currentUser && team.name === state.currentUser.teamName;
      card.className = `lobby-team-card ${isMe ? 'is-me' : ''}`;
      card.innerHTML = `
        <span class="team-emoji-lg">${team.emoji || '⚽'}</span>
        <div class="lobby-team-info">
          <div class="lobby-team-name">${team.name} ${isMe ? '<span style="color: var(--accent-light); font-size: 11px;">(You)</span>' : ''}</div>
          <div class="lobby-team-status">
            ${team.isHost ? '<span style="color: #fbbf24;">👑 Host</span>' : '<span style="color: var(--color-success);">Ready</span>'}
          </div>
        </div>
      `;
      listEl.appendChild(card);
    });

    // Render empty waiting slots
    const emptySlotsCount = Math.max(0, state.maxTeams - state.teams.length);
    for (let i = 0; i < emptySlotsCount; i++) {
      const slot = document.createElement('div');
      slot.className = 'lobby-slot-empty';
      slot.innerHTML = `<span>⏳</span><span>Waiting for manager...</span>`;
      listEl.appendChild(slot);
    }
  }

  // 2. Render Current Player Stage
  function renderCurrentPlayer() {
    const p = state.currentPlayer;
    if (!p) return;

    const cardContainer = document.getElementById('player-card-container');
    const avatar = document.getElementById('player-avatar');
    const nameEl = document.getElementById('player-name');
    const flagEl = document.getElementById('player-flag');
    const natEl = document.getElementById('player-nationality');
    const clubEl = document.getElementById('player-club');
    const ageEl = document.getElementById('player-age');
    const starsEl = document.getElementById('player-rating-stars');
    const ovrEl = document.getElementById('player-overall-rating');
    const basePriceEl = document.getElementById('player-base-price');
    const posTag = document.getElementById('player-position-tag');
    const posFullEl = document.getElementById('player-position-full');
    const tierBadge = document.getElementById('player-tier-badge');
    const indexEl = document.getElementById('current-player-index');
    const totalEl = document.getElementById('total-players-count');

    if (indexEl) indexEl.textContent = state.playerIndex;
    if (totalEl) totalEl.textContent = state.totalPlayers;

    const tierClass = `tier-${(p.tier || 'standard').toLowerCase()}`;
    const posClass = `pos-${(p.pos || 'fwd').toLowerCase()}`;

    if (cardContainer) {
      cardContainer.className = `player-card-stage ${tierClass}`;
    }

    if (avatar) {
      avatar.className = `player-avatar-circle ${posClass}`;
      avatar.textContent = p.initials || p.name.substring(0, 2).toUpperCase();
    }

    if (nameEl) nameEl.textContent = p.name;
    if (flagEl) flagEl.textContent = p.flag || '🏳️';
    if (natEl) natEl.textContent = p.nat || p.nationality || '';
    if (clubEl) clubEl.textContent = p.club || '';
    if (ageEl) ageEl.textContent = p.age || '25';
    if (starsEl) starsEl.textContent = '⭐'.repeat(p.rating || 4);
    if (ovrEl) ovrEl.textContent = `${p.ovr || p.rating * 18 || 85} OVR`;
    if (basePriceEl) basePriceEl.textContent = `€${p.basePrice}M`;

    if (posTag) {
      posTag.className = `badge badge-${(p.pos || 'fwd').toLowerCase()}`;
      posTag.textContent = p.pos;
    }

    if (posFullEl) {
      posFullEl.textContent = p.posFull || p.pos;
    }

    if (tierBadge) {
      tierBadge.className = `badge badge-tier-${(p.tier || 'standard').toLowerCase()}`;
      tierBadge.textContent = `⭐ ${(p.tier || 'Standard').toUpperCase()}`;
    }
  }

  // 3. Render Current Bid Display & Action Buttons
  function renderBidArena(hasPopped = false) {
    const bidAmountEl = document.getElementById('display-current-bid');
    const bidderBadge = document.getElementById('current-bidder-badge');
    const bidderEmoji = document.getElementById('bidder-emoji');
    const bidderName = document.getElementById('bidder-name');

    if (bidAmountEl) {
      bidAmountEl.textContent = `€${state.currentBid}M`;
      if (hasPopped) {
        bidAmountEl.classList.remove('pop');
        void bidAmountEl.offsetWidth; // Force reflow
        bidAmountEl.classList.add('pop');
      }
    }

    if (bidderBadge && bidderEmoji && bidderName) {
      if (state.currentBidder) {
        bidderEmoji.textContent = state.currentBidder.emoji || '⚽';
        bidderName.textContent = state.currentBidder.name;
        bidderBadge.classList.add('pulsing');
      } else {
        bidderEmoji.textContent = '⚽';
        bidderName.textContent = 'Starting Price';
        bidderBadge.classList.remove('pulsing');
      }
    }

    // Update Quick Increment Buttons (+1M, +2M, +5M, +10M)
    const myTeam = state.teams.find(t => state.currentUser && t.name === state.currentUser.teamName);
    const myBudget = myTeam ? myTeam.budget : state.startingBudget;

    [1, 2, 5, 10].forEach(inc => {
      const btn = document.getElementById(`btn-bid-${inc}`);
      const label = document.getElementById(`label-bid-${inc}`);
      const nextAmount = state.currentBid + inc;

      if (label) label.textContent = `€${nextAmount}M`;
      if (btn) {
        const cannotAfford = nextAmount > myBudget;
        btn.disabled = cannotAfford;
        btn.title = cannotAfford ? 'Insufficient budget' : `Bid €${nextAmount}M`;
      }
    });

    // Update Custom Bid Placeholder & Min
    const customInput = document.getElementById('input-custom-bid');
    if (customInput) {
      customInput.min = state.currentBid + 1;
      customInput.max = myBudget;
      customInput.placeholder = `Custom Bid (> €${state.currentBid}M, Max €${myBudget}M)`;
    }

    // Feedback Note
    const noteEl = document.getElementById('bid-status-note');
    if (noteEl) {
      if (state.currentBidder && state.currentUser && state.currentBidder.name === state.currentUser.teamName) {
        noteEl.innerHTML = `<span style="color: var(--accent-light); font-weight: 700;">You are currently the highest bidder! 🌟</span>`;
      } else if (myBudget <= state.currentBid) {
        noteEl.innerHTML = `<span style="color: var(--color-danger);">Your budget (€${myBudget}M) is below the current bid.</span>`;
      } else {
        noteEl.textContent = 'Place your bid before the countdown expires.';
      }
    }
  }

  // 4. Render Circular Timer
  function renderTimer(seconds, totalDuration = state.bidTimerDuration) {
    const circle = document.getElementById('timer-progress-circle');
    const numberEl = document.getElementById('timer-display-num');
    const container = document.getElementById('timer-wrapper');

    if (!circle || !numberEl || !container) return;

    numberEl.textContent = Math.max(0, seconds);

    // SVG dashoffset calculation
    const fraction = Math.max(0, Math.min(1, seconds / totalDuration));
    const offset = TIMER_CIRCUMFERENCE * (1 - fraction);
    circle.style.strokeDashoffset = offset;

    // Remove previous state classes
    container.classList.remove('warning', 'danger', 'urgent-shake');

    if (seconds <= 3 && seconds > 0) {
      container.classList.add('danger', 'urgent-shake');
      sounds.playTick(true);
    } else if (seconds <= 5 && seconds > 0) {
      container.classList.add('danger');
      sounds.playTick(false);
    } else if (seconds <= 10) {
      container.classList.add('warning');
    }
  }

  // 5. Render Sidebar Tabs (Teams, Players, History)
  function renderSidebar() {
    renderSidebarTeams();
    renderSidebarPlayers();
    renderSidebarHistory();
  }

  function renderSidebarTeams() {
    const countBadge = document.getElementById('sidebar-teams-count');
    const container = document.getElementById('teams-list-container');
    if (countBadge) countBadge.textContent = state.teams.length;
    if (!container) return;

    container.innerHTML = '';

    state.teams.forEach(team => {
      const card = document.createElement('div');
      card.className = 'team-item-card';

      const remBudget = team.budget;
      const pct = Math.max(0, Math.min(100, (remBudget / state.startingBudget) * 100));
      const squadCount = (team.squad || []).length;

      card.innerHTML = `
        <div class="team-item-header">
          <div class="team-item-identity">
            <span>${team.emoji || '⚽'}</span>
            <span>${team.name}</span>
          </div>
          <span class="team-squad-badge">${squadCount} Players</span>
        </div>

        <div class="budget-progress-container">
          <div class="budget-progress-labels">
            <span class="budget-val-rem">€${remBudget}M Left</span>
            <span class="budget-val-total">€${state.startingBudget}M</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${pct}%;"></div>
          </div>
        </div>

        <button class="team-squad-toggle" type="button">
          <span>View Squad (${squadCount})</span>
          <span class="arrow-icon">▼</span>
        </button>
        <div class="team-squad-drawer">
          ${squadCount === 0 ? '<p style="font-size: 12px; color: var(--text-dim); padding: 4px 0;">No players signed yet</p>' : ''}
          ${(team.squad || []).map(p => `
            <div class="squad-player-mini">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span class="badge badge-${(p.pos || 'fwd').toLowerCase()}" style="font-size: 10px; padding: 2px 6px;">${p.pos}</span>
                <span>${p.name}</span>
              </span>
              <span style="color: #fbbf24; font-family: monospace; font-weight: 700;">€${p.soldPrice || p.basePrice}M</span>
            </div>
          `).join('')}
        </div>
      `;

      // Accordion toggle handler
      const toggleBtn = card.querySelector('.team-squad-toggle');
      const drawer = card.querySelector('.team-squad-drawer');
      const arrow = card.querySelector('.arrow-icon');
      if (toggleBtn && drawer) {
        toggleBtn.addEventListener('click', () => {
          drawer.classList.toggle('open');
          if (arrow) arrow.textContent = drawer.classList.contains('open') ? '▲' : '▼';
        });
      }

      container.appendChild(card);
    });
  }

  function renderSidebarPlayers() {
    const countBadge = document.getElementById('sidebar-players-count');
    const container = document.getElementById('players-list-container');
    if (!container) return;

    // Filter players by remaining, position, and search query
    const filtered = state.players.filter(p => {
      // Exclude already sold players
      const isSold = state.history.some(h => h.player.id === p.id && h.sold);
      if (isSold) return false;

      // Position filter
      if (state.activePosFilter !== 'ALL' && p.pos !== state.activePosFilter) {
        return false;
      }

      // Search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesClub = (p.club || '').toLowerCase().includes(query);
        const matchesNat = (p.nat || '').toLowerCase().includes(query);
        if (!matchesName && !matchesClub && !matchesNat) return false;
      }

      return true;
    });

    if (countBadge) countBadge.textContent = filtered.length;
    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 30px 10px; color: var(--text-dim); font-size: 13px;">No players match criteria</div>`;
      return;
    }

    filtered.forEach(p => {
      const item = document.createElement('div');
      item.className = 'player-list-item';
      const posClass = `pos-${(p.pos || 'fwd').toLowerCase()}`;

      item.innerHTML = `
        <div class="player-list-left">
          <div class="player-mini-circle ${posClass}">
            ${p.initials || p.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="player-list-info">
            <div class="player-list-name">${p.name}</div>
            <div class="player-list-sub">
              <span>${p.flag || ''} ${p.pos}</span>
              <span>•</span>
              <span>${p.club}</span>
            </div>
          </div>
        </div>
        <div class="player-list-price">€${p.basePrice}M</div>
      `;

      container.appendChild(item);
    });
  }

  function renderSidebarHistory() {
    const countBadge = document.getElementById('sidebar-history-count');
    const container = document.getElementById('history-list-container');
    if (countBadge) countBadge.textContent = state.history.length;
    if (!container) return;

    container.innerHTML = '';

    if (state.history.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 30px 10px; color: var(--text-dim); font-size: 13px;">No auction records yet</div>`;
      return;
    }

    // Reverse to show latest first
    [...state.history].reverse().forEach(record => {
      const item = document.createElement('div');
      item.className = `history-item ${record.sold ? '' : 'unsold'}`;

      item.innerHTML = `
        <div>
          <div class="history-info-name">${record.player.name}</div>
          <div class="history-info-sub">
            ${record.sold ? `Sold to <strong>${record.winner.emoji || ''} ${record.winner.name}</strong>` : 'Unsold (No Bids)'}
          </div>
        </div>
        <div class="${record.sold ? 'history-badge-sold' : 'history-badge-unsold'}">
          ${record.sold ? `€${record.amount}M` : 'Passed'}
        </div>
      `;

      container.appendChild(item);
    });
  }

  // 6. Render Overlays (Sold & Unsold)
  function showSoldOverlay(player, winner, amount) {
    const overlay = document.getElementById('sold-overlay');
    const winnerEl = document.getElementById('sold-winner-info');
    const amountEl = document.getElementById('sold-amount-info');

    if (winnerEl) winnerEl.textContent = `${winner.emoji || '🏆'} ${winner.name}`;
    if (amountEl) amountEl.textContent = `€${amount},000,000`;

    if (overlay) {
      overlay.classList.add('active');
      launchConfetti('confetti-container', 50);
      sounds.playSold();

      setTimeout(() => {
        overlay.classList.remove('active');
      }, 3500);
    }
  }

  function showUnsoldOverlay(player) {
    const overlay = document.getElementById('unsold-overlay');
    if (overlay) {
      overlay.classList.add('active');
      sounds.playUnsold();

      setTimeout(() => {
        overlay.classList.remove('active');
      }, 3000);
    }
  }

  // 7. Render Final Complete Screen
  function renderCompleteScreen() {
    const viewWaiting = document.getElementById('view-waiting');
    const viewLive = document.getElementById('view-live');
    const viewComplete = document.getElementById('view-complete');
    const statusBadge = document.getElementById('room-status-badge');

    if (viewWaiting) viewWaiting.style.display = 'none';
    if (viewLive) viewLive.style.display = 'none';
    if (viewComplete) viewComplete.style.display = 'block';

    if (statusBadge) {
      statusBadge.className = 'badge badge-complete';
      statusBadge.textContent = '🏁 Finished';
    }

    const container = document.getElementById('final-leaderboard-container');
    if (!container) return;
    container.innerHTML = '';

    // Sort teams by total spent or squad size
    const sortedTeams = [...state.teams].sort((a, b) => {
      const aVal = (a.squad || []).reduce((acc, p) => acc + (p.soldPrice || p.basePrice), 0);
      const bVal = (b.squad || []).reduce((acc, p) => acc + (p.soldPrice || p.basePrice), 0);
      return bVal - aVal;
    });

    sortedTeams.forEach((team, idx) => {
      const card = document.createElement('div');
      const isChamp = idx === 0;
      card.className = `final-team-card ${isChamp ? 'champion' : ''}`;
      const totalSpent = state.startingBudget - team.budget;
      const squad = team.squad || [];

      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 28px;">${team.emoji || '⚽'}</span>
            <div>
              <h4 style="font-size: 18px; font-weight: 700; color: #fff;">${team.name}</h4>
              <span style="font-size: 12px; color: ${isChamp ? '#fbbf24' : 'var(--text-muted)'}; font-weight: 600;">
                ${isChamp ? '🏆 League Champion' : `Rank #${idx + 1}`}
              </span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 800; color: var(--accent-light);">€${totalSpent}M Spent</div>
            <div style="font-size: 12px; color: var(--text-dim);">€${team.budget}M Left</div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600; text-transform: uppercase;">
            Signed Players (${squad.length})
          </div>
          ${squad.length === 0 ? '<div style="font-size: 12px; color: var(--text-dim);">No players acquired</div>' : ''}
          ${squad.map(p => `
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; padding: 3px 0;">
              <span>${p.name} <span class="badge badge-${(p.pos || 'fwd').toLowerCase()}" style="font-size: 9px; padding: 1px 4px;">${p.pos}</span></span>
              <span style="color: #fbbf24; font-family: monospace;">€${p.soldPrice || p.basePrice}M</span>
            </div>
          `).join('')}
        </div>
      `;

      container.appendChild(card);
    });
  }

  // Position filter click handling
  document.querySelectorAll('.pos-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pos-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activePosFilter = btn.getAttribute('data-filter') || 'ALL';
      renderSidebarPlayers();
    });
  });

  // Search input handling
  const searchInput = document.getElementById('player-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderSidebarPlayers();
    });
  }

  // ===========================================================================
  // REAL-TIME SOCKET.IO CONNECTION & EVENT DISPATCHERS
  // ===========================================================================
  let socket = null;

  function connectSocket() {
    socket = getSocketInstance();

    if (!socket) {
      console.warn('Socket.io client not available or backend disconnected. Starting interactive demo simulation mode.');
      startSimulationMode();
      return;
    }

    let hasConnected = false;

    socket.on('connect', () => {
      hasConnected = true;
      console.log('Socket connected:', socket.id);
      showToast('Connected to auction server', 'success', 2000);

      // Join Room
      const joinPayload = {
        roomCode,
        teamName: state.currentUser ? state.currentUser.teamName : 'Guest',
        teamEmoji: state.currentUser ? state.currentUser.teamEmoji : '⚽',
        isHost: state.isHost
      };

      socket.emit('join-room', joinPayload);
      socket.emit('join', joinPayload);
    });

    socket.on('connect_error', () => {
      if (!hasConnected) {
        console.warn('Backend not responding. Entering interactive offline demo mode.');
        try { socket.disconnect(); } catch (e) {}
        socket = null;
        startSimulationMode();
      }
    });

    setTimeout(() => {
      if (!hasConnected && socket && !socket.connected) {
        console.warn('Socket connection timeout. Starting simulation mode.');
        try { socket.disconnect(); } catch (e) {}
        socket = null;
        startSimulationMode();
      }
    }, 2000);

    socket.on('disconnect', () => {
      showToast('Lost connection to server. Reconnecting...', 'warning');
    });

    // 1. ROOM UPDATE
    socket.on('room-update', (data) => {
      console.log('Received room-update:', data);
      if (!data) return;

      const roomData = data.room || data;
      if (roomData.teams) state.teams = roomData.teams;
      if (roomData.maxTeams) state.maxTeams = roomData.maxTeams;
      if (roomData.budget) state.startingBudget = roomData.budget;
      if (roomData.bidTimer) state.bidTimerDuration = roomData.bidTimer;
      if (roomData.status) state.status = roomData.status;

      // Update connected teams in header
      const curTeamsNum = document.getElementById('current-teams-num');
      const maxTeamsNum = document.getElementById('max-teams-num');
      if (curTeamsNum) curTeamsNum.textContent = state.teams.length;
      if (maxTeamsNum) maxTeamsNum.textContent = state.maxTeams;

      // Check if user is host
      if (roomData.hostId && socket.id) {
        state.isHost = roomData.hostId === socket.id;
      }

      renderHeaderUserInfo();

      if (state.status === 'waiting') {
        const viewWaiting = document.getElementById('view-waiting');
        const viewLive = document.getElementById('view-live');
        if (viewWaiting) viewWaiting.style.display = 'block';
        if (viewLive) viewLive.style.display = 'none';
        renderWaitingLobby();
      } else if (state.status === 'live' || state.status === 'in-progress') {
        const viewWaiting = document.getElementById('view-waiting');
        const viewLive = document.getElementById('view-live');
        if (viewWaiting) viewWaiting.style.display = 'none';
        if (viewLive) viewLive.style.display = 'flex';

        const statusBadge = document.getElementById('room-status-badge');
        if (statusBadge) {
          statusBadge.className = 'badge badge-live';
          statusBadge.textContent = '🟢 Live Auction';
        }
      } else if (state.status === 'complete' || state.status === 'completed') {
        renderCompleteScreen();
      }

      renderSidebar();
    });

    // 2. AUCTION UPDATE
    socket.on('auction-update', (data) => {
      console.log('Received auction-update:', data);
      if (!data) return;

      const player = data.currentPlayer || data.player;
      if (player) {
        state.currentPlayer = player;
        renderCurrentPlayer();
      }

      const prevBid = state.currentBid;
      if (data.currentBid !== undefined) state.currentBid = data.currentBid;
      if (data.bid !== undefined) state.currentBid = data.bid;

      if (data.currentBidder) {
        state.currentBidder = data.currentBidder;
      } else if (data.bidderName) {
        state.currentBidder = { name: data.bidderName, emoji: data.bidderEmoji || '⚽' };
      }

      if (data.round !== undefined) state.playerIndex = data.round;
      if (data.totalPlayers !== undefined) state.totalPlayers = data.totalPlayers;

      const bidHasChanged = state.currentBid !== prevBid;
      if (bidHasChanged) {
        sounds.playBid();
      }

      renderBidArena(bidHasChanged);
      renderSidebar();
    });

    // 3. TIMER TICK
    socket.on('timer-tick', (data) => {
      let seconds = typeof data === 'number' ? data : (data.timeLeft !== undefined ? data.timeLeft : data.seconds);
      const total = (data && data.totalTime) ? data.totalTime : state.bidTimerDuration;
      state.timerSeconds = seconds;
      renderTimer(seconds, total);
    });

    // 4. PLAYER SOLD
    socket.on('player-sold', (data) => {
      console.log('Received player-sold:', data);
      const player = data.player || state.currentPlayer;
      const winner = data.winner || data.buyer || { name: 'Anonymous', emoji: '🏆' };
      const amount = data.amount || data.price || state.currentBid;

      state.history.push({ player, winner, amount, sold: true });

      // Update team budget in local state
      const winningTeam = state.teams.find(t => t.name === winner.name);
      if (winningTeam) {
        winningTeam.budget = Math.max(0, winningTeam.budget - amount);
        winningTeam.squad = winningTeam.squad || [];
        winningTeam.squad.push({ ...player, soldPrice: amount });
      }

      showSoldOverlay(player, winner, amount);
      renderHeaderUserInfo();
      renderSidebar();
    });

    // 5. PLAYER UNSOLD
    socket.on('player-unsold', (data) => {
      console.log('Received player-unsold:', data);
      const player = data.player || state.currentPlayer;
      state.history.push({ player, sold: false });

      showUnsoldOverlay(player);
      renderSidebar();
    });

    // 6. AUCTION COMPLETE
    socket.on('auction-complete', (data) => {
      console.log('Received auction-complete:', data);
      if (data && data.teams) state.teams = data.teams;
      state.status = 'complete';
      renderCompleteScreen();
    });

    // 7. ERROR
    socket.on('error', (err) => {
      const msg = typeof err === 'string' ? err : (err.message || 'An error occurred');
      showToast(msg, 'error');
    });

    // Host Start Auction Event
    const btnStart = document.getElementById('btn-start-auction');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        socket.emit('start-auction', { roomCode });
        socket.emit('startAuction', { roomCode });
        showToast('Starting live auction...', 'success');
      });
    }

    // Bid Button Handlers
    [1, 2, 5, 10].forEach(inc => {
      const btn = document.getElementById(`btn-bid-${inc}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const newBid = state.currentBid + inc;
          placeBid(newBid);
        });
      }
    });

    // Custom Bid Form
    const formCustomBid = document.getElementById('form-custom-bid');
    if (formCustomBid) {
      formCustomBid.addEventListener('submit', (e) => {
        e.preventDefault();
        const customInput = document.getElementById('input-custom-bid');
        const val = parseInt(customInput.value, 10);
        if (!val || isNaN(val)) {
          showToast('Please enter a valid bid amount', 'warning');
          return;
        }
        if (val <= state.currentBid) {
          showToast(`Bid must be greater than current bid (€${state.currentBid}M)`, 'warning');
          return;
        }
        placeBid(val);
        customInput.value = '';
      });
    }

    // Pass Button
    const btnPass = document.getElementById('btn-pass-bid');
    if (btnPass) {
      btnPass.addEventListener('click', () => {
        socket.emit('pass-bid', { roomCode });
        socket.emit('pass', { roomCode });
        showToast('You passed on this player', 'info');
      });
    }
  }

  function placeBid(amount) {
    const myTeam = state.teams.find(t => state.currentUser && t.name === state.currentUser.teamName);
    const myBudget = myTeam ? myTeam.budget : state.startingBudget;

    if (amount > myBudget) {
      showToast(`Cannot bid €${amount}M! Your remaining budget is €${myBudget}M`, 'error');
      return;
    }

    if (socket && socket.connected) {
      socket.emit('place-bid', { roomCode, amount });
      socket.emit('bid', { roomCode, amount });
      sounds.playBid();
    } else {
      // Local preview simulation
      state.currentBid = amount;
      state.currentBidder = {
        name: state.currentUser ? state.currentUser.teamName : 'My Club',
        emoji: state.currentUser ? state.currentUser.teamEmoji : '🦁'
      };
      sounds.playBid();
      renderBidArena(true);
      showToast(`Placed bid of €${amount}M`, 'success');
    }
  }

  // ===========================================================================
  // INTERACTIVE DEMO / PREVIEW SIMULATION MODE
  // (Provides seamless previewing and local testing if server is offline)
  // ===========================================================================
  function startSimulationMode() {
    console.info('Operating in Local Interactive Mode.');
    const myProfile = state.currentUser || { teamName: 'Apex Predators', teamEmoji: '🦁', isHost: true };
    state.currentUser = myProfile;
    state.isHost = true;

    // Seed mock teams using iconic real clubs
    const otherRealClubs = REAL_CLUBS.filter(c => c.id !== 'custom' && c.name !== myProfile.teamName);
    const rivalClubs = otherRealClubs.slice(0, Math.max(1, state.maxTeams - 1));

    state.teams = [
      { id: '1', name: myProfile.teamName, emoji: myProfile.teamEmoji, budget: state.startingBudget, isHost: true, squad: [] },
      ...rivalClubs.map((club, idx) => ({
        id: String(idx + 2),
        name: club.name,
        emoji: club.badge,
        budget: state.startingBudget,
        isHost: false,
        squad: []
      }))
    ];

    renderHeaderUserInfo();
    renderWaitingLobby();
    renderSidebar();

    const curTeamsNum = document.getElementById('current-teams-num');
    const maxTeamsNum = document.getElementById('max-teams-num');
    if (curTeamsNum) curTeamsNum.textContent = state.teams.length;
    if (maxTeamsNum) maxTeamsNum.textContent = state.maxTeams;

    // Start Auction Button handler in demo mode
    const btnStart = document.getElementById('btn-start-auction');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        state.status = 'live';
        document.getElementById('view-waiting').style.display = 'none';
        document.getElementById('view-live').style.display = 'flex';

        const statusBadge = document.getElementById('room-status-badge');
        if (statusBadge) {
          statusBadge.className = 'badge badge-live';
          statusBadge.textContent = '🟢 Live Auction';
        }

        startDemoAuctionRound();
      });
    }

    // Bid increments in demo mode
    [1, 2, 5, 10].forEach(inc => {
      const btn = document.getElementById(`btn-bid-${inc}`);
      if (btn) {
        btn.addEventListener('click', () => {
          placeBid(state.currentBid + inc);
          // Reset timer back to 10s on bid if under 10s
          if (state.timerSeconds < 10) state.timerSeconds = 10;
        });
      }
    });

    // Custom Bid Form in demo mode
    const formCustomBid = document.getElementById('form-custom-bid');
    if (formCustomBid) {
      formCustomBid.addEventListener('submit', (e) => {
        e.preventDefault();
        const customInput = document.getElementById('input-custom-bid');
        const val = parseInt(customInput.value, 10);
        if (!val || val <= state.currentBid) {
          showToast(`Bid must be greater than current bid (€${state.currentBid}M)`, 'warning');
          return;
        }
        placeBid(val);
        customInput.value = '';
        if (state.timerSeconds < 10) state.timerSeconds = 10;
      });
    }

    // Pass button in demo mode
    const btnPass = document.getElementById('btn-pass-bid');
    if (btnPass) {
      btnPass.addEventListener('click', () => {
        showToast('You passed on this player', 'info');
      });
    }
  }

  function startDemoAuctionRound() {
    if (state.playerIndex > state.totalPlayers || state.playerIndex > 10) {
      state.status = 'complete';
      renderCompleteScreen();
      return;
    }

    state.currentPlayer = state.players[state.playerIndex - 1] || state.players[0];
    state.currentBid = state.currentPlayer.basePrice;
    state.currentBidder = null;
    state.timerSeconds = state.bidTimerDuration;

    renderCurrentPlayer();
    renderBidArena(false);
    renderSidebar();

    // Start Countdown
    if (state.timerInterval) clearInterval(state.timerInterval);

    state.timerInterval = setInterval(() => {
      state.timerSeconds--;
      renderTimer(state.timerSeconds, state.bidTimerDuration);

      // Random bot rival bid simulation at 8 seconds if no bids yet
      if (state.timerSeconds === 8 && !state.currentBidder) {
        const rivalTeam = state.teams.find(t => t.name !== state.currentUser.teamName);
        if (rivalTeam && rivalTeam.budget > state.currentBid + 2) {
          state.currentBid += 2;
          state.currentBidder = { name: rivalTeam.name, emoji: rivalTeam.emoji };
          sounds.playBid();
          renderBidArena(true);
        }
      }

      if (state.timerSeconds <= 0) {
        clearInterval(state.timerInterval);

        if (state.currentBidder) {
          const winner = state.currentBidder;
          const winningTeam = state.teams.find(t => t.name === winner.name);
          if (winningTeam) {
            winningTeam.budget -= state.currentBid;
            winningTeam.squad = winningTeam.squad || [];
            winningTeam.squad.push({ ...state.currentPlayer, soldPrice: state.currentBid });
          }
          state.history.push({ player: state.currentPlayer, winner, amount: state.currentBid, sold: true });
          showSoldOverlay(state.currentPlayer, winner, state.currentBid);
        } else {
          state.history.push({ player: state.currentPlayer, sold: false });
          showUnsoldOverlay(state.currentPlayer);
        }

        renderHeaderUserInfo();
        renderSidebar();

        // Advance to next round after 4s
        setTimeout(() => {
          state.playerIndex++;
          startDemoAuctionRound();
        }, 4000);
      }
    }, 1000);
  }
}

// =============================================================================
// APP BOOTSTRAPPER (Determines Active Page)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const isRoomPage = !!document.getElementById('room-page');
  const isLandingPage = !!document.getElementById('landing-page');

  if (isRoomPage) {
    initRoomPage();
  } else if (isLandingPage) {
    initLandingPage();
  } else {
    // Check by filename or URL query
    if (window.location.pathname.includes('room.html') || window.location.search.includes('code=')) {
      initRoomPage();
    } else {
      initLandingPage();
    }
  }
});
// Initialize Socket.IO connection automatically picking up current host
const socket = io();

// Get parameters from URL (e.g. room.html?room=123&username=Alex)
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room') || 'default-room';
const username = urlParams.get('username') || 'Manager_' + Math.floor(Math.random() * 1000);

// DOM Elements
const displayRoomId = document.getElementById('display-room-id');
const playerList = document.getElementById('player-list');
const hostControls = document.getElementById('host-controls');
const startGameBtn = document.getElementById('start-game-btn');
const waitingMsg = document.getElementById('waiting-msg');
const lobbyView = document.getElementById('lobby-view');
const auctionView = document.getElementById('auction-view');

if (displayRoomId) displayRoomId.textContent = roomId;

// Connect to room
socket.emit('join-room', { roomId, username });

// Update lobby when players join or disconnect
socket.on('update-room', ({ players, host, gameStarted }) => {
    if (playerList) {
        playerList.innerHTML = '';
        players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p.username + (p.id === host ? ' 👑 (Host)' : '');
            playerList.appendChild(li);
        });
    }

    // Toggle Host Controls
    const isHost = socket.id === host;
    if (hostControls && waitingMsg) {
        if (isHost) {
            hostControls.style.display = 'block';
            waitingMsg.style.display = 'none';
        } else {
            hostControls.style.display = 'none';
            waitingMsg.style.display = 'block';
        }
    }

    // If game has already started and user reconnected
    if (gameStarted) {
        showAuctionScreen();
    }
});

// Event listener for host clicking Start Game
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        socket.emit('start-game', { roomId });
    });
}

// Receive game start broadcast
socket.on('game-started', ({ message }) => {
    alert(message);
    showAuctionScreen();
});

// Display auction board UI
function showAuctionScreen() {
    if (lobbyView && auctionView) {
        lobbyView.style.display = 'none';
        auctionView.style.display = 'block';
    }
}

// Error handling
socket.on('error-message', ({ message }) => {
    alert(message);
});


