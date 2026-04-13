import { qs } from "../../assets/js/ui.js";
import { isAdminUnlocked, lockAdmin, verifyAdminPin } from "../../assets/js/firebase-service.js";

export function renderAdminTabs(active) {
  const tabs = qs("[data-admin-tabs]");
  if (!tabs) return;

  const items = [
    ["dashboard", "dashboard.html", "Dashboard", "fa-chart-line"],
    ["products", "products.html", "Products", "fa-box"],
    ["orders", "orders.html", "Orders", "fa-truck-fast"],
    ["news", "news.html", "News", "fa-newspaper"],
    ["users", "users.html", "Users", "fa-users"],
    ["settings", "settings.html", "Settings", "fa-gear"]
  ];

  tabs.innerHTML = items
    .map(([key, href, label, icon]) => `<a class="${active === key ? "active" : ""}" href="${href}"><i class="fa-solid ${icon}"></i> ${label}</a>`)
    .join("") + `<button class="admin-lock-btn" type="button" data-admin-lock><i class="fa-solid fa-lock"></i> Lock</button>`;

  qs("[data-admin-lock]", tabs)?.addEventListener("click", () => {
    lockAdmin();
    window.location.reload();
  });
}

export async function requireAdminPin() {
  if (isAdminUnlocked()) return true;

  const main = qs("main");
  if (!main) return false;

  main.innerHTML = `
    <section class="auth-wrap">
      <form class="auth-box form-grid" data-admin-pin-form>
        <h1>Admin Access</h1>
        <p class="muted">Enter the administrator PIN to continue.</p>
        <div class="notice" data-notice hidden></div>
        <label>
          Admin PIN
          <input class="input" name="pin" type="password" inputmode="numeric" autocomplete="current-password" required autofocus>
        </label>
        <button class="btn btn-primary" type="submit"><i class="fa-solid fa-unlock"></i> Enter Admin</button>
      </form>
    </section>
  `;

  const form = qs("[data-admin-pin-form]");
  const notice = qs("[data-notice]");

  return new Promise((resolve) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const ok = await verifyAdminPin(new FormData(form).get("pin"));
      if (ok) {
        window.location.reload();
        resolve(true);
        return;
      }

      notice.className = "notice notice-error";
      notice.textContent = "Incorrect admin PIN.";
      notice.hidden = false;
      resolve(false);
    });
  });
}
