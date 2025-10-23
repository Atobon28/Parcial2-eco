const express = require('express');
const gameController = require('../controllers/game.controller');
const router = express.Router();

// Define game-related routes and link them to controller methods
router.post('/join', gameController.joinGame);
router.post('/start', gameController.startGame);
router.post('/marco', gameController.notifyMarco);
router.post('/polo', gameController.notifyPolo);
router.post('/select-polo', gameController.selectPolo);

// Nueva ruta para obtener leaderboard
router.get('/leaderboard', gameController.getLeaderboard);

// Nueva ruta para reiniciar el juego
router.post('/reset', gameController.resetGame);

module.exports = router;