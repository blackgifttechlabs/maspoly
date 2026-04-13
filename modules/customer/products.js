import { getProducts } from "../../assets/js/firebase-service.js";
import { initLayout, productCard, qs } from "../../assets/js/ui.js";

initLayout("products");

const products = await getProducts();
const search = qs("[data-search]");
const department = qs("[data-department]");
const sort = qs("[data-sort]");
const list = qs("[data-products]");

const departments = [...new Set(products.map((product) => product.department))].sort();
department.innerHTML += departments.map((name) => `<option value="${name}">${name}</option>`).join("");

function render() {
  const term = search.value.trim().toLowerCase();
  let filtered = products.filter((product) => {
    const matchesTerm = [product.name, product.department, product.summary, product.sellerType]
      .join(" ")
      .toLowerCase()
      .includes(term);
    const matchesDepartment = !department.value || product.department === department.value;
    return matchesTerm && matchesDepartment;
  });

  if (sort.value === "price-low") filtered = filtered.sort((a, b) => a.price - b.price);
  if (sort.value === "price-high") filtered = filtered.sort((a, b) => b.price - a.price);
  if (sort.value === "rating") filtered = filtered.sort((a, b) => b.rating - a.rating);
  if (sort.value === "name") filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));

  list.innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : `<div class="empty">No products match your filters.</div>`;
}

[search, department, sort].forEach((control) => control.addEventListener("input", render));
render();

