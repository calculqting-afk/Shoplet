window.addEventListener("load", () => {
  document.body.classList.add("page-ready");
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  const isInternalPage = href && !href.startsWith("#") && !href.startsWith("http") && !link.target;

  if (!isInternalPage) return;

  event.preventDefault();
  document.body.classList.remove("page-ready");

  setTimeout(() => {
    window.location.href = href;
  }, 140);
});
