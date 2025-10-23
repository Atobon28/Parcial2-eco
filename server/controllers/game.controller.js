const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;
    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    // Emitir leaderboard inicial a results-screen
    const leaderboard = playersDb.getLeaderboard();
    emitEvent("leaderboardUpdate", { 
      players: leaderboard,
      winner: null 
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const myUser = playersDb.findPlayerById(socketId);
    const poloSelected = playersDb.findPlayerById(poloId);
    const allPlayers = playersDb.getAllPlayers();

    let gameMessage = "";
    let isWinner = false;

    if (poloSelected.role === "polo-especial") {
      // Marco atrapó al Polo Especial: +50 puntos para Marco
      playersDb.updatePlayerScore(socketId, 50);
      // Polo Especial atrapado: -10 puntos para el Polo Especial
      playersDb.updatePlayerScore(poloId, -10);
      gameMessage = `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`;
      isWinner = true;
    } else {
      // Marco atrapó un Polo normal: -10 puntos para Marco
      playersDb.updatePlayerScore(socketId, -10);
      gameMessage = `El marco ${myUser.nickname} ha perdido`;
    }

    // Dar puntos a los Polos Especiales que NO fueron atrapados
    allPlayers.forEach((player) => {
      // Si es un Polo Especial y NO fue atrapado: +10 puntos
      if (player.role === "polo-especial" && player.id !== poloId) {
        playersDb.updatePlayerScore(player.id, 10);
      }
    });

    // Actualizar leaderboard
    const leaderboard = playersDb.getLeaderboard();
    const winner = playersDb.checkWinningCondition();

    // Emitir actualización del leaderboard a results-screen
    emitEvent("leaderboardUpdate", { 
      players: leaderboard,
      winner: winner 
    });

    // Notificar a todos los jugadores del resultado de la ronda
    allPlayers.forEach((player) => {
      emitToSpecificClient(player.id, "notifyGameOver", {
        message: gameMessage,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { alphabetical } = req.query;
    const leaderboard = playersDb.getLeaderboard(alphabetical === 'true');
    const winner = playersDb.checkWinningCondition();
    
    res.status(200).json({ 
      players: leaderboard,
      winner: winner 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetGame = async (req, res) => {
  try {
    playersDb.resetScores();
    
    // Emitir evento de reinicio a todos los clientes
    emitEvent("gameReset", { 
      players: playersDb.getAllPlayers() 
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
  getLeaderboard,
  resetGame,
};