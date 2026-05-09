document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-loading");
  renderProfilePage();
  updateSessionUI();
  bindLogoutButtons();
  bindGlobalProductActions();
  updateCartBadge();
});

window.addEventListener("pageshow", () => {
  updateSessionUI();
  updateCartBadge();
});

function updateSessionUI() {
  const session = Shoplet.getSession();
  const nameTargets = document.querySelectorAll("[data-session-name]");
  const roleTargets = document.querySelectorAll("[data-session-role]");
  const loginLinks = document.querySelectorAll("[data-auth-link]");
  const logoutButtons = document.querySelectorAll("[data-logout]");

  nameTargets.forEach((target) => {
    target.textContent = session ? session.name : "Guest";
  });

  roleTargets.forEach((target) => {
    target.textContent = session ? session.role : "visitor";
  });

  loginLinks.forEach((link) => {
    link.classList.toggle("d-none", Boolean(session));
  });

  logoutButtons.forEach((button) => {
    button.classList.toggle("d-none", !session);
  });
}

function bindLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      Shoplet.logout();
      window.location.href = button.dataset.redirect || "index.html";
    });
  });
}

function bindGlobalProductActions() {
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-cart]");
    const buyButton = event.target.closest("[data-buy-now]");

    if (addButton) {
      event.preventDefault();
      ShopletCart.add(addButton.dataset.productId, 1);
    }

    if (buyButton) {
      event.preventDefault();
      if (ShopletCart.buyNow(buyButton.dataset.productId)) {
        window.location.href = "checkout.html";
      }
    }
  });
}

function updateCartBadge() {
  if (typeof ShopletCart === "undefined") return;

  document.querySelectorAll("[data-cart-count]").forEach((target) => {
    target.textContent = ShopletCart.count();
  });
}

function renderProfilePage() {
  if (document.body.dataset.page !== "profile") return;

  const session = Shoplet.requireRole(["customer"]);
  if (!session) return;

  const user = Shoplet.getUsers().find((item) => item.id === session.userId);
  const orders = Shoplet.getOrders().filter((order) => order.customerId === session.userId);
  const target = document.getElementById("profileDetails");

  if (!target || !user) return;

  target.innerHTML = `
    <div class="detail-row">
      <span>Name</span>
      <strong>${user.name}</strong>
    </div>
    <div class="detail-row">
      <span>Email</span>
      <strong>${user.email}</strong>
    </div>
    <div class="detail-row">
      <span>Account Type</span>
      <strong>${user.role}</strong>
    </div>
    <div class="detail-row">
      <span>Joined</span>
      <strong>${Shoplet.formatDate(user.joinedAt)}</strong>
    </div>
    <div class="detail-row">
      <span>Total Orders</span>
      <strong>${orders.length}</strong>
    </div>
  `;
}

function showToast(message, type = "success") {
  let wrapper = document.querySelector(".toast-stack");

  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "toast-stack";
    document.body.appendChild(wrapper);
  }

  const toast = document.createElement("div");
  toast.className = `shoplet-toast shoplet-toast-${type}`;
  toast.textContent = message;
  wrapper.appendChild(toast);

  setTimeout(() => toast.classList.add("is-visible"), 20);
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 2400);
}

function openLoginPrompt() {
  const modal = document.getElementById("loginReminderModal");

  if (modal && window.bootstrap) {
    bootstrap.Modal.getOrCreateInstance(modal).show();
    return;
  }

  window.location.href = "login.html";
}
