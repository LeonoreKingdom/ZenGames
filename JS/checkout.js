import { findGameById } from "./data/game.js";

const checkoutRoot = document.querySelector("#checkout-root");
const backToGameLink = document.querySelector("#back-to-game");
const currentYear = document.querySelector("#current-year");

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStoredSelection() {
  const storedSelection = sessionStorage.getItem(
    "zengamesSelection",
  );

  if (!storedSelection) {
    return null;
  }

  try {
    return JSON.parse(storedSelection);
  } catch (error) {
    console.error("Invalid checkout selection:", error);
    return null;
  }
}

function findProductById(game, productId) {
  return game.products.find(
    (product) => product.id === productId,
  );
}

function createAccountField(field) {
  const inputId = `account-${field.name}`;

  return `
    <div class="form-field">
      <label for="${inputId}">
        ${field.label}
      </label>

      <input
        id="${inputId}"
        name="${field.name}"
        type="${field.type ?? "text"}"
        placeholder="${field.placeholder ?? ""}"
        data-account-field="${field.name}"
        required
        autocomplete="off"
      />

      <p class="field-hint">
        Enter the ${field.label.toLowerCase()} carefully.
      </p>
    </div>
  `;
}

function renderCheckout(game, product) {
  document.title = `${game.name} Checkout | ZenGames`;

  backToGameLink.href =
    `game.html?game=${encodeURIComponent(game.id)}`;

  checkoutRoot.innerHTML = `
    <header class="checkout-heading">
      <p class="checkout-heading__eyebrow">
        Complete your purchase
      </p>

      <h1>Checkout</h1>

      <p>
        Review your package and enter the destination account.
      </p>
    </header>

    <div class="checkout-layout">
      <section class="checkout-form-card">
        <h2>Account information</h2>

        <form id="checkout-form" novalidate>
          <div class="account-fields">
            ${game.accountFields
              .map(createAccountField)
              .join("")}
          </div>

          <fieldset class="contact-fieldset">
            <legend>Contact information</legend>

            <div class="form-field">
              <label for="contact-type">
                Contact method
              </label>

              <select id="contact-type" name="contactType">
                <option value="email">Email</option>
                <option value="phone">Phone number</option>
              </select>
            </div>

            <div class="form-field">
              <label for="contact-value">
                Contact detail
              </label>

              <input
                id="contact-value"
                name="contactValue"
                type="email"
                placeholder="customer@example.com"
                required
              />

              <p class="field-hint">
                This will later be used for order updates.
              </p>
            </div>
          </fieldset>

          <label class="terms-field">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
            />

            <span>
              I confirm that the destination account information
              is correct.
            </span>
          </label>

          <p
            id="form-message"
            class="form-message"
            aria-live="polite"
          ></p>

          <button class="checkout-submit" type="submit">
            Continue to confirmation
          </button>
        </form>
      </section>

      <aside class="order-summary">
        <h2>Order summary</h2>

        <dl>
          <div>
            <dt>Game</dt>
            <dd>${game.name}</dd>
          </div>

          <div>
            <dt>Publisher</dt>
            <dd>${game.publisher}</dd>
          </div>

          <div>
            <dt>Package</dt>
            <dd>${product.name}</dd>
          </div>

          <div class="order-summary__total">
            <dt>Total</dt>
            <dd>${formatCurrency(product.price)}</dd>
          </div>
        </dl>

        <p class="order-summary__notice">
          This project currently uses simulated transactions.
          No real payment will be processed.
        </p>
      </aside>
    </div>
  `;

  const checkoutForm =
    document.querySelector("#checkout-form");

  const contactType =
    document.querySelector("#contact-type");

  contactType.addEventListener(
    "change",
    updateContactInput,
  );

  checkoutForm.addEventListener("submit", (event) => {
    handleCheckoutSubmit(event, game, product);
  });
}

function updateContactInput() {
  const contactType =
    document.querySelector("#contact-type");

  const contactValue =
    document.querySelector("#contact-value");

  if (contactType.value === "phone") {
    contactValue.type = "tel";
    contactValue.placeholder = "Example: +628123456789";
    contactValue.pattern = "[0-9+\\s-]{8,20}";
    return;
  }

  contactValue.type = "email";
  contactValue.placeholder = "customer@example.com";
  contactValue.removeAttribute("pattern");
}

function collectAccountData(form) {
  const account = {};

  const accountInputs =
    form.querySelectorAll("[data-account-field]");

  accountInputs.forEach((input) => {
    account[input.dataset.accountField] =
      input.value.trim();
  });

  return account;
}

function handleCheckoutSubmit(event, game, product) {
  event.preventDefault();

  const form = event.currentTarget;
  const formMessage =
    document.querySelector("#form-message");

  formMessage.textContent = "";

  if (!form.checkValidity()) {
    formMessage.textContent =
      "Please complete all required fields correctly.";

    form.reportValidity();
    return;
  }

  const formData = new FormData(form);

  const checkoutDraft = {
    version: 1,
    gameId: game.id,
    productId: product.id,
    account: collectAccountData(form),
    customer: {
      contactType: formData.get("contactType"),
      contactValue: String(
        formData.get("contactValue"),
      ).trim(),
    },
    createdAt: new Date().toISOString(),
  };

  sessionStorage.setItem(
    "zengamesCheckoutDraft",
    JSON.stringify(checkoutDraft),
  );

  window.location.href = "confirmation.html";
}

function renderUnavailableState(message) {
  checkoutRoot.innerHTML = `
    <section class="checkout-unavailable">
      <h1>Checkout unavailable</h1>

      <p>${message}</p>

      <a href="index.html#games">
        Return to game catalog
      </a>
    </section>
  `;
}

function initializeCheckout() {
  currentYear.textContent =
    new Date().getFullYear();

  const selection = getStoredSelection();

  if (!selection) {
    renderUnavailableState(
      "Select a game package before opening checkout.",
    );
    return;
  }

  const game = findGameById(selection.gameId);

  if (!game) {
    renderUnavailableState(
      "The selected game could not be found.",
    );
    return;
  }

  const product = findProductById(
    game,
    selection.productId,
  );

  if (!product) {
    renderUnavailableState(
      "The selected package could not be found.",
    );
    return;
  }

  renderCheckout(game, product);
}

initializeCheckout();