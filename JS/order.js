const orderSearchForm = document.querySelector('#order-search-form');

const orderCodeInput = document.querySelector('#order-code');
const searchMessage = document.querySelector('#search-message');
const orderResult = document.querySelector('#order-result');
const currentYear = document.querySelector('#current-year');

const mockOrders = [
  {
    orderCode: 'ZG-20260802-A1B2',
    gameId: 'mobile-legends',
    gameName: 'Mobile Legends',
    productId: 'ml-86',
    productName: '86 Diamonds',
    amount: 25000,
    currency: 'IDR',
    status: 'COMPLETED',
    customerAccount: '12345678 (1234)',
    createdAt: '2026-08-02T02:50:00.000Z',
    history: [
      {
        status: 'PENDING_PAYMENT',
        label: 'Order created',
        createdAt: '2026-08-02T02:50:00.000Z',
      },
      {
        status: 'PAID',
        label: 'Payment confirmed',
        createdAt: '2026-08-02T02:51:00.000Z',
      },
      {
        status: 'PROCESSING',
        label: 'Top-up processing',
        createdAt: '2026-08-02T02:52:00.000Z',
      },
      {
        status: 'COMPLETED',
        label: 'Top-up completed',
        createdAt: '2026-08-02T02:53:00.000Z',
      },
    ],
  },
  {
    orderCode: 'ZG-20260802-C3D4',
    gameId: 'valorant',
    gameName: 'Valorant',
    productId: 'val-700',
    productName: '700 VP',
    amount: 80000,
    currency: 'IDR',
    status: 'PROCESSING',
    customerAccount: 'PlayerName#SEA',
    createdAt: '2026-08-02T03:20:00.000Z',
    history: [
      {
        status: 'PENDING_PAYMENT',
        label: 'Order created',
        createdAt: '2026-08-02T03:20:00.000Z',
      },
      {
        status: 'PAID',
        label: 'Payment confirmed',
        createdAt: '2026-08-02T03:21:00.000Z',
      },
      {
        status: 'PROCESSING',
        label: 'Top-up processing',
        createdAt: '2026-08-02T03:22:00.000Z',
      },
    ],
  },
];

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function normalizeOrderCode(orderCode) {
  return orderCode.trim().toUpperCase();
}

function findMockOrder(orderCode) {
  return mockOrders.find((order) => order.orderCode === orderCode);
}

function getStoredOrders() {
  const storedOrders = localStorage.getItem('zengamesOrders');

  if (!storedOrders) {
    return [];
  }

  try {
    const parsedOrders = JSON.parse(storedOrders);

    return Array.isArray(parsedOrders) ? parsedOrders : [];
  } catch (error) {
    console.error('Failed to read stored orders:', error);

    return [];
  }
}

function isValidOrder(order) {
  return Boolean(
    order &&
    typeof order === 'object' &&
    typeof order.orderCode === 'string' &&
    typeof order.gameName === 'string' &&
    typeof order.productName === 'string' &&
    typeof order.status === 'string' &&
    Number.isFinite(Number(order.amount)) &&
    typeof order.createdAt === 'string',
  );
}

function findOrder(orderCode) {
  const storedOrder = getStoredOrders().find((order) => order.orderCode === orderCode);

  if (isValidOrder(storedOrder)) {
    return storedOrder;
  }

  const mockOrder = findMockOrder(orderCode);

  return isValidOrder(mockOrder) ? mockOrder : null;
}

function getStatusLabel(status) {
  const labels = {
    PENDING_PAYMENT: 'Pending Payment',
    PAYMENT_FAILED: 'Payment Failed',
    PAID: 'Paid',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FULFILLMENT_FAILED: 'Top-Up Failed',
    EXPIRED: 'Expired',
  };

  return labels[status] ?? status;
}

function createTimelineItem(historyItem) {
  return `
    <li class="timeline-item">
      <span
        class="timeline-item__marker"
        aria-hidden="true"
      ></span>

      <div class="timeline-item__content">
        <strong>
          ${escapeHtml(historyItem.label ?? getStatusLabel(historyItem.status))}
        </strong>

        <span>
          ${formatDate(historyItem.createdAt)}
        </span>
      </div>
    </li>
  `;
}

function renderOrder(order) {
  const history = Array.isArray(order.history)
    ? order.history
    : [
        {
          status: order.status,
          label: getStatusLabel(order.status),
          createdAt: order.createdAt,
        },
      ];

  orderResult.hidden = false;

  const safeOrderCode = escapeHtml(order.orderCode);
  const safeStatus = escapeHtml(order.status);
  const safeStatusLabel = escapeHtml(getStatusLabel(order.status));
  const safeGameName = escapeHtml(order.gameName);
  const safeProductName = escapeHtml(order.productName);
  const safeCustomerAccount = escapeHtml(order.customerAccount ?? 'Not available');

  orderResult.innerHTML = `
  <article class="order-detail-card">
    <header class="order-detail-header">
      <div>
        <p class="order-detail-header__label">
          Order code
        </p>

        <h2>${safeOrderCode}</h2>
      </div>

      <span
        class="status-badge"
        data-status="${safeStatus}"
      >
        ${safeStatusLabel}
      </span>
    </header>

    <dl class="order-information">
      <div>
        <dt>Game</dt>
        <dd>${safeGameName}</dd>
      </div>

      <div>
        <dt>Package</dt>
        <dd>${safeProductName}</dd>
      </div>

      <div>
        <dt>Destination account</dt>
        <dd>${safeCustomerAccount}</dd>
      </div>

      <div>
        <dt>Created</dt>
        <dd>${formatDate(order.createdAt)}</dd>
      </div>

      <div class="order-information__total">
        <dt>Total</dt>
        <dd>
          ${formatCurrency(order.amount, order.currency ?? 'IDR')}
        </dd>
      </div>
    </dl>

    <section class="order-timeline">
      <h3>Order timeline</h3>

      <ol class="timeline-list">
        ${history.map(createTimelineItem).join('')}
      </ol>
    </section>
  </article>
`;
}

function renderNotFound(orderCode) {
  orderResult.hidden = false;

  orderResult.innerHTML = `
    <section class="order-not-found">
      <h2>Order not found</h2>

      <p>
        No order was found using the code
        <strong>${escapeHtml(orderCode)}</strong>.
      </p>

      <p>
        Check the order code and try again.
      </p>
    </section>
  `;
}

function handleOrderSearch(event) {
  event.preventDefault();

  searchMessage.textContent = '';
  orderResult.hidden = true;
  orderResult.innerHTML = '';

  if (!orderSearchForm.checkValidity()) {
    searchMessage.textContent = 'Enter an order code before searching.';

    orderSearchForm.reportValidity();
    return;
  }

  const orderCode = normalizeOrderCode(orderCodeInput.value);

  const order = findOrder(orderCode);

  if (!order) {
    renderNotFound(orderCode);
    return;
  }

  renderOrder(order);
}

function readOrderCodeFromUrl() {
  const parameters = new URLSearchParams(window.location.search);

  return parameters.get('code');
}

function initializeOrderPage() {
  currentYear.textContent = new Date().getFullYear();

  orderSearchForm.addEventListener('submit', handleOrderSearch);

  const orderCodeFromUrl = readOrderCodeFromUrl();

  if (!orderCodeFromUrl) {
    return;
  }

  orderCodeInput.value = orderCodeFromUrl;

  orderSearchForm.requestSubmit();
}

function escapeHtml(value) {
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return String(value).replace(/[&<>"']/g, (character) => replacements[character]);
}

initializeOrderPage();
