import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// ==============================
// 🔗 Conexión a PostgreSQL
// ==============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool
  .connect()
  .then(() => console.log("🟢 Connected to PostgreSQL"))
  .catch((err) => console.error("🔴 Database connection error:", err.stack));

// ==============================
// ✅ Ruta principal
// ==============================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🟢 Backend is running correctly",
    time: new Date().toISOString(),
  });
});

// ==============================
// 👥 CLIENTES
// ==============================
app.get("/api/clients", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/clients", async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==============================
// 🧱 PLANTILLAS (HYBRID FLOW)
// ==============================
app.post("/api/templates", async (req, res) => {
  const { name, description, fields } = req.body;
  try {
    if (!name || !fields) {
      return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

 const { name, category, description, fields } = req.body;
const result = await pool.query(
  "INSERT INTO product_templates (name, category, description, fields) VALUES ($1, $2, $3, $4::jsonb) RETURNING *",
  [name, category || "General", description || "", JSON.stringify(fields)]
);


    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating template:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});


app.get("/api/templates", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM product_templates ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching templates:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/api/templates/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM product_templates WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Template not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching template:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==============================
// 🛍️ PRODUCTOS
// ==============================
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Producto por ID
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const productResult = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (productResult.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    const product = productResult.rows[0];
    const optionsResult = await pool.query(
      "SELECT data FROM product_options WHERE product_id = $1",
      [id]
    );
    product.options = optionsResult.rows.map((o) => o.data);
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Crear producto normal
app.post("/api/products", async (req, res) => {
  const { name, category, description, base_price, status, options } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (name, category, description, base_price, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, category, description, base_price || 0, status || "Active"]
    );

    const productId = result.rows[0].id;
    if (options && Array.isArray(options)) {
      for (const opt of options) {
        await pool.query(
          "INSERT INTO product_options (product_id, data) VALUES ($1, $2::jsonb)",
          [productId, JSON.stringify(opt)]
        );
      }
    }

    res.json({ status: "ok", id: productId });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Crear producto basado en plantilla
app.post("/api/products/from-template", async (req, res) => {
  const { template_id, name, client_id, custom_fields, notes } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (template_id, name, client_id, custom_fields, notes) VALUES ($1, $2, $3, $4::jsonb, $5) RETURNING *",
      [template_id, name, client_id || null, JSON.stringify(custom_fields), notes || ""]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating product from template:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==============================
// 🧾 INVOICES
// ==============================
app.get("/api/invoices", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoices ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/invoices", async (req, res) => {
  const { client_id, total, status, payment_link } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO invoices (client_id, total, status, payment_link) VALUES ($1, $2, $3, $4) RETURNING *",
      [client_id, total, status || "Pending", payment_link || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==============================
// ⚙️ ÓRDENES / WORKFLOW
// ==============================
app.get("/api/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.put("/api/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==============================
// 🚀 INICIAR SERVIDOR
// ==============================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend listening on port ${PORT}`));
