/**
 * Database service for player-related operations
 */

const { assignRoles } = require("../utils/helpers");

const players = [];

/**
 * Get all players
 * @returns {Array} Array of player objects
 */
const getAllPlayers = () => {
  return players;
};

/**
 * Add a new player
 * @param {string} nickname - Player's nickname
 * @param {string} socketId - Player's socket ID
 * @returns {Object} The created player
 */
const addPlayer = (nickname, socketId) => {
  const newPlayer = { 
    id: socketId, 
    nickname,
    score: 0  // Inicializar puntuación en 0
  };
  players.push(newPlayer);
  return newPlayer;
};

/**
 * Find a player by their socket ID
 * @param {string} socketId - Player's socket ID
 * @returns {Object|null} Player object or null if not found
 */
const findPlayerById = (socketId) => {
  return players.find((player) => player.id === socketId) || null;
};

/**
 * Assign roles to all players
 * @returns {Array} Array of players with assigned roles
 */
const assignPlayerRoles = () => {
  const playersWithRoles = assignRoles(players);
  // Update the players array with the new values
  players.splice(0, players.length, ...playersWithRoles);
  return players;
};

/**
 * Find players by role
 * @param {string|Array} role - Role or array of roles to find
 * @returns {Array} Array of players with the specified role(s)
 */
const findPlayersByRole = (role) => {
  if (Array.isArray(role)) {
    return players.filter((player) => role.includes(player.role));
  }
  return players.filter((player) => player.role === role);
};

/**
 * Update player score
 * @param {string} socketId - Player's socket ID
 * @param {number} points - Points to add (can be negative)
 * @returns {Object|null} Updated player or null if not found
 */
const updatePlayerScore = (socketId, points) => {
  const player = findPlayerById(socketId);
  if (player) {
    // Permitir puntuaciones negativas según los requisitos del parcial
    player.score = (player.score || 0) + points;
    return player;
  }
  return null;
};

/**
 * Get leaderboard sorted by score
 * @param {boolean} alphabetical - Sort alphabetically instead of by score
 * @returns {Array} Sorted array of players
 */
const getLeaderboard = (alphabetical = false) => {
  if (alphabetical) {
    return [...players].sort((a, b) => a.nickname.localeCompare(b.nickname));
  }
  return [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Check if any player has reached winning score
 * @returns {Object|null} Winning player or null
 */
const checkWinningCondition = () => {
  const winner = players.find((player) => (player.score || 0) >= 100);
  return winner || null;
};

/**
 * Get all game data (includes players)
 * @returns {Object} Object containing players array
 */
const getGameData = () => {
  return { players };
};

/**
 * Reset game scores only
 * @returns {void}
 */
const resetScores = () => {
  players.forEach(player => {
    player.score = 0;
    delete player.role; // Eliminar roles también
  });
};

/**
 * Reset game data completely
 * @returns {void}
 */
const resetGame = () => {
  players.splice(0, players.length);
};

module.exports = {
  getAllPlayers,
  addPlayer,
  findPlayerById,
  assignPlayerRoles,
  findPlayersByRole,
  getGameData,
  resetGame,
  updatePlayerScore,
  getLeaderboard,
  checkWinningCondition,
  resetScores,
};