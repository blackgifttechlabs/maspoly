const CART_KEY = "polymart-cart";

export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart:changed"));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      department: product.department,
      price: Number(product.price),
      image: product.image,
      quantity
    });
  }

  saveCart(cart);
}

export function updateQuantity(productId, quantity) {
  const next = getCart()
    .map((item) => item.productId === productId ? { ...item, quantity: Number(quantity) } : item)
    .filter((item) => item.quantity > 0);
  saveCart(next);
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.productId !== productId));
}

export function clearCart() {
  saveCart([]);
}

export function getCartSummary() {
  const items = getCart();
  return {
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  };
}

