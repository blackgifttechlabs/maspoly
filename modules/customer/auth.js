import { getCurrentUser, loginUser, logoutUser, registerUser } from "../../assets/js/firebase-service.js";
import { initLayout, qs, qsa, showNotice } from "../../assets/js/ui.js";

initLayout("");

const loginForm = qs("[data-login-form]");
const registerForm = qs("[data-register-form]");
const modeButtons = qsa("[data-auth-mode]");
const signedInActions = qs("[data-signed-in-actions]");
const user = await getCurrentUser();

if (user) {
  showNotice(`Signed in as ${user.name || user.email}.`, "success");
  loginForm.hidden = true;
  registerForm.hidden = true;
  signedInActions.hidden = false;
  signedInActions.innerHTML = `
    <div class="form-grid">
      <a class="btn btn-primary" href="account.html"><i class="fa-solid fa-circle-user"></i> Open My Account</a>
      <button class="btn btn-outline" type="button" data-logout><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
    </div>
  `;
  qs("[data-logout]").addEventListener("click", async () => {
    await logoutUser();
    window.location.reload();
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.authMode);
  });
});

function setAuthMode(mode) {
  loginForm.hidden = mode !== "login";
  registerForm.hidden = mode !== "register";
  signedInActions.hidden = true;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const user = await loginUser(Object.fromEntries(new FormData(loginForm).entries()));
    showNotice(`Welcome back, ${user.name || user.email}.`, "success");
    window.setTimeout(() => {
      window.location.href = "account.html";
    }, 500);
  } catch (error) {
    showNotice(error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const user = await registerUser(Object.fromEntries(new FormData(registerForm).entries()));
    showNotice(`Account created for ${user.name}.`, "success");
    window.setTimeout(() => {
      window.location.href = "account.html";
    }, 500);
  } catch (error) {
    showNotice(error.message, "error");
  }
});
