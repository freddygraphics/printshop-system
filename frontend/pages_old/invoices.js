import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
        const res = await fetch(base + "/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <main style={{ padding: 16 }}>
      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.base_price}
          </li>
        ))}
      </ul>
    </main>
  );
}
