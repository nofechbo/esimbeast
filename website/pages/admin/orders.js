import { useState } from "react";

export default function AdminOrders() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "100%", overflowX: "auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Orders</h1>

      {!orders && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginRight: "0.5rem",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "View Orders"}
          </button>
        </form>
      )}

      {error && (
        <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
      )}

      {orders && (
        <>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            Total orders: {orders.length}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Intent ID</th>
                  <th style={thStyle}>Order Time</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Product ID</th>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Countries</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>{order.id}</td>
                    <td style={tdStyle}>{order.orderId || "-"}</td>
                    <td style={tdStyle}>{order.intentId}</td>
                    <td style={tdStyle}>{formatDate(order.orderTime)}</td>
                    <td style={tdStyle}>{order.email}</td>
                    <td style={tdStyle}>{order.productName}</td>
                    <td style={tdStyle}>{order.productId}</td>
                    <td style={tdStyle}>{order.data} GB</td>
                    <td style={tdStyle}>{order.duration} days</td>
                    <td style={tdStyle}>{formatPrice(order.price)}</td>
                    <td style={tdStyle}>{order.countryCodes.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "0.75rem",
  whiteSpace: "nowrap",
};
