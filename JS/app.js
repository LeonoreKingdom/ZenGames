const exploreButton = document.querySelector("#explore-button");
const appStatus = document.querySelector("#app-status");
const currentYear = document.querySelector("#current-year");
const gameList = document.querySelector("#game-list");

const games = [
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    publisher: "Moonton",
    initials: "ML",
  },
  {
    id: "valorant",
    name: "Valorant",
    publisher: "Riot Games",
    initials: "VL",
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    publisher: "HoYoverse",
    initials: "GI",
  },
];

function updateCurrentYear() {
  currentYear.textContent = new Date().getFullYear();
}

function createGameCard(game) {
  return `
    <article class="game-card" data-game-id="${game.id}">
      <div class="game-card__icon" aria-hidden="true">
        ${game.initials}
      </div>

      <div class="game-card__content">
        <h3 class="game-card__title">${game.name}</h3>
        <p class="game-card__publisher">${game.publisher}</p>
      </div>

      <button
        class="game-card__button"
        type="button"
        data-game-id="${game.id}"
      >
        Select Game
      </button>
    </article>
  `;
}

function renderGames() {
  const gameCards = games.map(createGameCard);

  gameList.innerHTML = gameCards.join("");
}

function handleExploreButtonClick() {
  appStatus.textContent = "JavaScript is connected successfully.";

  document.querySelector("#games").scrollIntoView({
    behavior: "smooth",
  });
}

function initializeApp() {
  updateCurrentYear();
  renderGames();

  exploreButton.addEventListener("click", handleExploreButtonClick);

  console.log("ZenGames frontend initialized.");
}

initializeApp();