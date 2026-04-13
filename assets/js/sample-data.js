export const sampleProducts = [
  {
    id: "staff-tshirt-2",
    name: "Masvingp Polytechnic Staff T-Shirt",
    department: "Campus Apparel",
    sellerType: "Department",
    price: 10,
    stock: 45,
    rating: 4.6,
    image: "https://i.ibb.co/DH0zQKhm/stafftshirt2.avif",
    summary: "Official staff T-shirt for campus events and daily wear.",
    description: "Comfortable branded staff T-shirt supplied through the campus apparel unit.",
    featured: true
  },
  {
    id: "staff-tshirt",
    name: "Staff T-Shirt",
    department: "Campus Apparel",
    sellerType: "Department",
    price: 10,
    stock: 50,
    rating: 4.5,
    image: "https://i.ibb.co/8g0YpZnh/staff-teshirt.avif",
    summary: "Branded staff T-shirt available for Masvingp Polytechnic staff.",
    description: "A branded staff T-shirt for official programs, open days, and institutional activities.",
    featured: true
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter",
    department: "Food Processing Department",
    sellerType: "Department",
    price: 3.5,
    stock: 75,
    rating: 4.7,
    image: "https://i.ibb.co/hF1yP802/peanutbutter.avif",
    summary: "Locally prepared peanut butter from the campus production unit.",
    description: "Smooth peanut butter prepared for students, staff, households, and campus tuck-shop supply.",
    featured: true
  }
];

export const sampleNews = [
  {
    id: "market-open",
    title: "Online Department Marketplace Open",
    category: "Announcement",
    date: "2026-04-13",
    image: "https://images.unsplash.com/photo-1556741533-411cf82e4e2d?auto=format&fit=crop&w=900&q=80",
    body: "Departments can now list selected products and services for online ordering."
  },
  {
    id: "student-innovation",
    title: "Student Innovation Listings",
    category: "Entrepreneurship",
    date: "2026-04-10",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    body: "Students with approved projects can apply to sell their innovations through the platform."
  },
  {
    id: "farm-delivery",
    title: "Farm Produce Delivery Windows",
    category: "Operations",
    date: "2026-04-07",
    image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=900&q=80",
    body: "Fresh produce deliveries are grouped by address area to keep orders affordable."
  }
];

export const sampleOrders = [
  {
    id: "MP-1001",
    userId: "demo-user",
    customerName: "Demo Customer",
    status: "processing",
    paymentStatus: "paid",
    deliveryAddress: "Masvingp Polytechnic, Main Campus",
    total: 23.5,
    createdAt: "2026-04-13",
    items: [
      { productId: "staff-tshirt", name: "Staff T-Shirt", quantity: 2, price: 10 },
      { productId: "peanut-butter", name: "Peanut Butter", quantity: 1, price: 3.5 }
    ]
  }
];

export const sampleUsers = [
  {
    id: "demo-admin",
    name: "Admin Demo",
    email: "admin@masvingp-polytechnic.ac.zw",
    role: "admin",
    status: "active"
  },
  {
    id: "demo-user",
    name: "Customer Demo",
    email: "customer@example.com",
    role: "customer",
    status: "active"
  }
];
