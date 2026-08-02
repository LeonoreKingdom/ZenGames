import { findGameById } from "./data/games.js";

const confirmationRoot = document.querySelector(
  "#confirmation-root",
);

const currentYear = document.querySelector("#current-year");

const storageKeys = {
  checkoutDraft: "zengamesCheckoutDraft",
  selection: "zengamesSelection",
  orders: "zengamesOrders",
  lastOrderCode: "zengamesLastOrderCode",
};

const statusLabels = {
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_FAILED: "Payment Failed",
  PAID: "Paid",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
};

const allowedTransitions = {
  PENDING_PAYMENT: ["PAID", "PAYMENT_FAILED"],
  PAID: ["PROCESSING"],
  PROCESSING: ["COMPLETED"],
};

let checkoutContext = null;
let currentOrder = null;

function parseJson(value, fallbackValue) {
  if (!value) {
    return fallbackValue;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse stored JSON:", error);

    return fallbackValue;
  }
}

function escapeHtml(value) {
  const replacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return String(value).replace(
    /[&<>"']/g,
    (character) => replacements[character],
  );
}

function formatCurrency(amount, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function getCheckoutDraft() {
  return parseJson(
    sessionStorage.getItem(storageKeys.checkoutDraft),
    null,
  );
}

function getStoredOrders() {
  const orders = parseJson(
    localStorage.getItem(storageKeys.orders),
    [],
  );

  return Array.isArray(orders) ? orders : [];
}

function saveStoredOrders(orders) {
  try {
    localStorage.setItem(
      storageKeys.orders,
      JSON.stringify(orders),
    );

    return true;
  } catch (error) {
    console.error("Failed to save orders:", error);

    return false;
  }
}

function findProductById(game, productId) {
  return game.products.find(
    (product) => product.id === productId,
  );
}

function findStoredOrder(orderCode) {
  return getStoredOrders().find(
    (order) => order.orderCode === orderCode,
  );
}

function isNonEmptyString(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function validateCheckoutDraft(draft, game, product) {
  if (!draft || typeof draft !== "object") {
    return false;
  }

  if (!game || !product) {
    return false;
  }

  if (
    draft.gameId !== game.id ||
    draft.productId !== product.id
  ) {
    return false;
  }

  if (
    !draft.account ||
    typeof draft.account !== "object"
  ) {
    return false;
  }

  const accountFieldsAreValid = game.accountFields.every(
    (field) =>
      isNonEmptyString(draft.account[field.name]),
  );

  if (!accountFieldsAreValid) {
    return false;
  }

  if (
    !draft.customer ||
    !isNonEmptyString(draft.customer.contactType) ||
    !isNonEmptyString(draft.customer.contactValue)
  ) {
    return false;
  }

  return true;
}

function createAccountRows(game, account) {
  return game.accountFields
    .map((field) => {
      const value = account[field.name] ?? "";

      return `
        <div>
          <dt>${escapeHtml(field.label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `;
    })
    .join("");
}

function createCustomerAccountSummary(game, account) {
  return game.accountFields
    .map((field) => account[field.name])
    .filter(isNonEmptyString)
    .map((value) => value.trim())
    .join(" / ");
}

function createRandomSuffix(length = 4) {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  if (window.crypto?.getRandomValues) {
    const randomValues = new Uint32Array(length);

    window.crypto.getRandomValues(randomValues);

    return Array.from(
      randomValues,
      (value) => alphabet[value % alphabet.length],
    ).join("");
  }

  return Array.from(
    { length },
    () =>
      alphabet[
        Math.floor(Math.random() * alphabet.length)
      ],
  ).join("");
}

function generateOrderCode(existingOrders) {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  let orderCode;

  do {
    orderCode =
      `ZG-${datePart}-${createRandomSuffix(4)}`;
  } while (
    existingOrders.some(
      (order) => order.orderCode === orderCode,
    )
  );

  return orderCode;
}

function createOrder(game, product, draft, existingOrders) {
  const createdAt = new Date().toISOString();

  return {
    orderCode: generateOrderCode(existingOrders),

    gameId: game.id,
    gameName: game.name,

    productId: product.id,
    productName: product.name,

    amount: product.price,
    currency: "IDR",

    status: "PENDING_PAYMENT",

    customerAccount: createCustomerAccountSummary(
      game,
      draft.account,
    ),

    account: {
      ...draft.account,
    },

    customer: {
      ...draft.customer,
    },

    createdAt,
    updatedAt: createdAt,

    history: [
      {
        status: "PENDING_PAYMENT",
        label: "Order created",
        createdAt,
      },
    ],
  };
}

function renderReview(game, product, draft) {
  confirmationRoot.innerHTML = `
    <header class="confirmation-heading">
      <p class="confirmation-heading__eyebrow">
        Review order
      </p>

      <h1>Confirm your order</h1>

      <p>
        Verify the destination account and package before
        creating the mock transaction.
      </p>
    </header>

    <div class="confirmation-layout">
      <section class="confirmation-card">
        <h2>Destination information</h2>

        <dl class="confirmation-details">
          ${createAccountRows(game, draft.account)}

          <div>
            <dt>Contact method</dt>
            <dd>
              ${escapeHtml(
                draft.customer.contactType,
              )}
            </dd>
          </div>

          <div>
            <dt>Contact detail</dt>
            <dd>
              ${escapeHtml(
                draft.customer.contactValue,
              )}
            </dd>
          </div>
        </dl>

        <a
          class="confirmation-edit-link"
          href="checkout.html"
        >
          Edit checkout information
        </a>
      </section>

      <aside class="confirmation-card order-summary">
        <h2>Order summary</h2>

        <dl class="confirmation-details">
          <div>
            <dt>Game</dt>
            <dd>${escapeHtml(game.name)}</dd>
          </div>

          <div>
            <dt>Publisher</dt>
            <dd>${escapeHtml(game.publisher)}</dd>
          </div>

          <div>
            <dt>Package</dt>
            <dd>${escapeHtml(product.name)}</dd>
          </div>

          <div class="confirmation-total">
            <dt>Total</dt>
            <dd>
              ${formatCurrency(product.price)}
            </dd>
          </div>
        </dl>

        <p class="confirmation-notice">
          This is a learning project. No real payment or
          game top-up will be processed.
        </p>

        <button
          class="confirmation-primary-button"
          type="button"
          data-action="place-order"
        >
          Confirm and create order
        </button>
      </aside>
    </div>
  `;
}

function getActionButtons(status) {
  if (status === "PENDING_PAYMENT") {
    return `
      <button
        type="button"
        data-action="payment-success"
      >
        Simulate successful payment
      </button>

      <button
        class="secondary-button danger-button"
        type="button"
        data-action="payment-failure"
      >
        Simulate failed payment
      </button>
    `;
  }

  if (status === "PAID") {
    return `
      <button
        type="button"
        data-action="start-fulfillment"
      >
        Start mock top-up
      </button>
    `;
  }

  if (status === "PROCESSING") {
    return `
      <button
        type="button"
        data-action="complete-fulfillment"
      >
        Complete mock top-up
      </button>
    `;
  }

  return "";
}

function createTimelineItems(history) {
  return history
    .map(
      (historyItem) => `
        <li class="confirmation-timeline__item">
          <span
            class="confirmation-timeline__marker"
            aria-hidden="true"
          ></span>

          <div>
            <strong>
              ${escapeHtml(historyItem.label)}
            </strong>

            <span>
              ${formatDate(historyItem.createdAt)}
            </span>
          </div>
        </li>
      `,
    )
    .join("");
}

function renderCreatedOrder(order) {
  const actionButtons = getActionButtons(order.status);

  confirmationRoot.innerHTML = `
    <header class="confirmation-heading">
      <p class="confirmation-heading__eyebrow">
        Mock order created
      </p>

      <h1>Your order is ready</h1>

      <p>
        Use the controls below to simulate the transaction
        lifecycle.
      </p>
    </header>

    <section class="created-order-card">
      <header class="created-order-header">
        <div>
          <p class="created-order-label">
            Order code
          </p>

          <h2>${escapeHtml(order.orderCode)}</h2>
        </div>

        <span
          class="confirmation-status"
          data-status="${escapeHtml(order.status)}"
        >
          ${escapeHtml(
            statusLabels[order.status] ?? order.status,
          )}
        </span>
      </header>

      <dl class="confirmation-details">
        <div>
          <dt>Game</dt>
          <dd>${escapeHtml(order.gameName)}</dd>
        </div>

        <div>
          <dt>Package</dt>
          <dd>${escapeHtml(order.productName)}</dd>
        </div>

        <div>
          <dt>Destination account</dt>
          <dd>
            ${escapeHtml(order.customerAccount)}
          </dd>
        </div>

        <div class="confirmation-total">
          <dt>Total</dt>
          <dd>
            ${formatCurrency(
              order.amount,
              order.currency,
            )}
          </dd>
        </div>
      </dl>

      <section class="confirmation-timeline">
        <h3>Transaction timeline</h3>

        <ol>
          ${createTimelineItems(order.history)}
        </ol>
      </section>

      ${
        actionButtons
          ? `
            <section class="transaction-actions">
              <h3>Mock transaction controls</h3>

              <div class="transaction-actions__buttons">
                ${actionButtons}
              </div>
            </section>
          `
          : ""
      }

      <div class="created-order-links">
        <a
          class="primary-link"
          href="order.html?code=${encodeURIComponent(
            order.orderCode,
          )}"
        >
          Track this order
        </a>

        <a
          class="secondary-link"
          href="index.html#games"
        >
          Create another order
        </a>
      </div>
    </section>
  `;
}

function renderUnavailableState(message) {
  confirmationRoot.innerHTML = `
    <section class="confirmation-unavailable">
      <h1>Confirmation unavailable</h1>

      <p>${escapeHtml(message)}</p>

      <a href="index.html#games">
        Return to game catalog
      </a>
    </section>
  `;
}

function renderStorageError() {
  confirmationRoot.innerHTML = `
    <section class="confirmation-unavailable">
      <h1>Order could not be saved</h1>

      <p>
        Browser storage is unavailable or full. Check your
        browser settings and try again.
      </p>

      <a href="checkout.html">
        Return to checkout
      </a>
    </section>
  `;
}

function handlePlaceOrder(button) {
  if (!checkoutContext || currentOrder) {
    return;
  }

  button.disabled = true;
  button.textContent = "Creating order...";

  const existingOrders = getStoredOrders();

  const order = createOrder(
    checkoutContext.game,
    checkoutContext.product,
    checkoutContext.draft,
    existingOrders,
  );

  const updatedOrders = [
    ...existingOrders,
    order,
  ];

  if (!saveStoredOrders(updatedOrders)) {
    renderStorageError();
    return;
  }

  sessionStorage.removeItem(
    storageKeys.checkoutDraft,
  );

  sessionStorage.removeItem(storageKeys.selection);

  sessionStorage.setItem(
    storageKeys.lastOrderCode,
    order.orderCode,
  );

  currentOrder = order;

  renderCreatedOrder(order);
}

function updateStoredOrder(updatedOrder) {
  const orders = getStoredOrders();

  const orderExists = orders.some(
    (order) =>
      order.orderCode === updatedOrder.orderCode,
  );

  if (!orderExists) {
    return false;
  }

  const updatedOrders = orders.map((order) =>
    order.orderCode === updatedOrder.orderCode
      ? updatedOrder
      : order,
  );

  return saveStoredOrders(updatedOrders);
}

function transitionCurrentOrder(
  nextStatus,
  historyLabel,
) {
  if (!currentOrder) {
    return;
  }

  const permittedStatuses =
    allowedTransitions[currentOrder.status] ?? [];

  if (!permittedStatuses.includes(nextStatus)) {
    console.error(
      `Invalid order transition: ${currentOrder.status} -> ${nextStatus}`,
    );

    return;
  }

  const transitionTime = new Date().toISOString();

  const updatedOrder = {
    ...currentOrder,

    status: nextStatus,
    updatedAt: transitionTime,

    history: [
      ...currentOrder.history,
      {
        status: nextStatus,
        label: historyLabel,
        createdAt: transitionTime,
      },
    ],
  };

  if (!updateStoredOrder(updatedOrder)) {
    renderStorageError();
    return;
  }

  currentOrder = updatedOrder;

  renderCreatedOrder(currentOrder);
}

function handleConfirmationAction(event) {
  const actionButton = event.target.closest(
    "[data-action]",
  );

  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;

  switch (action) {
    case "place-order":
      handlePlaceOrder(actionButton);
      break;

    case "payment-success":
      transitionCurrentOrder(
        "PAID",
        "Payment confirmed",
      );
      break;

    case "payment-failure":
      transitionCurrentOrder(
        "PAYMENT_FAILED",
        "Payment failed",
      );
      break;

    case "start-fulfillment":
      transitionCurrentOrder(
        "PROCESSING",
        "Top-up processing",
      );
      break;

    case "complete-fulfillment":
      transitionCurrentOrder(
        "COMPLETED",
        "Top-up completed",
      );
      break;

    default:
      console.warn("Unknown confirmation action:", action);
  }
}

function restoreLastCreatedOrder() {
  const lastOrderCode = sessionStorage.getItem(
    storageKeys.lastOrderCode,
  );

  if (!lastOrderCode) {
    return false;
  }

  const order = findStoredOrder(lastOrderCode);

  if (!order) {
    return false;
  }

  currentOrder = order;

  renderCreatedOrder(order);

  return true;
}

function initializeConfirmationPage() {
  currentYear.textContent =
    new Date().getFullYear();

  confirmationRoot.addEventListener(
    "click",
    handleConfirmationAction,
  );

  const draft = getCheckoutDraft();

  if (!draft) {
    const restored = restoreLastCreatedOrder();

    if (!restored) {
      renderUnavailableState(
        "Complete checkout before opening the confirmation page.",
      );
    }

    return;
  }

  const game = findGameById(draft.gameId);

  const product = game
    ? findProductById(game, draft.productId)
    : null;

  if (!validateCheckoutDraft(draft, game, product)) {
    renderUnavailableState(
      "The checkout information is missing or invalid.",
    );

    return;
  }

  checkoutContext = {
    draft,
    game,
    product,
  };

  renderReview(game, product, draft);
}

initializeConfirmationPage();