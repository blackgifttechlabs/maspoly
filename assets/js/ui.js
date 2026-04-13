import { getCartSummary } from "./cart-store.js";
import { getCurrentUser } from "./firebase-service.js";

export const money = new Intl.NumberFormat("en-ZW", {
  style: "currency",
  currency: "USD"
});

export const systemLogo = "https://i.ibb.co/B5GMcb9z/Gemini-Generated-Image-mmtbiymmtbiymmtb-removebg-preview.png";

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function setText(selector, value, root = document) {
  const node = qs(selector, root);
  if (node) node.textContent = value;
}

export function getPrefix() {
  const path = window.location.pathname;
  if (path.includes("/pages/admin/")) return "../../";
  if (path.includes("/pages/")) return "../";
  return "";
}

export function renderHeader(active = "") {
  const prefix = getPrefix();
  const header = qs("[data-site-header]");
  if (!header) return;

  const links = [
    ["home", `${prefix}index.html`, "Home"],
    ["products", `${prefix}pages/products.html`, "Products"],
    ["news", `${prefix}pages/news.html`, "News"],
    ["orders", `${prefix}pages/orders.html`, "Orders"],
    ["account", `${prefix}pages/account.html`, "Account"],
    ["admin", `${prefix}pages/admin/dashboard.html`, "Admin"]
  ];

  header.innerHTML = `
    <a class="brand" href="${prefix}index.html" aria-label="Polymart home">
      <span class="brand-mark"><img src="${systemLogo}" alt="" aria-hidden="true"></span>
      <span>
        <strong>Polymart</strong>
        <small>Shopping Made Easy</small>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-label="Open menu">
      <i class="fa-solid fa-bars"></i>
    </button>
    <nav class="site-nav" aria-label="Main navigation">
      ${links.map(([key, href, label]) => `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`).join("")}
    </nav>
    <div class="nav-actions">
      <a class="icon-link" href="${prefix}pages/cart.html" aria-label="Cart">
        <i class="fa-solid fa-cart-shopping"></i>
        <span data-cart-count>0</span>
      </a>
      <span data-account-action>
        <a class="btn btn-dark" href="${prefix}pages/login.html">Login</a>
      </span>
    </div>
  `;

  qs(".nav-toggle", header).addEventListener("click", () => {
    qs(".site-nav", header).classList.toggle("open");
  });

  updateCartBadge();
  updateAccountAction();
}

export function updateCartBadge() {
  const badge = qs("[data-cart-count]");
  if (badge) badge.textContent = getCartSummary().count;
}

export async function updateAccountAction() {
  const action = qs("[data-account-action]");
  if (!action) return;

  const prefix = getPrefix();
  const user = await getCurrentUser();
  if (!user) {
    action.innerHTML = `<a class="btn btn-dark" href="${prefix}pages/login.html">Login</a>`;
    return;
  }

  const label = user.name || user.email || "Account";
  action.innerHTML = `
    <a class="icon-link account-link" href="${prefix}pages/account.html" aria-label="Account">
      <i class="fa-solid fa-circle-user"></i>
      <span title="${label}">${label.slice(0, 1).toUpperCase()}</span>
    </a>
  `;
}

export function renderFooter() {
  const footer = qs("[data-site-footer]");
  if (!footer) return;
  const prefix = getPrefix();

  footer.innerHTML = `
    <div class="footer-brand">
      <span class="brand-mark"><img src="${systemLogo}" alt="" aria-hidden="true"></span>
      <strong>Polymart</strong>
      <p>Campus marketplace for departments, student innovators, and customers.</p>
    </div>
    <nav class="footer-links" aria-label="Customer links">
      <strong>Shop</strong>
      <a href="${prefix}pages/products.html">Products</a>
      <a href="${prefix}pages/cart.html">Cart</a>
      <a href="${prefix}pages/checkout.html">Checkout</a>
      <a href="${prefix}pages/orders.html">Order Tracking</a>
    </nav>
    <nav class="footer-links" aria-label="Information links">
      <strong>Information</strong>
      <a href="${prefix}index.html">Home</a>
      <a href="${prefix}pages/news.html">News</a>
      <a href="${prefix}pages/account.html">Customer Account</a>
      <a href="${prefix}pages/admin/dashboard.html">Admin Portal</a>
    </nav>
    <div class="footer-links">
      <strong>Support</strong>
      <span><i class="fa-solid fa-location-dot"></i> Masvingp Polytechnic Campus</span>
      <span><i class="fa-solid fa-envelope"></i> support@polymart.ac.zw</span>
      <span><i class="fa-solid fa-clock"></i> Online orders open daily</span>
    </div>
  `;
}

export function initLayout(active) {
  renderHeader(active);
  renderFooter();
  window.addEventListener("cart:changed", updateCartBadge);
}

export function productCard(product) {
  return `
    <article class="product-card">
      <a href="${getPrefix()}pages/product-details.html?id=${encodeURIComponent(product.id)}" class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </a>
      <div class="product-body">
        <div class="eyebrow">${product.department}</div>
        <h3>${product.name}</h3>
        <p>${product.summary}</p>
        <div class="card-meta">
          <span><i class="fa-solid fa-star"></i> ${Number(product.rating || 0).toFixed(1)}</span>
          <strong>${money.format(product.price)}</strong>
        </div>
        <a class="btn btn-outline" href="${getPrefix()}pages/product-details.html?id=${encodeURIComponent(product.id)}">View Item</a>
      </div>
    </article>
  `;
}

export function newsCard(article) {
  return `
    <article class="news-card">
      <a href="${getPrefix()}pages/news-details.html?id=${encodeURIComponent(article.id)}">
        <img src="${article.image}" alt="${article.title}" loading="lazy">
      </a>
      <div>
        <span class="pill">${article.category}</span>
        <h3><a class="plain-link" href="${getPrefix()}pages/news-details.html?id=${encodeURIComponent(article.id)}">${article.title}</a></h3>
        <p>${article.body}</p>
        <small>${article.date}</small>
      </div>
    </article>
  `;
}

export function showNotice(message, type = "info") {
  const notice = qs("[data-notice]");
  if (!notice) return;
  notice.className = `notice notice-${type}`;
  notice.textContent = message;
  notice.hidden = false;
}
