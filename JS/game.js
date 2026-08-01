import { findGameById } from "./data/game.js";

const gameDetail = document.querySelector("#game-detail");
const currentYear = document.querySelector("#current-year");

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getSelectedGameId() {
  const parameters = new URLSearchParams(window.location.search);

  return parameters.get("game");
}

function createProductCard(gameId, product) {
  return `
    <article class="product-card">
      <div>
        <h3>${product.name}</h3>
        <p>${formatCurrency(product.price)}</p>
      </div>

      <button
        class="product-card__button"
        type="button"
        data-game-id="${gameId}"
        data-product-id="${product.id}"
      >
        Choose Package
      </button>
    </article>
  `;
}

function renderGame(game) {
  document.title = `${game.name} Top-Up | ZenGames`;

  gameDetail.innerHTML = `
    <header class="game-heading">
      <div class="game-heading__icon" aria-hidden="true">
        ${game.initials}
      </div>

      <div>
        <p class="game-heading__publisher">${game.publisher}</p>
        <h1>${game.name}</h1>
        <p>${game.description}</p>
      </div>
    </header>

    <section class="product-section">
      <h2>Select a top-up package</h2>

      <div class="product-list">
        ${game.products
          .map((product) => createProductCard(game.id, product))
          .join("")}
      </div>
    </section>
  `;
}

function renderNotFound() {
  gameDetail.innerHTML = `
    <section class="not-found">
      <h1>Game not found</h1>
      <p>The requested game does not exist or is unavailable.</p>
      <a href="index.html#games">Return to game catalog</a>
    </section>
  `;
}

function handleProductSelection(event) {
  const button = event.target.closest(".product-card__button");

  if (!button) {
    return;
  }

  const gameId = button.dataset.gameId;
  const productId = button.dataset.productId;

  sessionStorage.setItem(
    "zengamesSelection",
    JSON.stringify({
      gameId,
      productId,
    }),
  );

  console.log("Selected package:", {
    gameId,
    productId,
  });

  button.textContent = "Package Selected";
}

function initializeGamePage() {
  currentYear.textContent = new Date().getFullYear();

  const selectedGameId = getSelectedGameId();
  const selectedGame = findGameById(selectedGameId);

  if (!selectedGame) {
    renderNotFound();
    return;
  }

  renderGame(selectedGame);

  gameDetail.addEventListener("click", handleProductSelection);
}

initializeGamePage();