// ============================================================
// Smart Supply Chain Management System - Backend Server
// Tech: Node.js + Express | Data: In-memory arrays
// ============================================================

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend to call backend
app.use(express.json()); // Parse JSON request bodies

// ──────────────────────────────────────────
// DUMMY DATA
// ──────────────────────────────────────────

// Dummy users for login
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
];

// Sample products
const products = [
  { id: 1, name: "Industrial Gear Set", price: 4999, stock: 50, category: "Mechanical" },
  { id: 2, name: "Smart Sensor Module", price: 1299, stock: 120, category: "Electronics" },
  { id: 3, name: "Heavy Duty Conveyor Belt", price: 8500, stock: 30, category: "Logistics" },
];

// Orders array (starts empty, grows as users place orders)
let orders = [];
let nextOrderId = 1001; // Auto-incrementing order ID

// ──────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────

/**
 * POST /login
 * Body: { username, password }
 * Returns: user info + role on success
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Find matching user
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Return user data (no real JWT here, just simple session simulation)
  res.json({
    success: true,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

/**
 * GET /products
 * Returns: list of all products
 */
app.get("/products", (req, res) => {
  res.json(products);
});

/**
 * POST /order
 * Body: { userId, username, productId, quantity }
 * Returns: newly created order
 */
app.post("/order", (req, res) => {
  const { userId, username, productId, quantity } = req.body;

  // Validate product exists
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Check stock
  if (product.stock < quantity) {
    return res.status(400).json({ error: "Insufficient stock" });
  }

  // Deduct stock
  product.stock -= quantity;

  // Create new order
  const newOrder = {
    id: nextOrderId++,
    userId,
    username,
    productId,
    productName: product.name,
    quantity,
    totalPrice: product.price * quantity,
    status: "Pending", // Default status
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

/**
 * GET /orders
 * Query: ?userId=X (optional, to filter by user)
 * Returns: all orders or filtered by userId
 */
app.get("/orders", (req, res) => {
  const { userId } = req.query;

  if (userId) {
    // Return only this user's orders
    const userOrders = orders.filter((o) => o.userId == userId);
    return res.json(userOrders);
  }

  // Admin: return all orders
  res.json(orders);
});

/**
 * PUT /order/status
 * Body: { orderId, status }
 * Updates the status of an order
 * Valid statuses: Pending → Shipped → Delivered
 */
app.put("/order/status", (req, res) => {
  const { orderId, status } = req.body;

  // Validate status value
  const validStatuses = ["Pending", "Shipped", "Delivered"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  // Find the order
  const order = orders.find((o) => o.id == orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Update status
  order.status = status;
  order.updatedAt = new Date().toISOString();

  res.json({ success: true, order });
});

// ──────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("🚀 Smart Supply Chain Backend is Running Successfully!");
});

// START SERVER (same as yours)
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Supply Chain Backend running at http://localhost:${PORT}`);
});