const ShopletCart = (() => {
  function getCart() {
    return Shoplet.read(Shoplet.keys.cart, []);
  }

  function saveCart(cart) {
    Shoplet.write(Shoplet.keys.cart, cart);
    updateCartBadge();
  }

  function availableStock(productId) {
    const product = Shoplet.getProduct(productId);
    return product ? Math.max(0, Number(product.stock) || 0) : 0;
  }

  function limitQuantity(productId, quantity) {
    const stock = availableStock(productId);
    if (stock <= 0) return 0;
    return Math.min(Math.max(1, Number(quantity) || 1), stock);
  }

  function normalizeStock(notify = false) {
    let changed = false;

    const cart = getCart()
      .map((item) => {
        const product = Shoplet.getProduct(item.productId);
        if (!product || availableStock(item.productId) <= 0) {
          changed = true;
          return null;
        }

        const quantity = limitQuantity(item.productId, item.quantity);
        if (quantity !== item.quantity) changed = true;
        return { ...item, quantity };
      })
      .filter(Boolean);

    if (changed) {
      saveCart(cart);
      if (notify) {
        showToast("Cart quantities were adjusted to available stock.", "warning");
      }
    }

    return cart;
  }

  function requireCustomer() {
    const session = Shoplet.getSession();

    if (!session || session.role !== "customer") {
      openLoginPrompt();
      return null;
    }

    return session;
  }

  function add(productId, quantity = 1, notify = true) {
    if (!requireCustomer()) return false;

    const product = Shoplet.getProduct(productId);
    if (!product) return false;

    const stock = availableStock(productId);
    if (stock <= 0) {
      showToast(`${product.name} is out of stock.`, "warning");
      return false;
    }

    const cart = getCart();
    const item = cart.find((entry) => entry.productId === productId);
    const currentQuantity = item ? item.quantity : 0;
    const requestedQuantity = currentQuantity + Math.max(1, Number(quantity) || 1);
    const nextQuantity = Math.min(requestedQuantity, stock);

    if (item) {
      item.quantity = nextQuantity;
    } else {
      cart.push({ productId, quantity: nextQuantity });
    }

    saveCart(cart);

    if (notify) {
      const message = requestedQuantity > stock
        ? `Only ${stock} ${product.name} available. Cart was limited to stock.`
        : `${product.name} added to cart.`;
      showToast(message, requestedQuantity > stock ? "warning" : "success");
    }

    return true;
  }

  function remove(productId) {
    saveCart(getCart().filter((item) => item.productId !== productId));
  }

  function update(productId, quantity) {
    const product = Shoplet.getProduct(productId);
    if (!product) return;

    const nextQuantity = limitQuantity(productId, quantity);

    if (nextQuantity <= 0) {
      remove(productId);
      showToast(`${product.name} is out of stock and was removed from cart.`, "warning");
      return;
    }

    if (Number(quantity) > nextQuantity) {
      showToast(`Only ${nextQuantity} ${product.name} available.`, "warning");
    }

    const cart = getCart().map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: nextQuantity };
      }

      return item;
    });

    saveCart(cart);
  }

  function clear() {
    saveCart([]);
  }

  function detailedItems() {
    // Join cart quantities with the current product catalog.
    return normalizeStock()
      .map((item) => {
        const product = Shoplet.getProduct(item.productId);
        if (!product) return null;

        return {
          ...product,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity
        };
      })
      .filter(Boolean);
  }

  function totals() {
    const subtotal = detailedItems().reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = subtotal > 0 ? 79 : 0;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping
    };
  }

  function count() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  return {
    getCart,
    saveCart,
    availableStock,
    normalizeStock,
    add,
    remove,
    update,
    clear,
    detailedItems,
    totals,
    count
  };
})();

window.ShopletCart = ShopletCart;

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("[data-cart-page]")) {
    Shoplet.requireRole(["customer"]);
    renderCartPage();
  }

  if (document.querySelector("[data-checkout-page]")) {
    Shoplet.requireRole(["customer"]);
    renderCheckoutPage();
    bindCheckoutForm();
  }
});

function renderCartPage() {
  const list = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  if (!list || !summary) return;

  const items = ShopletCart.detailedItems();

  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-bag"></i>
        <h2>Your cart is empty</h2>
        <p>Explore Shoplet products and add items you want to buy.</p>
        <a class="btn btn-primary" href="explore.html">Explore products</a>
      </div>
    `;
    summary.innerHTML = renderCartTotals();
    return;
  }

  list.innerHTML = items.map((item) => `
    <article class="cart-line">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-line-body">
        <div>
          <h2>${item.name}</h2>
          <p>${item.category} <span class="text-muted">/ ${Shoplet.money(item.price)} / ${item.stock} available</span></p>
        </div>
        <div class="quantity-control" aria-label="Quantity controls">
          <button class="btn btn-light" data-cart-minus="${item.id}" aria-label="Decrease quantity">
            <i class="bi bi-dash"></i>
          </button>
          <input class="form-control" type="number" min="1" max="${item.stock}" value="${item.quantity}" data-cart-qty="${item.id}" aria-label="${item.name} quantity">
          <button class="btn btn-light" data-cart-plus="${item.id}" aria-label="Increase quantity" ${item.quantity >= item.stock ? "disabled" : ""}>
            <i class="bi bi-plus"></i>
          </button>
        </div>
        <strong>${Shoplet.money(item.lineTotal)}</strong>
      </div>
      <button class="btn btn-icon" data-cart-remove="${item.id}" aria-label="Remove ${item.name}">
        <i class="bi bi-trash"></i>
      </button>
    </article>
  `).join("");

  summary.innerHTML = renderCartTotals(true);
  bindCartControls();
}

function bindCartControls() {
  document.querySelectorAll("[data-cart-minus]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = ShopletCart.getCart().find((entry) => entry.productId === button.dataset.cartMinus);
      ShopletCart.update(button.dataset.cartMinus, Math.max(1, (item?.quantity || 1) - 1));
      renderCartPage();
    });
  });

  document.querySelectorAll("[data-cart-plus]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = ShopletCart.getCart().find((entry) => entry.productId === button.dataset.cartPlus);
      ShopletCart.update(button.dataset.cartPlus, (item?.quantity || 1) + 1);
      renderCartPage();
    });
  });

  document.querySelectorAll("[data-cart-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      ShopletCart.update(input.dataset.cartQty, input.value);
      renderCartPage();
    });
  });

  document.querySelectorAll("[data-cart-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      ShopletCart.remove(button.dataset.cartRemove);
      renderCartPage();
    });
  });
}

function renderCartTotals(showCheckout = false) {
  const totals = ShopletCart.totals();

  return `
    <div class="summary-card">
      <h2>Order Summary</h2>
      <div class="summary-row">
        <span>Subtotal</span>
        <strong>${Shoplet.money(totals.subtotal)}</strong>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <strong>${Shoplet.money(totals.shipping)}</strong>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <strong>${Shoplet.money(totals.total)}</strong>
      </div>
      ${showCheckout ? `<a class="btn btn-primary w-100 mt-3" href="checkout.html">Proceed to Checkout</a>` : ""}
    </div>
  `;
}

function renderCheckoutPage() {
  const list = document.getElementById("checkoutItems");
  const totalsTarget = document.getElementById("checkoutTotals");
  if (!list || !totalsTarget) return;

  const items = ShopletCart.detailedItems();

  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state compact">
        <i class="bi bi-cart-x"></i>
        <h2>No items to checkout</h2>
        <a class="btn btn-primary" href="explore.html">Browse products</a>
      </div>
    `;
    totalsTarget.innerHTML = renderCartTotals();
    return;
  }

  list.innerHTML = items.map((item) => `
    <div class="checkout-line">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <span>${item.quantity} x ${Shoplet.money(item.price)}</span>
      </div>
      <strong>${Shoplet.money(item.lineTotal)}</strong>
    </div>
  `).join("");

  totalsTarget.innerHTML = renderCartTotals();
}

function bindCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const session = Shoplet.getSession();
  const nameInput = form.querySelector("[name='fullName']");
  const emailInput = form.querySelector("[name='email']");

  if (session) {
    nameInput.value = session.name;
    emailInput.value = session.email;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    ShopletCart.normalizeStock(true);
    const items = ShopletCart.detailedItems();
    if (!items.length) {
      showToast("Your cart is empty.", "warning");
      return;
    }

    const data = new FormData(form);
    const totals = ShopletCart.totals();
    const orders = Shoplet.getOrders();
    const order = {
      id: Shoplet.uid("ord"),
      customerId: session.userId,
      customerName: data.get("fullName"),
      email: data.get("email"),
      phone: data.get("phone"),
      address: data.get("address"),
      payment: data.get("payment"),
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      status: "Pending",
      stockDeducted: true,
      history: [{ status: "Pending", date: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };


    Shoplet.decreaseProductStock(items);
    orders.unshift(order);
    Shoplet.setOrders(orders);
    ShopletCart.clear();
    showToast("Order placed successfully.");

    setTimeout(() => {
      window.location.href = `tracking.html?order=${order.id}`;
    }, 700);
  });
}
