export const firebaseConfig = {
  apiKey: "AIzaSyArLkKTBz8BThnKVdQGHRNN4ArQfqpakE8",
  authDomain: "equal-31afc.firebaseapp.com",
  projectId: "equal-31afc",
  storageBucket: "equal-31afc.firebasestorage.app",
  messagingSenderId: "602980580727",
  appId: "1:602980580727:web:1b048816403f88cb383572"
};

export const firebaseReady = !firebaseConfig.apiKey.startsWith("YOUR_");

let apiPromise = null;

export async function getFirebaseApi() {
  if (!firebaseReady) return null;
  if (apiPromise) return apiPromise;

  apiPromise = Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js")
  ]).then(([appModule, authModule, firestoreModule, functionsModule]) => {
    const app = appModule.initializeApp(firebaseConfig);

    return {
      app,
      auth: authModule.getAuth(app),
      db: firestoreModule.getFirestore(app),
      functions: functionsModule.getFunctions(app),
      onAuthStateChanged: authModule.onAuthStateChanged,
      createUserWithEmailAndPassword: authModule.createUserWithEmailAndPassword,
      signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
      signOut: authModule.signOut,
      collection: firestoreModule.collection,
      doc: firestoreModule.doc,
      getDoc: firestoreModule.getDoc,
      getDocs: firestoreModule.getDocs,
      addDoc: firestoreModule.addDoc,
      setDoc: firestoreModule.setDoc,
      updateDoc: firestoreModule.updateDoc,
      deleteDoc: firestoreModule.deleteDoc,
      query: firestoreModule.query,
      where: firestoreModule.where,
      orderBy: firestoreModule.orderBy,
      serverTimestamp: firestoreModule.serverTimestamp,
      httpsCallable: functionsModule.httpsCallable
    };
  });

  return apiPromise;
}

