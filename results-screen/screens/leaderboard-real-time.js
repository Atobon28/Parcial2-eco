import { navigateTo, socket } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen1">
        <h2>🏆 Leaderboard - Tiempo Real 🏆</h2>
        <div id="leaderboard-container">
          <p>Esperando jugadores...</p>
        </div>
        <button id="sort-alphabetical">Ordenar Alfabéticamente</button>
      </div>
  `;

  let currentPlayers = [];
  let isAlphabetical = false;

  const renderLeaderboard = (players) => {
    const container = document.getElementById("leaderboard-container");
    
    if (!players || players.length === 0) {
      container.innerHTML = "<p>No hay jugadores aún...</p>";
      return;
    }

    let html = '<div class="leaderboard-list">';
    
    players.forEach((player, index) => {
      html += `
        <div class="leaderboard-item">
          <span class="rank">#${index + 1}</span>
          <span class="nickname">${player.nickname}</span>
          <span class="score">${player.score || 0} pts</span>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  };

  // Escuchar actualizaciones del leaderboard desde el servidor
  socket.on("leaderboardUpdate", (data) => {
    currentPlayers = data.players;
    
    // Si hay un ganador, navegar a pantalla final
    if (data.winner) {
      navigateTo("/screen2", { 
        winner: data.winner,
        players: data.players 
      });
    } else {
      renderLeaderboard(currentPlayers);
    }
  });

  // Escuchar reset del juego
  socket.on("gameReset", (data) => {
    currentPlayers = data.players;
    isAlphabetical = false;
    renderLeaderboard(currentPlayers);
  });

  // Botón para ordenar alfabéticamente
  const sortButton = document.getElementById("sort-alphabetical");
  sortButton.addEventListener("click", () => {
    isAlphabetical = !isAlphabetical;
    
    if (isAlphabetical) {
      const sorted = [...currentPlayers].sort((a, b) => 
        a.nickname.localeCompare(b.nickname)
      );
      renderLeaderboard(sorted);
      sortButton.textContent = "Ordenar por Puntuación";
    } else {
      const sorted = [...currentPlayers].sort((a, b) => 
        (b.score || 0) - (a.score || 0)
      );
      renderLeaderboard(sorted);
      sortButton.textContent = "Ordenar Alfabéticamente";
    }
  });
}