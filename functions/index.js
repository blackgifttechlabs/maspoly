const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

admin.initializeApp();

exports.createPayNowCheckout = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login is required before checkout.");
  }

  const { orderId, amount, email } = request.data || {};
  if (!orderId || !amount || !email) {
    throw new HttpsError("invalid-argument", "orderId, amount, and email are required.");
  }

  await admin.firestore().collection("orders").doc(orderId).update({
    paymentProvider: "PayNow",
    paymentStatus: "checkout-started",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    message: "Connect this function to the PayNow SDK or API using server-side credentials.",
    redirectUrl: `/pages/orders.html?order=${encodeURIComponent(orderId)}`
  };
});

exports.markInventoryAfterPayment = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login is required.");
  }

  const { orderId } = request.data || {};
  if (!orderId) {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }

  const db = admin.firestore();
  const orderRef = db.collection("orders").doc(orderId);

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", "Order not found.");
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

  return { ok: true };
});

