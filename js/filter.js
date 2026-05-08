document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");
  const featuredGrid = document.getElementById("featuredProducts");

  if (grid) {
    if (!Shoplet.requireRole(["customer"])) return;
    initProductExplorer();
  }

  if (featuredGrid) {
    renderFeaturedProducts(featuredGrid);
  }
});

function renderFeaturedProducts(target) {
  const products = Shoplet.getProducts()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  target.innerHTML = products.map((product) => `
    <div class="col-12 col-sm-6 col-xl-3 fade-in-up">
      ${productCard(product, true)}
    </div>
  `).join("");
}

function initProductExplorer() {
  const state = {
    category: "All",
    search: "",
    sort: "popular"
  };

  const controls = {
    searchInputs: document.querySelectorAll("[data-product-search]"),
    categoryButtons: document.querySelectorAll("[data-category-filter]"),
    sort: document.getElementById("sortProducts"),
    activeLabel: document.getElementById("activeCategoryLabel")
  };

  const render = () => renderProducts(state);

  controls.searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      state.search = input.value.trim().toLowerCase();
      controls.searchInputs.forEach((item) => {
        if (item !== input) item.value = input.value;
      });
      render();
    });
  });

  controls.categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.categoryFilter;
      controls.categoryButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (controls.activeLabel) controls.activeLabel.textContent = state.category;
      render();
    });
  });

  if (controls.sort) {
    controls.sort.addEventListener("change", () => {
      state.sort = controls.sort.value;
      render();
    });
  }

  render();
}

function renderProducts(state) {
  const grid = document.getElementById("productGrid");
  const count = document.getElementById("productCount");
  if (!grid) return;

  let products = linearSearchProducts(Shoplet.getProducts(), state);

  products = sortProducts(products, state.sort);

  if (count) {
    count.textContent = `${products.length} products`;
  }

  if (!products.length) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="empty-state compact">
          <i class="bi bi-search"></i>
          <h2>No matching products</h2>
          <p>Try another search or category.</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((product) => `
    <div class="col-12 col-sm-6 col-xl-4 fade-in-up">
      ${productCard(product)}
    </div>
  `).join("");
}


// Linear search
// Linear search
// Linear search
// Linear search
function linearSearchProducts(products, state) {
  const matches = [];

  // Linear search: check each product one by one against category and search text.
  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const matchesCategory = state.category === "All" || product.category === state.category;
    const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();

    if (matchesCategory && text.includes(state.search)) {
      matches.push(product);
    }
  }

  return matches;
}


// Sorting algorithm
// Sorting algorithm
// Sorting algorithm
// Sorting algorithm
// Sorting algorithm
function sortProducts(products, sortBy) {
  const sorted = [...products];

  if (sortBy === "price-low") {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (sortBy === "price-high") {
    return sorted.sort((a, b) => b.price - a.price);
  }

  if (sortBy === "newest") {
    return sorted.sort((a, b) => b.newest - a.newest);
  }

  return sorted.sort((a, b) => b.popularity - a.popularity);
}

function productCard(product, compact = false) {
  return `
    <article class="product-card ${compact ? "featured-card" : ""}">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}">
        <span class="sale-badge">${product.badge}</span>
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span>${product.category}</span>
          <span><i class="bi bi-star-fill"></i> ${product.rating}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-footer">
          <strong>${Shoplet.money(product.price)}</strong>
          <span>${product.stock} left</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-outline-primary" data-add-cart data-product-id="${product.id}">
            <i class="bi bi-cart-plus"></i>
            Add
          </button>
          <button class="btn btn-primary" data-buy-now data-product-id="${product.id}">
            <i class="bi bi-lightning-charge"></i>
            Buy Now
          </button>
        </div>
      </div>
    </article>
  `;
}
