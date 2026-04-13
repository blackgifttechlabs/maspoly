import { updateAdminPin } from "../../assets/js/firebase-service.js";
import { initLayout, qs, showNotice } from "../../assets/js/ui.js";
import { renderAdminTabs, requireAdminPin } from "./admin-ui.js";

initLayout("admin");

if (await requireAdminPin()) {
  renderAdminTabs("settings");

  const form = qs("[data-pin-form]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await updateAdminPin(Object.fromEntries(new FormData(form).entries()));
      form.reset();
      showNotice("Admin PIN updated.", "success");
    } catch (error) {
      showNotice(error.message, "error");
    }
  });
}

