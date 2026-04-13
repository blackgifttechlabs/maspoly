import { getNews, getOrders, getProducts, getUsers } from "../../assets/js/firebase-service.js";
import { initLayout, money, qs } from "../../assets/js/ui.js";
import { renderAdminTabs, requireAdminPin } from "./admin-ui.js";

initLayout("admin");

if (await requireAdminPin()) {
  renderAdminTabs("dashboard");

  const [products, orders, news, users] = await Promise.all([
    getProducts(),
    getOrders(),
    getNews(),
    getUsers()
  ]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  qs("[data-admin-stats]").innerHTML = `
    <div class="stat">
      <i class="fa-solid fa-box"></i>
      <strong>${products.length}</strong>
      <span>Active product and service listings</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-truck-fast"></i>
      <strong>${orders.length}</strong>
      <span>Orders captured in the marketplace</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-sack-dollar"></i>
      <strong>${money.format(revenue)}</strong>
      <span>Recorded order value</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-users"></i>
      <strong>${users.length}</strong>
      <span>Customer and admin accounts</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-newspaper"></i>
      <strong>${news.length}</strong>
      <span>Published customer updates</span>
    </div>
    <div class="stat">
      <i class="fa-solid fa-lightbulb"></i>
      <strong>${products.filter((product) => product.sellerType === "Student Project").length}</strong>
      <span>Student entrepreneurship listings</span>
    </div>
  `;
}
