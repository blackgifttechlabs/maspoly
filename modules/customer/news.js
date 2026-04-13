import { getNews } from "../../assets/js/firebase-service.js";
import { initLayout, newsCard, qs } from "../../assets/js/ui.js";

initLayout("news");

const news = await getNews();
qs("[data-news]").innerHTML = news.length
  ? news.map(newsCard).join("")
  : `<div class="empty">No updates have been published yet.</div>`;

