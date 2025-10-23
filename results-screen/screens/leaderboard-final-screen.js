import { navigateTo, socket } from "../app.js";

export default function renderScreen2(data) {
  const app = document.getElementById("app");
  
  const winner = data?.winner || { nickname: "Desconocido", score: 0 };
  const players = data?.players || [];

  // Crear ranking mostrando los top 3
  const topPlayers = players.slice(0, 3);
  let rankingHTML = '';
  
  topPlayers.forEach((player, index) => {
    const medals = ['🥇', '🥈', '🥉'];
    rankingHTML += `
      <div class="top-player">
        <span class="medal">${medals[index]}</span>
        <span class="player-name">${player.nickname}</span>
        <span class="player-score">${player.score} pts</span>
      </div>
    `;
  });

  app.innerHTML = `
    <div id="screen2">
      <h2>🎉 ¡Juego Terminado! 🎉</h2>
      <div class="winner-announcement">
        <h3>🏆 Ganador: ${winner.nickname} 🏆</h3>
        <p class="winner-score">${winner.score} puntos</p>
      </div>
      
      <div class="ranking-section">
        <h4>Top 3 Jugadores</h4>
        ${rankingHTML}
      </div>

      <div class="final-leaderboard">
        <h4>Ranking Completo</h4>
        <div id="full-leaderboard-container"></div>
      </div>

      <div class="action-buttons">
        <button id="sort-alphabetical-final">Ordenar Alfabéticamente</button>
        <button id="reset-game">Reiniciar Juego</button>
        <button id="go-screen-back">Ver Tiempo Real</button>
      </div>
    </div>
  `;

  let currentPlayers = [...players];
  let isAlphabetical = false;

  const renderFullLeaderboard = (playersList) => {
    const container = document.getElementById("full-leaderboard-container");
    
    let html = '<div class="leaderboard-list">';
    
    playersList.forEach((player, index) => {
      html += `
        <div class="leaderboard-item">
          <span class="rank">${index + 1}.</span>
          <span class="nickname">${player.nickname}</span>
          <span class="score">${player.score || 0} pts</span>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  };

  // Renderizar leaderboard inicial
  renderFullLeaderboard(currentPlayers);

  // Botón para ordenar alfabéticamente
  const sortButton = document.getElementById("sort-alphabetical-final");
  sortButton.addEventListener("click", () => {
    isAlphabetical = !isAlphabetical;
    
    if (isAlphabetical) {
      const sorted = [...currentPlayers].sort((a, b) => 
        a.nickname.localeCompare(b.nickname)
      );
      renderFullLeaderboard(sorted);
      sortButton.textContent = "Ordenar por Puntuación";
    } else {
      const sorted = [...currentPlayers].sort((a, b) => 
        (b.score || 0) - (a.score || 0)
      );
      renderFullLeaderboard(sorted);
      sortButton.textContent = "Ordenar Alfabéticamente";
    }
  });

  // Botón para reiniciar el juego
  const resetButton = document.getElementById("reset-game");
  resetButton.addEventListener("click", async () => {
    try {
      const BASE_URL = "http://localhost:5050";
      await fetch(`${BASE_URL}/api/game/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      // Volver a la pantalla de tiempo real
      navigateTo("/");
    } catch (error) {
      console.error("Error al reiniciar el juego:", error);
      alert("Error al reiniciar el juego");
    }
  });

  // Botón para volver a tiempo real
  const goBackButton = document.getElementById("go-screen-back");
  goBackButton.addEventListener("click", () => {
    navigateTo("/");
  });

  // Escuchar reset del juego desde otros clientes
  socket.on("gameReset", () => {
    navigateTo("/");
  });
}