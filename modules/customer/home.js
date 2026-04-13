import { getNews, getProducts } from "../../assets/js/firebase-service.js";
import { initLayout, newsCard, productCard, qs } from "../../assets/js/ui.js";

initLayout("home");

const products = await getProducts();
const featuredProducts = products.filter((product) => product.featured);
const visibleProducts = (featuredProducts.length ? featuredProducts : products).slice(0, 3);

qs("[data-featured-products]").innerHTML = products
  .length
    ? visibleProducts.map(productCard).join("")
    : `<div class="empty">No products have been added yet.</div>`;

const news = await getNews();
qs("[data-home-news]").innerHTML = news
  .slice(0, 3)
  .map(newsCard)
  .join("");
