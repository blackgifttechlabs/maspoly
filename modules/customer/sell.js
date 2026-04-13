import { getCurrentUser, saveProduct } from "../../assets/js/firebase-service.js";
import { initLayout, qs, showNotice } from "../../assets/js/ui.js";

initLayout("account");

const form = qs("[data-sell-form]");
const imageUpload = qs("[data-image-upload]");
const imagePreview = qs("[data-image-preview]");
const imageProgress = qs("[data-image-progress]");
const imageProgressBar = imageProgress ? imageProgress.querySelector('.upload-progress-bar') : null;
const user = await getCurrentUser();

if (!user) {
  form.innerHTML = `
    <h2>Login Required</h2>
    <p class="muted">Login to create listings.</p>
    <a class="btn btn-primary" href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Go to Login</a>
  `;
} else {
  // nothing to prefill for now
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!user) return;

  try {
    const data = Object.fromEntries(new FormData(form).entries());
    const product = {
      ...data,
      price: Number(data.price || 0),
      stock: Number(data.stock || 0),
      rating: Number(data.rating || 0),
      sellerType: "Student Project",
      ownerId: user.id
    };

    const id = await saveProduct(product);
    showNotice("Listing saved.", "success");
    form.reset();
    window.location.href = "seller-dashboard.html";
  } catch (err) {
    showNotice(err.message || String(err), "error");
  }
});

imageUpload?.addEventListener("change", async () => {
  const file = imageUpload.files[0];
  if (!file) return;
  try {
    if (imageProgress) {
      imageProgress.hidden = false;
      if (imageProgressBar) imageProgressBar.style.width = '0%';
    }
    const dataUrl = await readImageAsDataUrl(file, (percent) => {
      if (imageProgressBar) imageProgressBar.style.width = percent + '%';
    });
    if (form.elements.image) form.elements.image.value = dataUrl;
    if (imagePreview) imagePreview.innerHTML = `<img src="${dataUrl}" alt="Uploaded preview">`;
  } catch (err) {
    showNotice(err.message || "Image upload failed.", "error");
  } finally {
    if (imageProgress) imageProgress.hidden = true;
  }
});

function readImageAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };
    reader.readAsDataURL(file);
  });
}
