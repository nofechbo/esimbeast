// @ts-nocheck
import { useMemo, useState } from "react";

export default function AdminOrders() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState("all");

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

  const supplierOrderRef = (order) => {
    const d = order.supplierOrderData;
    if (!d) return "-";
    return d.rcode ?? d.esimTranNo ?? JSON.stringify(d);
  };

  const suppliers = useMemo(() => {
    if (!orders) return [];
    return [...new Set(orders.map((o) => o.supplier).filter(Boolean))].sort();
  }, [orders]);

  const supplierBreakdown = useMemo(() => {
    if (!orders) return [];
    const map = new Map();
    for (const o of orders) {
      const key = o.supplier || "unknown";
      const entry = map.get(key) || { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += o.price;
      map.set(key, entry);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (supplierFilter === "all") return orders;
    return orders.filter((o) => o.supplier === supplierFilter);
  }, [orders, supplierFilter]);

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
          <p style={{ marginBottom: "0.5rem", color: "#666" }}>
            Total orders: {orders.length}
            {supplierBreakdown.length > 0 && (
              <>
                {" · "}
                {supplierBreakdown
                  .map(
                    ([name, { count, revenue }]) =>
                      `${name}: ${count} (${formatPrice(revenue)})`
                  )
                  .join(" · ")}
              </>
            )}
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#666", marginRight: "0.5rem" }}>
              Filter by supplier:
            </label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              style={{
                padding: "0.4rem 0.6rem",
                fontSize: "0.9rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="all">All ({orders.length})</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>
                  {s} ({orders.filter((o) => o.supplier === s).length})
                </option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Supplier Order Ref</th>
                  <th style={thStyle}>Intent ID</th>
                  <th style={thStyle}>Order Time</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Product ID</th>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Countries</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>{order.id}</td>
                    <td style={tdStyle}>{order.orderId || "-"}</td>
                    <td style={tdStyle}>{order.supplier || "-"}</td>
                    <td style={tdStyle}>{supplierOrderRef(order)}</td>
                    <td style={tdStyle}>{order.intentId}</td>
                    <td style={tdStyle}>{formatDate(order.orderTime)}</td>
                    <td style={tdStyle}>{order.email}</td>
                    <td style={tdStyle}>{order.status}</td>
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
