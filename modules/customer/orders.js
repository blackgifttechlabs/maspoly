import { getCurrentUser, getOrders } from "../../assets/js/firebase-service.js";
import { initLayout, money, qs } from "../../assets/js/ui.js";

initLayout("orders");

const list = qs("[data-orders]");
const user = await getCurrentUser();
const orders = await getOrders(user?.id || "demo-user");

list.innerHTML = orders.length
  ? orders.map((order) => `
      <article class="order-item">
        <div>
          <span class="status"><i class="fa-solid fa-truck"></i> ${order.status}</span>
          <h3>${order.id}</h3>
          <p class="muted">${order.deliveryAddress}</p>
          <p>${(order.items || []).map((item) => `${item.name} x ${item.quantity}`).join(", ")}</p>
        </div>
        <strong>${money.format(order.total || 0)}</strong>
        <span class="pill">${order.paymentStatus || "awaiting-payment"}</span>
      </article>
    `).join("")
  : `<div class="empty">No orders found for this account.</div>`;

