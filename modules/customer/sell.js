import { getCurrentUser, saveProduct } from "../../assets/js/firebase-service.js";
import { initLayout, qs, showNotice } from "../../assets/js/ui.js";

initLayout("account");

const form = qs("[data-sell-form]");
const user = await getCurrentUser();

if (!user) {
  form.innerHTML = `
    <h2>Login Required</h2>
    <p class="muted">Login to create listings.</p>
    <a class="btn btn-primary" href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Go to Login</a>
  `;
} else {
  // nothing to prefill for now
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!user) return;

  try {
    const data = Object.fromEntries(new FormData(form).entries());
    const product = {
      ...data,
      price: Number(data.price || 0),
      stock: Number(data.stock || 0),
      rating: Number(data.rating || 0),
      sellerType: "Student Project",
      ownerId: user.id
    };

    const id = await saveProduct(product);
    showNotice("Listing saved.", "success");
    form.reset();
    window.location.href = "seller-dashboard.html";
  } catch (err) {
    showNotice(err.message || String(err), "error");
  }
});
