import { firebaseReady, getFirebaseApi, firebaseConfig } from "./firebase-config.js";
import { sampleNews, sampleOrders, sampleProducts, sampleUsers } from "./sample-data.js";

const LOCAL_USERS = "polymart-users";
const LOCAL_ORDERS = "polymart-orders";
const LOCAL_PRODUCTS = "polymart-products";
const LOCAL_NEWS = "polymart-news";
const LOCAL_SESSION = "polymart-session";
const LOCAL_ADMIN_PIN = "polymart-admin-pin";
const LOCAL_ADMIN_UNLOCKED = "polymart-admin-unlocked";
const DEFAULT_ADMIN_PIN = "1677";

function readLocal(key, fallback) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function getProducts() {
  if (!firebaseReady) return readLocal(LOCAL_PRODUCTS, sampleProducts);
  const firebaseApi = await getFirebaseApi();

  const snap = await firebaseApi.getDocs(
    firebaseApi.query(
      firebaseApi.collection(firebaseApi.db, "products"),
      firebaseApi.orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getProduct(id) {
  if (!id) return null;

  if (!firebaseReady) {
    return readLocal(LOCAL_PRODUCTS, sampleProducts).find((item) => item.id === id);
  }
  const firebaseApi = await getFirebaseApi();

  const snap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "products", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveProduct(product) {
  if (!firebaseReady) {
    const products = readLocal(LOCAL_PRODUCTS, sampleProducts);
    const id = product.id || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const next = products.filter((item) => item.id !== id);
    next.unshift({ ...product, id, price: Number(product.price), stock: Number(product.stock), rating: Number(product.rating || 0) });
    writeLocal(LOCAL_PRODUCTS, next);
    return id;
  }
  const firebaseApi = await getFirebaseApi();

  const id = product.id || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.db, "products", id), {
    ...product,
    id,
    price: Number(product.price),
    stock: Number(product.stock),
    rating: Number(product.rating || 0),
    updatedAt: firebaseApi.serverTimestamp(),
    createdAt: product.createdAt || firebaseApi.serverTimestamp()
  }, { merge: true });
  return id;
}

export async function deleteProduct(id) {
  if (!firebaseReady) {
    writeLocal(LOCAL_PRODUCTS, readLocal(LOCAL_PRODUCTS, sampleProducts).filter((item) => item.id !== id));
    return;
  }
  const firebaseApi = await getFirebaseApi();

  await firebaseApi.deleteDoc(firebaseApi.doc(firebaseApi.db, "products", id));
}

export async function rateProduct(productId, rating, review = "") {
  const value = Number(rating);
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    throw new Error("Choose a rating from 1 to 5.");
  }

  const user = await getCurrentUser();
  const ratingRecord = {
    productId,
    rating: value,
    review: review || "",
    userId: user?.id || "guest",
    userName: user?.name || user?.email || "Guest",
    createdAt: stamp()
  };

  if (!firebaseReady) {
    const products = readLocal(LOCAL_PRODUCTS, sampleProducts);
    const product = products.find((item) => item.id === productId);
    if (!product) throw new Error("Product not found.");

    const count = Number(product.ratingCount || 1);
    const currentAverage = Number(product.rating || 0);
    const nextCount = count + 1;
    const nextRating = ((currentAverage * count) + value) / nextCount;

    const updatedProduct = {
      ...product,
      rating: Number(nextRating.toFixed(1)),
      ratingCount: nextCount,
      reviews: [ratingRecord, ...(product.reviews || [])].slice(0, 8)
    };

    writeLocal(LOCAL_PRODUCTS, products.map((item) => item.id === productId ? updatedProduct : item));
    return updatedProduct;
  }

  const firebaseApi = await getFirebaseApi();
  const productRef = firebaseApi.doc(firebaseApi.db, "products", productId);
  const productSnap = await firebaseApi.getDoc(productRef);
  if (!productSnap.exists()) throw new Error("Product not found.");

  const product = { id: productSnap.id, ...productSnap.data() };
  const count = Number(product.ratingCount || 1);
  const currentAverage = Number(product.rating || 0);
  const nextCount = count + 1;
  const nextRating = ((currentAverage * count) + value) / nextCount;

  await firebaseApi.addDoc(firebaseApi.collection(firebaseApi.db, "ratings"), {
    ...ratingRecord,
    createdAt: firebaseApi.serverTimestamp()
  });

  await firebaseApi.updateDoc(productRef, {
    rating: Number(nextRating.toFixed(1)),
    ratingCount: nextCount,
    updatedAt: firebaseApi.serverTimestamp()
  });

  return {
    ...product,
    rating: Number(nextRating.toFixed(1)),
    ratingCount: nextCount
  };
}

export async function getNews() {
  if (!firebaseReady) return readLocal(LOCAL_NEWS, sampleNews);
  const firebaseApi = await getFirebaseApi();

  const snap = await firebaseApi.getDocs(
    firebaseApi.query(firebaseApi.collection(firebaseApi.db, "news"), firebaseApi.orderBy("date", "desc"))
  );
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getArticle(id) {
  if (!id) return null;
  if (!firebaseReady) return readLocal(LOCAL_NEWS, sampleNews).find((item) => item.id === id) || null;
  const firebaseApi = await getFirebaseApi();
  const snap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "news", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveArticle(article) {
  if (!firebaseReady) {
    const news = readLocal(LOCAL_NEWS, sampleNews);
    const id = article.id || article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    writeLocal(LOCAL_NEWS, [{ ...article, id, date: article.date || stamp() }, ...news.filter((item) => item.id !== id)]);
    return id;
  }
  const firebaseApi = await getFirebaseApi();

  const id = article.id || article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.db, "news", id), {
    ...article,
    id,
    date: article.date || stamp(),
    updatedAt: firebaseApi.serverTimestamp()
  }, { merge: true });
  return id;
}

export async function deleteArticle(id) {
  if (!firebaseReady) {
    writeLocal(LOCAL_NEWS, readLocal(LOCAL_NEWS, sampleNews).filter((item) => item.id !== id));
    return;
  }
  const firebaseApi = await getFirebaseApi();

  await firebaseApi.deleteDoc(firebaseApi.doc(firebaseApi.db, "news", id));
}

export async function getOrders(userId = null) {
  if (!firebaseReady) {
    const orders = readLocal(LOCAL_ORDERS, sampleOrders);
    return userId ? orders.filter((order) => order.userId === userId || userId === "demo-user") : orders;
  }
  const firebaseApi = await getFirebaseApi();

  const base = firebaseApi.collection(firebaseApi.db, "orders");
  const q = userId
    ? firebaseApi.query(base, firebaseApi.where("userId", "==", userId), firebaseApi.orderBy("createdAt", "desc"))
    : firebaseApi.query(base, firebaseApi.orderBy("createdAt", "desc"));
  const snap = await firebaseApi.getDocs(q);
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function createOrder(order) {
  if (!firebaseReady) {
    const orders = readLocal(LOCAL_ORDERS, sampleOrders);
    const id = `MP-${Math.floor(1000 + Math.random() * 9000)}`;
    const saved = { ...order, id, status: "pending", paymentStatus: "awaiting-payment", createdAt: stamp() };
    writeLocal(LOCAL_ORDERS, [saved, ...orders]);
    return saved;
  }
  const firebaseApi = await getFirebaseApi();

  const ref = await firebaseApi.addDoc(firebaseApi.collection(firebaseApi.db, "orders"), {
    ...order,
    status: "pending",
    paymentStatus: "awaiting-payment",
    createdAt: firebaseApi.serverTimestamp(),
    updatedAt: firebaseApi.serverTimestamp()
  });
  return { ...order, id: ref.id, status: "pending", paymentStatus: "awaiting-payment" };
}

export async function updateOrderStatus(id, status) {
  if (!firebaseReady) {
    const orders = readLocal(LOCAL_ORDERS, sampleOrders);
    writeLocal(LOCAL_ORDERS, orders.map((order) => order.id === id ? { ...order, status } : order));
    return;
  }
  const firebaseApi = await getFirebaseApi();

  await firebaseApi.updateDoc(firebaseApi.doc(firebaseApi.db, "orders", id), {
    status,
    updatedAt: firebaseApi.serverTimestamp()
  });
}

export async function getUsers() {
  if (!firebaseReady) return readLocal(LOCAL_USERS, sampleUsers);
  const firebaseApi = await getFirebaseApi();

  const snap = await firebaseApi.getDocs(firebaseApi.collection(firebaseApi.db, "users"));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function registerUser({ name, email, password }) {
  if (!firebaseReady) {
    const users = readLocal(LOCAL_USERS, sampleUsers);
    if (users.some((user) => user.email === email)) throw new Error("Email already registered.");
    const user = { id: `local-${Date.now()}`, name, email, role: "customer", status: "active" };
    writeLocal(LOCAL_USERS, [...users, user]);
    writeLocal(LOCAL_SESSION, user);
    return user;
  }
  const firebaseApi = await getFirebaseApi();

  const credential = await firebaseApi.createUserWithEmailAndPassword(firebaseApi.auth, email, password);
  const user = { id: credential.user.uid, name, email, role: "customer", status: "active" };
  await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.db, "users", credential.user.uid), {
    ...user,
    createdAt: firebaseApi.serverTimestamp()
  });
  return user;
}

export async function loginUser({ email, password }) {
  if (!firebaseReady) {
    const user = readLocal(LOCAL_USERS, sampleUsers).find((item) => item.email === email);
    if (!user) throw new Error("Account not found in local demo data.");
    writeLocal(LOCAL_SESSION, user);
    return user;
  }
  const firebaseApi = await getFirebaseApi();

  const credential = await firebaseApi.signInWithEmailAndPassword(firebaseApi.auth, email, password);
  const snap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "users", credential.user.uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : { id: credential.user.uid, email };
}

export async function logoutUser() {
  if (!firebaseReady) {
    localStorage.removeItem(LOCAL_SESSION);
    return;
  }
  const firebaseApi = await getFirebaseApi();

  await firebaseApi.signOut(firebaseApi.auth);
}

export async function getCurrentUser() {
  if (!firebaseReady) return readLocal(LOCAL_SESSION, null);
  const firebaseApi = await getFirebaseApi();

  return new Promise((resolve) => {
    const unsubscribe = firebaseApi.onAuthStateChanged(firebaseApi.auth, async (authUser) => {
      unsubscribe();
      if (!authUser) {
        resolve(null);
        return;
      }
      const snap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "users", authUser.uid));
      resolve(snap.exists() ? { id: snap.id, ...snap.data() } : { id: authUser.uid, email: authUser.email });
    });
  });
}

export async function updateUserProfile(profile) {
  const cleaned = {
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    notes: profile.notes || ""
  };

  if (!firebaseReady) {
    const current = readLocal(LOCAL_SESSION, null);
    if (!current) throw new Error("Login is required before saving account details.");

    const user = { ...current, ...cleaned };
    const users = readLocal(LOCAL_USERS, sampleUsers);
    writeLocal(LOCAL_USERS, users.map((item) => item.id === user.id ? { ...item, ...user } : item));
    writeLocal(LOCAL_SESSION, user);
    return user;
  }

  const firebaseApi = await getFirebaseApi();

  const authUser = firebaseApi.auth.currentUser;
  // If not authenticated, create or reuse an anonymous user id for testing.
  const uid = authUser ? authUser.uid : `anon-${localStorage.getItem(LOCAL_SESSION) || Date.now()}`;

  await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.db, "users", uid), {
    ...cleaned,
    updatedAt: firebaseApi.serverTimestamp()
  }, { merge: true });

  const snap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : { id: uid, ...cleaned };
}

export async function banUser(id, status) {
  if (!firebaseReady) {
    const users = readLocal(LOCAL_USERS, sampleUsers);
    writeLocal(LOCAL_USERS, users.map((user) => user.id === id ? { ...user, status } : user));
    return;
  }
  const firebaseApi = await getFirebaseApi();

  await firebaseApi.updateDoc(firebaseApi.doc(firebaseApi.db, "users", id), { status });
}

export async function createPayNowCheckout(order) {
  if (!firebaseReady) {
    return {
      message: "Demo checkout complete. Add Firebase config and PayNow Cloud Function credentials for live payments.",
      redirectUrl: `orders.html?order=${encodeURIComponent(order.id)}`
    };
  }
  const firebaseApi = await getFirebaseApi();

  // Update the order document directly from the client (for testing/demo).
  const orderRef = firebaseApi.doc(firebaseApi.db, "orders", order.id);
  await firebaseApi.updateDoc(orderRef, {
    paymentProvider: "PayNow",
    paymentStatus: "checkout-started",
    updatedAt: firebaseApi.serverTimestamp()
  });

  return {
    message: "Client-side checkout started.",
    redirectUrl: `/pages/orders.html?order=${encodeURIComponent(order.id)}`
  };
}

export async function markInventoryAfterPayment(orderId) {
  if (!firebaseReady) {
    // local demo: adjust local storage orders/products
    const orders = readLocal(LOCAL_ORDERS, sampleOrders);
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found.");

    const products = readLocal(LOCAL_PRODUCTS, sampleProducts);
    const nextProducts = products.map((p) => {
      const item = (order.items || []).find((i) => i.productId === p.id);
      if (!item) return p;
      return { ...p, stock: Math.max((p.stock || 0) - Number(item.quantity || 0), 0) };
    });
    writeLocal(LOCAL_PRODUCTS, nextProducts);

    writeLocal(LOCAL_ORDERS, orders.map((o) => o.id === orderId ? { ...o, paymentStatus: "paid", status: "processing" } : o));
    return { ok: true };
  }

  const firebaseApi = await getFirebaseApi();
  const db = firebaseApi.db;

  const orderSnap = await firebaseApi.getDoc(firebaseApi.doc(db, "orders", orderId));
  if (!orderSnap.exists()) throw new Error("Order not found.");
  const order = { id: orderSnap.id, ...orderSnap.data() };

  const items = order.items || [];
  for (const item of items) {
    const productRef = firebaseApi.doc(db, "products", item.productId);
    const productSnap = await firebaseApi.getDoc(productRef);
    if (productSnap.exists()) {
      const stock = productSnap.data().stock || 0;
      await firebaseApi.updateDoc(productRef, {
        stock: Math.max(stock - Number(item.quantity || 0), 0),
        updatedAt: firebaseApi.serverTimestamp()
      });
    }
  }

  await firebaseApi.updateDoc(firebaseApi.doc(db, "orders", orderId), {
    paymentStatus: "paid",
    status: "processing",
    updatedAt: firebaseApi.serverTimestamp()
  });

  return { ok: true };
}

export async function getAdminPin() {
  return localStorage.getItem(LOCAL_ADMIN_PIN) || DEFAULT_ADMIN_PIN;
}

export async function verifyAdminPin(pin) {
  const currentPin = await getAdminPin();
  const ok = String(pin).trim() === currentPin;
  if (ok) localStorage.setItem(LOCAL_ADMIN_UNLOCKED, "true");
  return ok;
}

export function isAdminUnlocked() {
  return localStorage.getItem(LOCAL_ADMIN_UNLOCKED) === "true";
}

export function lockAdmin() {
  localStorage.removeItem(LOCAL_ADMIN_UNLOCKED);
}

export async function updateAdminPin({ currentPin, newPin }) {
  const existing = await getAdminPin();
  if (String(currentPin).trim() !== existing) {
    throw new Error("Current PIN is incorrect.");
  }

  if (!/^\d{4,8}$/.test(String(newPin).trim())) {
    throw new Error("New PIN must be 4 to 8 digits.");
  }

  localStorage.setItem(LOCAL_ADMIN_PIN, String(newPin).trim());
  localStorage.setItem(LOCAL_ADMIN_UNLOCKED, "true");
  return true;
}
