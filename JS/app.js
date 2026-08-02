import { games } from './data/games.js';

const exploreButton = document.querySelector('#explore-button');
const appStatus = document.querySelector('#app-status');
const currentYear = document.querySelector('#current-year');
const gameList = document.querySelector('#game-list');

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function updateCurrentYear() {
  currentYear.textContent = new Date().getFullYear();
}

function createGameCard(game) {
  const startingPrice = Math.min(...game.products.map((product) => product.price));

  return `
    <article class="game-card">
      <div class="game-card__icon" aria-hidden="true">
        ${game.initials}
      </div>

      <div class="game-card__content">
        <h3 class="game-card__title">${game.name}</h3>
        <p class="game-card__publisher">${game.publisher}</p>
        <p class="game-card__price">
          Starting from ${formatCurrency(startingPrice)}
        </p>
      </div>

      <a
        class="game-card__button"
        href="game.html?game=${encodeURIComponent(game.id)}"
      >
        Select Game
      </a>
    </article>
  `;
}

function renderGames() {
  gameList.innerHTML = games.map(createGameCard).join('');
}

function handleExploreButtonClick() {
  appStatus.textContent = 'Choose one of the available games.';

  document.querySelector('#games').scrollIntoView({
    behavior: 'smooth',
  });
}

function initializeApp() {
  updateCurrentYear();
  renderGames();

  exploreButton.addEventListener('click', handleExploreButtonClick);

  console.log('ZenGames home page initialized.');
}

initializeApp();
