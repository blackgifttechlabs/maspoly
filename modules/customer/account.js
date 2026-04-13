import { getCurrentUser, logoutUser, updateUserProfile } from "../../assets/js/firebase-service.js";
import { initLayout, qs, showNotice } from "../../assets/js/ui.js";

initLayout("account");

const form = qs("[data-account-form]");
const logoutButton = qs("[data-logout]");
const user = await getCurrentUser();

if (!user) {
  form.innerHTML = `
    <h2>Login Required</h2>
    <p class="muted">Login or create an account before saving purchasing details.</p>
    <a class="btn btn-primary" href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Go to Login</a>
  `;
} else {
  form.elements.name.value = user.name || "";
  form.elements.email.value = user.email || "";
  form.elements.phone.value = user.phone || "";
  form.elements.city.value = user.city || "";
  form.elements.address.value = user.address || "";
  form.elements.notes.value = user.notes || "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await updateUserProfile(Object.fromEntries(new FormData(form).entries()));
    showNotice("Account details saved. Checkout will use these details automatically.", "success");
  } catch (error) {
    showNotice(error.message, "error");
  }
});

logoutButton?.addEventListener("click", async () => {
  await logoutUser();
  window.location.href = "login.html";
});
