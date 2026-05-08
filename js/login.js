//Input Validation
//Input Validation
//Input Validation
//Input Validation
//Input Validation
//Input Validation
//Input Validation


document.addEventListener("DOMContentLoaded", () => {
  bindLoginForm();
  bindRegisterForm();
});

function bindLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const result = Shoplet.login(data.get("email"), data.get("password"), data.get("role"));
    const alert = document.getElementById("loginAlert");

    if (!result.ok) {
      alert.textContent = result.message;
      alert.classList.remove("d-none");
      return;
    }

    alert.classList.add("d-none");

    if (result.user.role === "staff") {
      window.location.href = "admin/dashboard.html";
    } else {
      window.location.href = "explore.html";
    }
  });
}

function bindRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const password = data.get("password");
    const confirmPassword = data.get("confirmPassword");
    const alert = document.getElementById("registerAlert");

    if (password !== confirmPassword) {
      alert.textContent = "Passwords do not match.";
      alert.classList.remove("d-none");
      return;
    }

    const result = Shoplet.registerUser({
      name: data.get("name"),
      email: data.get("email"),
      password,
      role: data.get("role")
    });

    if (!result.ok) {
      alert.textContent = result.message;
      alert.classList.remove("d-none");
      return;
    }

    Shoplet.setSession(result.user);
    window.location.href = result.user.role === "staff" ? "admin/dashboard.html" : "explore.html";
  });
}
