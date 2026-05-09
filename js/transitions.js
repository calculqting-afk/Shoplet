function showPage() {
  document.body.classList.remove("page-leaving");
  document.body.classList.add("page-ready");
}

window.addEventListener("DOMContentLoaded", showPage);
window.addEventListener("load", showPage);

// Browser back/forward can restore a page after the fade-out class was removed.
window.addEventListener("pageshow", showPage);

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  const url = new URL(href, window.location.href);
  const isSamePageHash = url.pathname === window.location.pathname && url.hash;
  const isInternalPage = url.origin === window.location.origin && !isSamePageHash && !link.target;

  if (!isInternalPage) return;

  event.preventDefault();
  document.body.classList.add("page-leaving");

  setTimeout(() => {
    window.location.href = href;
  }, 140);
});
