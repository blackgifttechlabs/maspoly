import { clearCart, getCart, getCartSummary } from "../../assets/js/cart-store.js";
import { createOrder, createPayNowCheckout, getCurrentUser } from "../../assets/js/firebase-service.js";
import { initAddressMap } from "../../assets/js/google-maps-service.js";
import { initLayout, money, qs, showNotice } from "../../assets/js/ui.js";

initLayout("products");

const form = qs("[data-checkout-form]");
const summary = qs("[data-checkout-summary]");
const cart = getCart();
const user = await getCurrentUser();

initAddressMap(qs("[data-map]"), form.elements.address).catch((error) => {
  showNotice(error.message, "error");
});

if (user) {
  form.elements.name.value = user.name || "";
  form.elements.email.value = user.email || "";
  form.elements.phone.value = user.phone || "";
  form.elements.address.value = [user.address, user.city, user.notes].filter(Boolean).join("\n");
}

function renderSummary() {
  const { count, total } = getCartSummary();
  summary.innerHTML = `
    <h2>Order Summary</h2>
    ${cart.map((item) => `
      <div class="summary-line">
        <span>${item.name} x ${item.quantity}</span>
        <strong>${money.format(item.price * item.quantity)}</strong>
      </div>
    `).join("")}
    <div class="summary-line"><span>Items</span><strong>${count}</strong></div>
    <div class="summary-line total"><span>Total</span><strong>${money.format(total)}</strong></div>
  `;
}

renderSummary();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!cart.length) {
    showNotice("Add at least one product before checkout.", "error");
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const { total } = getCartSummary();

  try {
    const order = await createOrder({
      userId: user?.id || "guest",
      customerName: data.name,
      customerEmail: data.email,
      phone: data.phone,
      deliveryAddress: data.address,
      total,
      items: cart
    });

    const checkout = await createPayNowCheckout(order);
    clearCart();
    showNotice(checkout.message || "Order created. Redirecting to PayNow.", "success");
    window.setTimeout(() => {
      window.location.href = checkout.redirectUrl || "orders.html";
    }, 900);
  } catch (error) {
    showNotice(error.message, "error");
  }
});
