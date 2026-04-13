import { deleteProduct, getProducts, saveProduct } from "../../assets/js/firebase-service.js";
import { initLayout, money, qs } from "../../assets/js/ui.js";
import { renderAdminTabs, requireAdminPin } from "./admin-ui.js";

initLayout("admin");

if (await requireAdminPin()) {
  renderAdminTabs("products");

  const form = qs("[data-product-form]");
  const list = qs("[data-product-list]");
  const imageUpload = qs("[data-image-upload]");
  const imagePreview = qs("[data-image-preview]");
  let products = await getProducts();

  function render() {
    list.innerHTML = products.length
      ? products.map((product) => `
          <div class="table-row">
            <div>
              <strong>${product.name}</strong>
              <span class="muted">${product.department} · ${money.format(product.price)} · ${product.stock} in stock</span>
            </div>
            <button class="btn btn-outline" type="button" data-edit="${product.id}"><i class="fa-solid fa-pen"></i> Edit</button>
            <button class="btn btn-danger" type="button" data-delete="${product.id}"><i class="fa-solid fa-trash"></i> Delete</button>
          </div>
        `).join("")
      : `<div class="empty">No products yet.</div>`;

    list.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const product = products.find((item) => item.id === button.dataset.edit);
        Object.entries(product).forEach(([key, value]) => {
          if (!form.elements[key]) return;
          if (form.elements[key].type === "checkbox") {
            form.elements[key].checked = Boolean(value);
          } else {
            form.elements[key].value = value;
          }
        });
        if (product.image) imagePreview.innerHTML = `<img src="${product.image}" alt="${product.name} preview">`;
        form.querySelector("h2").textContent = "Edit Product";
      });
    });

    list.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        await deleteProduct(button.dataset.delete);
        products = await getProducts();
        render();
      });
    });
  }

  imageUpload.addEventListener("change", async () => {
    const file = imageUpload.files[0];
    if (!file) return;
    const dataUrl = await readImageAsDataUrl(file);
    form.elements.image.value = dataUrl;
    imagePreview.innerHTML = `<img src="${dataUrl}" alt="Uploaded product preview">`;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.image) {
      alert("Add an image URL or upload an image file.");
      return;
    }
    await saveProduct({ ...data, rating: 0, featured: data.featured === "on" });
    form.reset();
    imagePreview.innerHTML = "";
    form.querySelector("h2").textContent = "Add Product";
    products = await getProducts();
    render();
  });

  render();
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
}
