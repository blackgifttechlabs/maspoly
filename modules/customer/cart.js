import { getCart, getCartSummary, removeFromCart, updateQuantity } from "../../assets/js/cart-store.js";
import { initLayout, money, qs } from "../../assets/js/ui.js";

initLayout("products");

const list = qs("[data-cart-items]");
const summary = qs("[data-cart-summary]");

function render() {
  const cart = getCart();
  const { total } = getCartSummary();

  list.innerHTML = cart.length
    ? cart.map((item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <strong>${item.name}</strong>
            <p class="muted">${item.department}</p>
            <p>${money.format(item.price)} each</p>
          </div>
          <div class="quantity-control">
            <input class="input" type="number" min="1" value="${item.quantity}" data-qty="${item.productId}">
            <button class="btn btn-danger" type="button" data-remove="${item.productId}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </article>
      `).join("")
    : `<div class="empty">Your cart is empty.</div>`;

  summary.innerHTML = `
    <h2>Cart Summary</h2>
    <div class="summary-line"><span>Items</span><strong>${cart.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
    <div class="summary-line"><span>Subtotal</span><strong>${money.format(total)}</strong></div>
    <div class="summary-line"><span>Delivery</span><strong>Confirmed at checkout</strong></div>
    <div class="summary-line total"><span>Total</span><strong>${money.format(total)}</strong></div>
    <a class="btn btn-primary" href="checkout.html"><i class="fa-solid fa-arrow-right"></i> Checkout</a>
  `;

  list.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("input", () => {
      updateQuantity(input.dataset.qty, input.value);
      render();
    });
  });

  list.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.remove);
      render();
    });
  });
}

render();

