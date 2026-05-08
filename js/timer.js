document.addEventListener("DOMContentLoaded", () => {
  ensureLoginReminderModal();

  const isAuthPage = document.body.dataset.page === "login" || document.body.dataset.page === "register";
  if (Shoplet.getSession() || isAuthPage) return;

  setTimeout(() => {
    if (!Shoplet.getSession()) {
      openLoginPrompt();
    }
  }, 60000);
});

function ensureLoginReminderModal() {
  if (document.getElementById("loginReminderModal")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal fade" id="loginReminderModal" tabindex="-1" aria-labelledby="loginReminderLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shoplet-modal">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="loginReminderLabel">Sign in to continue</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Log in or create an account to add products, place orders, and track delivery updates.</p>
            <form id="quickLoginForm" class="stacked-form">
              <div>
                <label class="form-label" for="quickEmail">Email</label>
                <input class="form-control" id="quickEmail" name="email" type="email" value="customer@shoplet.local" required>
              </div>
              <div>
                <label class="form-label" for="quickPassword">Password</label>
                <input class="form-control" id="quickPassword" name="password" type="password" value="customer123" required>
              </div>
              <input type="hidden" name="role" value="customer">
              <div class="alert alert-danger d-none" id="quickLoginAlert"></div>
              <button class="btn btn-primary w-100" type="submit">Login as Customer</button>
              <a class="btn btn-light w-100" href="register.html">Create Account</a>
            </form>
          </div>
        </div>
      </div>
    </div>
  `);

  const form = document.getElementById("quickLoginForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const result = Shoplet.login(data.get("email"), data.get("password"), data.get("role"));
    const alert = document.getElementById("quickLoginAlert");

    if (!result.ok) {
      alert.textContent = result.message;
      alert.classList.remove("d-none");
      return;
    }

    alert.classList.add("d-none");
    bootstrap.Modal.getOrCreateInstance(document.getElementById("loginReminderModal")).hide();
    updateSessionUI();
    updateCartBadge();
    showToast("You are now logged in.");
  });
}
