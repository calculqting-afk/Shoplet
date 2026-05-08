document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("[data-orders-page]")) {
    Shoplet.requireRole(["customer"]);
    renderCustomerOrders();
  }

  if (document.querySelector("[data-tracking-page]")) {
    Shoplet.requireRole(["customer"]);
    renderTrackingPage();
  }
});

function customerOrders() {
  const session = Shoplet.getSession();
  if (!session) return [];

  return Shoplet.getOrders().filter((order) => order.customerId === session.userId);
}

function renderCustomerOrders() {
  const target = document.getElementById("customerOrders");
  if (!target) return;

  const orders = customerOrders();

  if (!orders.length) {
    target.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-receipt"></i>
        <h2>No orders yet</h2>
        <p>Your completed checkout orders will appear here.</p>
        <a class="btn btn-primary" href="explore.html">Start shopping</a>
      </div>
    `;
    return;
  }

  target.innerHTML = orders.map((order) => `
    <article class="order-card">
      <div class="order-card-header">
        <div>
          <span class="eyebrow">${order.id}</span>
          <h2>${order.items.length} item${order.items.length > 1 ? "s" : ""} ordered</h2>
          <p>${Shoplet.formatDate(order.createdAt)}</p>
        </div>
        <span class="status-pill">${order.status}</span>
      </div>
      <div class="order-items-strip">
        ${order.items.slice(0, 4).map((item) => `<img src="${item.image}" alt="${item.name}">`).join("")}
      </div>
      <div class="order-card-footer">
        <strong>${Shoplet.money(order.total)}</strong>
        <a class="btn btn-outline-primary" href="tracking.html?order=${order.id}">Track order</a>
      </div>
    </article>
  `).join("");
}

function renderTrackingPage() {
  const target = document.getElementById("trackingDetail");
  const selector = document.getElementById("orderSelector");
  if (!target || !selector) return;

  const orders = customerOrders();
  const params = new URLSearchParams(window.location.search);
  const requestedOrder = params.get("order");

  selector.innerHTML = orders.map((order) => `
    <option value="${order.id}" ${order.id === requestedOrder ? "selected" : ""}>
      ${order.id} - ${Shoplet.money(order.total)}
    </option>
  `).join("");

  if (!orders.length) {
    target.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-map"></i>
        <h2>No orders to track</h2>
        <a class="btn btn-primary" href="explore.html">Explore products</a>
      </div>
    `;
    selector.classList.add("d-none");
    return;
  }

  const currentOrder = orders.find((order) => order.id === requestedOrder) || orders[0];
  selector.value = currentOrder.id;
  target.innerHTML = trackingMarkup(currentOrder);

  selector.addEventListener("change", () => {
    const order = orders.find((item) => item.id === selector.value);
    target.innerHTML = trackingMarkup(order);
    history.replaceState(null, "", `tracking.html?order=${order.id}`);
  });
}

function trackingMarkup(order) {
  const currentIndex = Shoplet.statusFlow.indexOf(order.status);

  return `
    <article class="tracking-panel">
      <div class="tracking-header">
        <div>
          <span class="eyebrow">${order.id}</span>
          <h2>${order.status}</h2>
          <p>${order.address}</p>
        </div>
        <strong>${Shoplet.money(order.total)}</strong>
      </div>
      <div class="timeline">
        ${Shoplet.statusFlow.map((status, index) => `
          <div class="timeline-step ${index <= currentIndex ? "complete" : ""} ${index === currentIndex ? "current" : ""}">
            <span>${index + 1}</span>
            <div>
              <strong>${status}</strong>
              <p>${timelineDate(order, status)}</p>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="tracking-products">
        ${order.items.map((item) => `
          <div class="checkout-line">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <strong>${item.name}</strong>
              <span>${item.quantity} x ${Shoplet.money(item.price)}</span>
            </div>
            <strong>${Shoplet.money(item.price * item.quantity)}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function timelineDate(order, status) {
  const entry = (order.history || []).find((item) => item.status === status);
  return entry ? Shoplet.formatDate(entry.date) : "Waiting for update";
}
