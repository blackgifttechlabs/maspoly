import { deleteArticle, getNews, saveArticle } from "../../assets/js/firebase-service.js";
import { initLayout, qs } from "../../assets/js/ui.js";
import { renderAdminTabs, requireAdminPin } from "./admin-ui.js";

initLayout("admin");

if (await requireAdminPin()) {
  renderAdminTabs("news");

  const form = qs("[data-news-form]");
  const list = qs("[data-news-list]");
  let news = await getNews();

  function render() {
    list.innerHTML = news.length
      ? news.map((article) => `
          <div class="table-row">
            <div>
              <strong>${article.title}</strong>
              <span class="muted">${article.category} · ${article.date}</span>
            </div>
            <button class="btn btn-outline" type="button" data-edit="${article.id}"><i class="fa-solid fa-pen"></i> Edit</button>
            <button class="btn btn-danger" type="button" data-delete="${article.id}"><i class="fa-solid fa-trash"></i> Delete</button>
          </div>
        `).join("")
      : `<div class="empty">No news articles yet.</div>`;

    list.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const article = news.find((item) => item.id === button.dataset.edit);
        Object.entries(article).forEach(([key, value]) => {
          if (form.elements[key]) form.elements[key].value = value;
        });
        form.querySelector("h2").textContent = "Edit Article";
      });
    });

    list.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        await deleteArticle(button.dataset.delete);
        news = await getNews();
        render();
      });
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveArticle(Object.fromEntries(new FormData(form).entries()));
    form.reset();
    form.querySelector("h2").textContent = "Add Article";
    news = await getNews();
    render();
  });

  render();
}
