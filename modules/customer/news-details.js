import { getArticle } from "../../assets/js/firebase-service.js";
import { initLayout, qs } from "../../assets/js/ui.js";

initLayout("news");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const article = await getArticle(id);

const titleNode = qs("[data-article-title]");
const metaNode = qs("[data-article-meta]");
const imageNode = qs("[data-article-image]");
const bodyNode = qs("[data-article-body]");

if (!article) {
  titleNode.textContent = "Article not found";
  bodyNode.innerHTML = `<div class="empty">Article not found.</div>`;
} else {
  titleNode.textContent = article.title || "Article";
  metaNode.textContent = `${article.category || ""} · ${article.date || ""}`;
  if (article.image) imageNode.innerHTML = `<img src="${article.image}" alt="${article.title}">`;
  bodyNode.innerHTML = `<p>${(article.body || "").replace(/\n/g, "<br>")}</p>`;
}
