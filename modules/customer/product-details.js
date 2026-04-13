import { addToCart } from "../../assets/js/cart-store.js";
import { getProduct, rateProduct } from "../../assets/js/firebase-service.js";
import { initLayout, money, qs, setText, showNotice } from "../../assets/js/ui.js";

initLayout("products");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let product = await getProduct(id);
const detail = qs("[data-product-detail]");

if (!product) {
  detail.innerHTML = `<div class="empty">Product not found.</div>`;
} else {
  renderProduct();
}

function renderProduct() {
  const ratingCount = Number(product.ratingCount || 1);
  setText("[data-product-title]", product.name);
  detail.innerHTML = `
      <div class="detail-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <aside class="panel">
        <span class="pill"><i class="fa-solid fa-building-columns"></i> ${product.department}</span>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p class="price">${money.format(product.price)}</p>
        <p data-rating-summary><i class="fa-solid fa-star"></i> ${Number(product.rating || 0).toFixed(1)} rating from ${ratingCount} review${ratingCount === 1 ? "" : "s"}</p>
        <p><i class="fa-solid fa-boxes-stacked"></i> ${product.stock} in stock</p>
        <p><i class="fa-solid fa-user-tag"></i> ${product.sellerType}</p>
        <div class="notice" data-notice hidden></div>
        <form class="form-grid" data-add-form>
          <label>
            Quantity
            <input class="input" name="quantity" type="number" min="1" max="${product.stock}" value="1" required>
          </label>
          <button class="btn btn-primary" type="submit"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
          <a class="btn btn-outline" href="products.html">Back to Products</a>
        </form>
        <hr class="divider">
        <form class="form-grid" data-rating-form>
          <h3>Rate this product</h3>
          <div class="rating-options" role="radiogroup" aria-label="Product rating">
            ${[1, 2, 3, 4, 5].map((value) => `
              <label>
                <input type="radio" name="rating" value="${value}" ${value === 5 ? "required" : ""}>
                <span>${value} <i class="fa-solid fa-star"></i></span>
              </label>
            `).join("")}
          </div>
          <label>
            Review comment
            <textarea class="textarea" name="review" placeholder="Optional comment about quality, price, or service"></textarea>
          </label>
          <button class="btn btn-outline" type="submit"><i class="fa-solid fa-star"></i> Submit Rating</button>
        </form>
        <div class="reviews-list" data-reviews>
          ${renderReviews(product.reviews || [])}
        </div>
      </aside>
    `;

  qs("[data-add-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const quantity = Number(new FormData(event.currentTarget).get("quantity"));
    addToCart(product, quantity);
    showNotice(`${quantity} item(s) added to cart.`, "success");
  });

  qs("[data-rating-form]").addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      product = await rateProduct(product.id, data.rating, data.review);
      renderProduct();
      showNotice("Thank you. Your rating has been saved.", "success");
    } catch (error) {
      showNotice(error.message, "error");
    }
  });
}

function renderReviews(reviews) {
  if (!reviews.length) return `<p class="muted">No written reviews yet.</p>`;

  return `
    <h3>Recent Reviews</h3>
    ${reviews.map((review) => `
      <article class="review-item">
        <strong>${review.userName}</strong>
        <span><i class="fa-solid fa-star"></i> ${Number(review.rating || 0).toFixed(1)}</span>
        ${review.review ? `<p>${review.review}</p>` : ""}
      </article>
    `).join("")}
  `;
}
