import { getOrders, updateOrderStatus } from "../../assets/js/firebase-service.js";
import { initLayout, money, qs } from "../../assets/js/ui.js";
import { renderAdminTabs, requireAdminPin } from "./admin-ui.js";

initLayout("admin");

if (await requireAdminPin()) {
  renderAdminTabs("orders");

  const list = qs("[data-admin-orders]");
  let orders = await getOrders();

  function render() {
    list.innerHTML = orders.length
      ? orders.map((order) => `
          <article class="table-row">
            <div>
              <strong>${order.id} · ${order.customerName || "Customer"}</strong>
              <span class="muted">${order.deliveryAddress} · ${money.format(order.total || 0)} · ${order.paymentStatus}</span>
            </div>
            <select class="select" data-status="${order.id}">
              ${["pending", "processing", "dispatched", "delivered", "cancelled"].map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
            <span class="pill">${(order.items || []).length} item lines</span>
          </article>
        `).join("")
      : `<div class="empty">No orders yet.</div>`;

    list.querySelectorAll("[data-status]").forEach((select) => {
      select.addEventListener("change", async () => {
        await updateOrderStatus(select.dataset.status, select.value);
        orders = await getOrders();
        render();
      });
    });
  }

  render();
}
