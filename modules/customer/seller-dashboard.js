import { getCurrentUser, getProducts, getOrders } from "../../assets/js/firebase-service.js";
import { initLayout, qs, money } from "../../assets/js/ui.js";

initLayout("account");

const productsNode = qs("[data-seller-products]");
const ordersNode = qs("[data-seller-orders]");

const user = await getCurrentUser();
if (!user) {
  productsNode.innerHTML = `<div class="empty">Login required to view seller dashboard.</div>`;
  ordersNode.innerHTML = ``;
} else {
  const products = await getProducts();
  const myProducts = products.filter((p) => p.ownerId === user.id);

  productsNode.innerHTML = myProducts.length
    ? myProducts.map((p) => `
      <div class="table-row">
        <div>
          <strong>${p.name}</strong>
          <span class="muted">${p.department} · ${money.format(p.price)} · ${p.stock} in stock</span>
        </div>
      </div>
    `).join("")
    : `<div class="empty">You have no listings yet.</div>`;

  const orders = await getOrders();
  // find orders that include any of my product IDs
  const myProductIds = new Set(myProducts.map((p) => p.id));
  const myOrders = orders.filter((order) => (order.items || []).some((it) => myProductIds.has(it.productId)));

  ordersNode.innerHTML = myOrders.length
    ? myOrders.map((o) => `
      <div class="table-row">
        <div>
          <strong>Order ${o.id}</strong>
          <span class="muted">${o.customerName || o.customerEmail} · ${o.status || o.paymentStatus || "pending"}</span>
          <div class="muted">${(o.items || []).filter(it => myProductIds.has(it.productId)).map(it => `${it.name} x ${it.quantity}`).join(", ")}</div>
        </div>
      </div>
    `).join("")
    : `<div class="empty">No orders for your listings yet.</div>`;
}
