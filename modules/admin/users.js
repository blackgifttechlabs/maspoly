import { banUser, getUsers } from "../../assets/js/firebase-service.js";
import { initLayout, qs } from "../../assets/js/ui.js";
import { renderAdminTabs, requireAdminPin } from "./admin-ui.js";

initLayout("admin");

if (await requireAdminPin()) {
  renderAdminTabs("users");

  const list = qs("[data-users]");
  let users = await getUsers();

  function render() {
    list.innerHTML = users.length
      ? users.map((user) => `
          <article class="table-row">
            <div>
              <strong>${user.name || user.email}</strong>
              <span class="muted">${user.email} · ${user.role}</span>
            </div>
            <span class="pill">${user.status}</span>
            <button class="btn ${user.status === "banned" ? "btn-outline" : "btn-danger"}" type="button" data-user="${user.id}" data-status="${user.status === "banned" ? "active" : "banned"}">
              <i class="fa-solid fa-ban"></i> ${user.status === "banned" ? "Activate" : "Ban"}
            </button>
          </article>
        `).join("")
      : `<div class="empty">No users yet.</div>`;

    list.querySelectorAll("[data-user]").forEach((button) => {
      button.addEventListener("click", async () => {
        await banUser(button.dataset.user, button.dataset.status);
        users = await getUsers();
        render();
      });
    });
  }

  render();
}
