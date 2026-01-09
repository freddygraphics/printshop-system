export default function Home() {
  return (
    <main style={{padding:16, maxWidth:720, margin:'0 auto'}}>
      <h1>PrintShop Starter</h1>
      <p>Backend API base: {process.env.NEXT_PUBLIC_API_BASE}</p>
      <ul>
        <li><a href="/products">Products</a></li>
        <li><a href="/workflow">Workflow</a></li>
        <li><a href="/invoices">Invoices</a></li>
      </ul>
    </main>
  );
}
