import { getNews, getOrders, getProducts, getUsers } from "../../assets/js/firebase-service.js";
import { initLayout, money, qs } from "../../assets/js/ui.js";
import { renderAdminTabs, requireAdminPin } from "./admin-ui.js";

initLayout("admin");

if (await requireAdminPin()) {
  renderAdminTabs("dashboard");
  qs("[data-admin-stats]").innerHTML = `<div class="empty">Loading database records...</div>`;

  const [productsResult, ordersResult, newsResult, usersResult] = await Promise.allSettled([
    getProducts(),
    getOrders(),
    getNews(),
    getUsers()
  ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
  const news = newsResult.status === "fulfilled" ? newsResult.value : [];
  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const activeUsers = users.filter((user) => user.status !== "banned").length;
  const pendingOrders = orders.filter((order) => ["pending", "processing"].includes(order.status)).length;

  qs("[data-admin-stats]").innerHTML = `
    <div class="stat">
      <i class="fa-solid fa-box"></i>
      <strong>${products.length}</strong>
      <span>Products in database</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-truck-fast"></i>
      <strong>${orders.length}</strong>
      <span>Orders in database</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-sack-dollar"></i>
      <strong>${money.format(revenue)}</strong>
      <span>Recorded order value</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-users"></i>
      <strong>${users.length}</strong>
      <span>Users in database</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-newspaper"></i>
      <strong>${news.length}</strong>
      <span>News articles in database</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-hourglass-half"></i>
      <strong>${pendingOrders}</strong>
      <span>Pending or processing orders</span>
    </div>
    <div class="panel dashboard-panel">
      <h2>Recent Products</h2>
      <div class="table-list">
        ${products.slice(0, 6).map((product) => `
          <div class="mini-row">
            <strong>${product.name}</strong>
            <span>${product.department || "No department"} · ${money.format(product.price || 0)} · ${product.stock || 0} in stock</span>
          </div>
        `).join("") || `<div class="empty">No products found.</div>`}
      </div>
    </div>
    <div class="panel dashboard-panel">
      <h2>Recent Orders</h2>
      <div class="table-list">
        ${orders.slice(0, 6).map((order) => `
          <div class="mini-row">
            <strong>${order.id} · ${money.format(order.total || 0)}</strong>
            <span>${order.customerName || order.customerEmail || "Customer"} · ${order.status || "pending"}</span>
          </div>
        `).join("") || `<div class="empty">No orders found.</div>`}
      </div>
    </div>
    <div class="panel dashboard-panel">
      <h2>Users</h2>
      <p class="muted">${activeUsers} active account${activeUsers === 1 ? "" : "s"}</p>
      <div class="table-list">
        ${users.slice(0, 8).map((user) => `
          <div class="mini-row">
            <strong>${user.name || user.email || user.id}</strong>
            <span>${user.email || "No email"} · ${user.role || "customer"} · ${user.status || "active"}</span>
          </div>
        `).join("") || `<div class="empty">No users found.</div>`}
      </div>
    </div>
    <div class="panel dashboard-panel">
      <h2>News</h2>
      <div class="table-list">
        ${news.slice(0, 6).map((article) => `
          <div class="mini-row">
            <strong>${article.title}</strong>
            <span>${article.category || "Update"} · ${article.date || ""}</span>
          </div>
        `).join("") || `<div class="empty">No news found.</div>`}
      </div>
    </div>
  `;
}
