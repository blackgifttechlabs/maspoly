# Polymart

University e-commerce website project for Group 17 from Masvingp Polytechnic, supervised by Mr. Tshuma.

Polymart is a Firebase-ready online marketplace where university departments and students can sell products and services to students, alumni, staff, and the public.

## Features

- Customer registration and login
- Customer account profile for saved purchasing and delivery information
- Product browsing, search, department filters, and product details
- Cart, checkout, delivery address capture, and order tracking
- PayNow checkout handoff placeholder through Firebase Cloud Functions
- Product ratings and reviews
- News and customer updates
- Admin pages for dashboard, products, orders, news, users, and settings
- Admin product image uploads converted to base64 data URLs for database storage
- Student entrepreneurship product support

## Project Structure

```text
.
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── cart-store.js
│       ├── firebase-config.js
│       ├── firebase-service.js
│       ├── sample-data.js
│       └── ui.js
├── functions/
│   ├── index.js
│   └── package.json
├── modules/
│   ├── admin/
│   └── customer/
├── pages/
│   ├── admin/
│   └── customer pages
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
└── index.html
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Create a Firestore database.
4. Enable Firebase Hosting if you want to deploy the static site.
5. Copy your Firebase web app credentials into `assets/js/firebase-config.js`.
6. Add a Google Maps browser API key in `assets/js/google-maps-config.js` to enable the checkout map picker.
7. Deploy rules with:

```bash
firebase deploy --only firestore:rules
```

The app falls back to sample data and local storage while the Firebase config contains placeholder values.

## Admin Access

The demo admin PIN is `1677`. It can be changed from the admin settings page. For production, replace the browser PIN with Firebase Authentication roles or server-side authorization.

## Running Locally

This is a static site, so you can open `index.html` directly. For module imports, a small local server is better:

```bash
npx serve .
```

Then open the printed localhost URL.

## PayNow

Do not put PayNow integration IDs or keys in browser JavaScript. The checkout page calls a placeholder Firebase Cloud Function endpoint. Add real PayNow merchant credentials as function secrets and complete the function in `functions/index.js`.
