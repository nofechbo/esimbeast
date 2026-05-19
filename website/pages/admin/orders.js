// @ts-nocheck
import { useEffect, useMemo, useState } from "react";

export default function AdminOrders() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 3;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const orderFields = (order) => [
    ["ID", order.id],
    ["Order ID", order.orderId || "-"],
    ["Supplier", order.supplier || "-"],
    ["Supplier Order Ref", supplierOrderRef(order)],
    ["Intent ID", order.intentId],
    ["Order Time", formatDate(order.orderTime)],
    ["Email", order.email],
    ["Status", order.status],
    ["Product", order.productName],
    ["Product ID", order.productId],
    ["Data", `${order.data} GB`],
    ["Duration", `${order.duration} days`],
    ["Price", formatPrice(order.price)],
    ["Countries", order.countryCodes?.join(", ") ?? "-"],
  ];

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
    <div
      style={{
        padding: isMobile ? "90px 1rem 1rem" : "100px 2rem 2rem",
        fontFamily: "sans-serif",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <h1 style={{ marginBottom: "1.5rem", fontSize: isMobile ? "1.5rem" : "2rem" }}>
        Orders
      </h1>

      {!orders && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: "1rem",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "0.5rem",
            maxWidth: isMobile ? "100%" : "400px",
          }}
        >
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
              flex: 1,
              minWidth: 0,
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
              width: isMobile ? "100%" : "auto",
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
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setPage(0);
              }}
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

          {isMobile ? (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filteredOrders
                .slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
                .map((order) => (
                <div
                  key={order.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  {orderFields(order).map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "0.4rem 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span style={{ color: "#666", fontWeight: 600, flexShrink: 0 }}>
                        {label}
                      </span>
                      <span
                        style={{
                          textAlign: "right",
                          wordBreak: "break-word",
                          minWidth: 0,
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              </div>

              {filteredOrders.length > PAGE_SIZE && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={pageBtnStyle(page === 0)}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: "0.85rem", color: "#666" }}>
                    Page {page + 1} of{" "}
                    {Math.ceil(filteredOrders.length / PAGE_SIZE)}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) =>
                        (p + 1) * PAGE_SIZE < filteredOrders.length ? p + 1 : p
                      )
                    }
                    disabled={
                      (page + 1) * PAGE_SIZE >= filteredOrders.length
                    }
                    style={pageBtnStyle(
                      (page + 1) * PAGE_SIZE >= filteredOrders.length
                    )}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    {orderFields(filteredOrders[0] ?? {}).map(([label]) => (
                      <th key={label} style={thStyle}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                      {orderFields(order).map(([label, value]) => (
                        <td key={label} style={tdStyle}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

const pageBtnStyle = (disabled) => ({
  padding: "0.5rem 1.25rem",
  fontSize: "0.9rem",
  backgroundColor: disabled ? "#ccc" : "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: disabled ? "not-allowed" : "pointer",
});
