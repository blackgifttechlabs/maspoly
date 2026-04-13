const admin = require("firebase-admin");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");

admin.initializeApp();

exports.createPayNowCheckout = onRequest(async (req, res) => {
  // Allow CORS for testing. In production restrict origins.
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const { orderId, amount, email } = req.method === "GET" ? req.query : req.body || {};
    if (!orderId || !amount || !email) {
      return res.status(400).json({ error: "orderId, amount, and email are required." });
    }

    await admin.firestore().collection("orders").doc(orderId).update({
      paymentProvider: "PayNow",
      paymentStatus: "checkout-started",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({
      message: "Connect this function to the PayNow SDK or API using server-side credentials.",
      redirectUrl: `/pages/orders.html?order=${encodeURIComponent(orderId)}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

exports.markInventoryAfterPayment = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const { orderId } = req.method === "GET" ? req.query : req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId is required." });

    const db = admin.firestore();
    const orderRef = db.collection("orders").doc(orderId);

    await db.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) {
        throw new Error("Order not found.");
      }

      const order = orderSnap.data();
      const items = order.items || [];

      for (const item of items) {
        const productRef = db.collection("products").doc(item.productId);
        const productSnap = await transaction.get(productRef);
        if (productSnap.exists) {
          const stock = productSnap.data().stock || 0;
          transaction.update(productRef, {
            stock: Math.max(stock - Number(item.quantity || 0), 0),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      transaction.update(orderRef, {
        paymentStatus: "paid",
        status: "processing",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

