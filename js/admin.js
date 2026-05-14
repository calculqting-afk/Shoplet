//for staff


document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.dataset.adminPage) return;

  Shoplet.requireRole(["staff"], "../login.html");
  renderAdminShell();

  const page = document.body.dataset.adminPage;
  if (page === "dashboard") renderAdminDashboard();
  if (page === "orders") renderAdminOrders();
  if (page === "inventory") renderInventoryPage();
  if (page === "analytics") renderAnalyticsPage();
});

function renderAdminShell() {
  const session = Shoplet.getSession("staff");
  document.querySelectorAll("[data-admin-name]").forEach((target) => {
    target.textContent = session?.name || "Staff";
  });
}

function orderStats() {
  const orders = Shoplet.getOrders();
  const revenue = orders
    .filter((order) => order.status === "Delivered")
    .reduce((sum, order) => sum + order.total, 0);

  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "Pending").length,
    delivered: orders.filter((order) => order.status === "Delivered").length,
    revenue
  };
}

function renderAdminDashboard() {
  renderStatsCards("adminStats");

  const target = document.getElementById("recentOrders");
  if (!target) return;

  const orders = Shoplet.getOrders().slice(0, 6);
  target.innerHTML = orders.length ? orders.map((order) => adminOrderRow(order, false)).join("") : `
    <tr>
      <td colspan="6" class="text-center text-muted py-4">No orders yet.</td>
    </tr>
  `;
}

function renderStatsCards(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const stats = orderStats();
  const cards = [
    ["Total Orders", stats.total, "bi-receipt"],
    ["Pending Orders", stats.pending, "bi-hourglass-split"],
    ["Delivered Orders", stats.delivered, "bi-check2-circle"],
    ["Revenue", Shoplet.money(stats.revenue), "bi-cash-stack"]
  ];

  target.innerHTML = cards.map(([label, value, icon]) => `
    <div class="col-12 col-sm-6 col-xl-3">
      <article class="analytics-card">
        <span><i class="bi ${icon}"></i></span>
        <p>${label}</p>
        <strong>${value}</strong>
      </article>
    </div>
  `).join("");
}

function renderAdminOrders() {
  renderStatsCards("adminOrderStats");
  bindAdminOrderSort();

  const target = document.getElementById("adminOrdersTable");
  if (!target) return;

  const sortValue = document.getElementById("adminOrderSort")?.value || "time-newest";
  const orders = sortAdminOrders(Shoplet.getOrders(), sortValue);
  target.innerHTML = orders.length ? orders.map((order) => `
    ${adminOrderRow(order, true)}
  `).join("") : `
    <tr>
      <td colspan="7" class="text-center text-muted py-4">No orders to process.</td>
    </tr>
  `;

  document.querySelectorAll("[data-order-status]").forEach((select) => {
    select.addEventListener("change", () => {
      // Updating an order here changes the customer's tracking page after refresh.
      Shoplet.updateOrderStatus(select.dataset.orderStatus, select.value);
      showToast("Order status updated.");
      renderAdminOrders();
    });
  });
}

function bindAdminOrderSort() {
  const select = document.getElementById("adminOrderSort");
  if (!select || select.dataset.bound) return;

  select.dataset.bound = "true";
  select.addEventListener("change", renderAdminOrders);
}

function sortAdminOrders(orders, sortBy) {
  const sorted = [...orders];

  if (sortBy === "time-oldest") {
    return sorted.sort((a, b) => orderTimestamp(a) - orderTimestamp(b));
  }

  if (sortBy === "product-az") {
    return sorted.sort((a, b) => firstProductName(a).localeCompare(firstProductName(b)));
  }

  if (sortBy === "price-high") {
    return sorted.sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
  }

  if (sortBy === "price-low") {
    return sorted.sort((a, b) => Number(a.total || 0) - Number(b.total || 0));
  }

  if (sortBy === "customer-az") {
    return sorted.sort((a, b) => String(a.customerName || "").localeCompare(String(b.customerName || "")));
  }

  return sorted.sort((a, b) => orderTimestamp(b) - orderTimestamp(a));
}

function orderTimestamp(order) {
  return new Date(order.createdAt || 0).getTime();
}

function firstProductName(order) {
  return String(order.items?.[0]?.name || "").toLowerCase();
}

function adminOrderRow(order, editable = false) {
  return `
    <tr>
      <td>${orderProductSummary(order)}</td>
      <td>${order.customerName}<br><span class="text-muted">${order.email}</span></td>
      <td>${order.items.length}</td>
      <td>${Shoplet.money(order.total)}</td>
      <td><span class="status-pill">${order.status}</span></td>
      <td>${Shoplet.formatDate(order.createdAt)}</td>
      ${editable ? `
        <td>
          <select class="form-select form-select-sm" data-order-status="${order.id}" aria-label="Update ${order.id} status">
            ${Shoplet.statusFlow.map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </td>
      ` : ""}
    </tr>
  `;
}

function orderProductSummary(order) {
  if (!order.items || !order.items.length) {
    return `<span class="text-muted">No product listed</span>`;
  }

  return order.items.map((item) => `
    <div>
      <strong>${item.name}</strong>
      <br><span class="text-muted">Qty: ${item.quantity}</span>
    </div>
  `).join("");
}

function renderInventoryPage() {
  const target = document.getElementById("inventoryTable");
  const form = document.getElementById("productForm");
  if (!target || !form) return;

  const render = () => {
    const products = Shoplet.getProducts();
    target.innerHTML = products.map((product) => `
      <tr>
        <td><img class="inventory-thumb" src="${product.image}" alt="${product.name}"></td>
        <td>
          <strong>${product.name}</strong>
          <br><span class="text-muted">${product.category}</span>
        </td>
        <td>${Shoplet.money(product.price)}</td>
        <td>
          <input class="form-control form-control-sm" type="number" min="0" value="${product.stock}" data-stock="${product.id}" aria-label="${product.name} stock">
        </td>
        <td>${product.rating}</td>
        <td>
          <button class="btn btn-light btn-sm" data-delete-product="${product.id}" aria-label="Delete ${product.name}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");

    bindInventoryActions(render);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const products = Shoplet.getProducts();

    products.unshift({
      id: Shoplet.uid("p"),
      name: data.get("name"),
      category: data.get("category"),
      price: Number(data.get("price")),
      stock: Number(data.get("stock")),
      rating: Number(data.get("rating")),
      popularity: 60,
      newest: 20,
      badge: "New",
      image: data.get("image") || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
      description: data.get("description") || "New Shoplet inventory item."
    });

    Shoplet.setProducts(products);
    form.reset();
    showToast("Product added.");
    render();
  });

  render();
}

function bindInventoryActions(render) {
  document.querySelectorAll("[data-stock]").forEach((input) => {
    input.addEventListener("change", () => {
      const products = Shoplet.getProducts().map((product) => {
        if (product.id === input.dataset.stock) {
          return { ...product, stock: Number(input.value) };
        }

        return product;
      });

      Shoplet.setProducts(products);
      showToast("Inventory updated.");
    });
  });

  document.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const products = Shoplet.getProducts().filter((product) => product.id !== button.dataset.deleteProduct);
      Shoplet.setProducts(products);
      showToast("Product removed.");
      render();
    });
  });
}

function renderAnalyticsPage() {
  renderStatsCards("analyticsStats");

  const target = document.getElementById("categoryAnalytics");
  if (!target) return;

  const orders = Shoplet.getOrders();
  const totals = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      totals[item.category] = (totals[item.category] || 0) + item.quantity;
    });
  });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((entry) => entry[1]), 1);

  target.innerHTML = entries.length ? entries.map(([category, total]) => `
    <div class="bar-row">
      <span>${category}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${(total / max) * 100}%"></div>
      </div>
      <strong>${total}</strong>
    </div>
  `).join("") : `
    <div class="empty-state compact">
      <i class="bi bi-bar-chart"></i>
      <h2>No analytics yet</h2>
      <p>Placed orders will populate category performance.</p>
    </div>
  `;
}
