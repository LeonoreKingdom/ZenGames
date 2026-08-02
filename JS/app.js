import { games } from './data/games.js';

const exploreButton = document.querySelector('#explore-button');
const appStatus = document.querySelector('#app-status');
const currentYear = document.querySelector('#current-year');
const gameList = document.querySelector('#game-list');
const quickOrderForm = document.querySelector('#quick-order-form');
const quickOrderCodeInput = document.querySelector('#quick-order-code');
const quickOrderMessage = document.querySelector('#quick-order-message');

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

function normalizeOrderCode(orderCode) {
  return orderCode.trim().toUpperCase();
}

function handleQuickOrderSubmit(event) {
  event.preventDefault();

  quickOrderMessage.textContent = '';

  if (!quickOrderForm.checkValidity()) {
    quickOrderMessage.textContent = 'Enter an order code before continuing.';

    quickOrderForm.reportValidity();
    return;
  }

  const orderCode = normalizeOrderCode(quickOrderCodeInput.value);

  window.location.href = `order.html?code=${encodeURIComponent(orderCode)}`;
}

function initializeApp() {
  updateCurrentYear();
  renderGames();

  exploreButton.addEventListener('click', handleExploreButtonClick);

  quickOrderForm.addEventListener('submit', handleQuickOrderSubmit);

  console.log('ZenGames home page initialized.');
}

initializeApp();
