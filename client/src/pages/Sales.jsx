import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaPrint,
  FaSearch,
  FaTimes
} from "react-icons/fa";
import "../styles/sales.css";

const SALES_API = "http://localhost:5000/api/sales";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

function Sales() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSale, setSelectedSale] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(SALES_API, {
          params: search.trim() ? { search: search.trim() } : {}
        });
        setSales(response.data);
      } catch (requestError) {
        setError("Unable to load sales history. Please check that the backend is running.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const viewSaleDetails = async (id) => {
    try {
      const response = await axios.get(`${SALES_API}/details/${id}`);
      setSelectedSale(response.data);
      setIsDetailsOpen(true);
    } catch (requestError) {
      setError("Unable to load this invoice.");
    }
  };

  const reprintBill = () => {
    if (!selectedSale.length) return;

    const sale = selectedSale[0];
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return;

    receiptWindow.document.write(`
      <html><head><title>${sale.id}</title>
      <style>body{font-family:Arial;padding:24px;color:#111}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}.right{text-align:right}.total{font-size:18px;font-weight:bold;margin-top:18px;text-align:right}</style>
      </head><body>
      <h2 style="text-align:center">RS9 EXPORTS</h2>
      <p><b>Invoice:</b> INV-${sale.id.slice(-6)}<br/><b>Customer:</b> ${sale.customer_name}<br/><b>Mobile:</b> ${sale.customer_mobile || "N/A"}<br/><b>Payment:</b> ${sale.payment_mode}</p>
      <table><thead><tr><th>Product</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead><tbody>
      ${selectedSale.map((item) => `<tr><td>${item.name}</td><td class="right">${item.qty}</td><td class="right">${formatCurrency(item.price)}</td><td class="right">${formatCurrency(item.total)}</td></tr>`).join("")}
      </tbody></table><div class="total">Grand Total: ${formatCurrency(sale.grand_total)}</div>
      </body></html>`);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 300);
  };

  return (
    <section className="sales-page">
      <header className="sales-header">
        <div>
          <h1>Sales Log &amp; Invoices</h1>
          <p>● RS9 EXPORTS</p>
        </div>
        <div className="sales-date-chips">
          <span><FaCalendarAlt /> {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
          <span><FaClock /> {new Date().toLocaleTimeString("en-IN")}</span>
        </div>
      </header>

      <div className="sales-search-panel">
        <FaSearch />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search transactions by Invoice ID, Customer Mobile, Name, or Payment Mode..."
          aria-label="Search sales history"
        />
      </div>

      <div className="sales-table-panel">
        <h2>Sales Log Invoices ({sales.length} Transactions)</h2>
        {error && <p className="sales-message sales-error">{error}</p>}
        {loading ? (
          <p className="sales-message">Loading transactions…</p>
        ) : sales.length === 0 ? (
          <p className="sales-message">No transactions found.</p>
        ) : (
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead><tr><th>Invoice ID</th><th>Date &amp; Time</th><th>Customer Info</th><th>Payment Mode</th><th>Subtotal (₹)</th><th>GST Tax (₹)</th><th>Discount (₹)</th><th>Grand Total (₹)</th><th>Actions</th></tr></thead>
              <tbody>{sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="invoice-id">{sale.invoice_id || `INV-${sale.id.slice(-6)}`}</td>
                  <td><span className="date-cell"><FaCalendarAlt /> {formatDate(sale.date)}</span></td>
                  <td><strong>{sale.customer_name || "Walk-in Customer"}</strong><small>Ph: {sale.customer_mobile || "N/A"}</small></td>
                  <td><span className="payment-badge">{sale.payment_mode}</span></td>
                  <td>{formatCurrency(sale.subtotal)}</td>
                  <td>{formatCurrency(sale.gst_amount)}</td>
                  <td className="discount-value">-{formatCurrency(sale.discount_amount)}</td>
                  <td className="grand-total">{formatCurrency(sale.grand_total)}</td>
                  <td><div className="sales-actions"><button title="View invoice" onClick={() => viewSaleDetails(sale.id)}><FaEye /></button><button title="Print invoice" onClick={() => viewSaleDetails(sale.id)}><FaPrint /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {isDetailsOpen && selectedSale.length > 0 && (
        <div className="sales-modal-backdrop" onMouseDown={() => setIsDetailsOpen(false)}>
          <article className="sales-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsDetailsOpen(false)} aria-label="Close"><FaTimes /></button>
            <h2>Invoice INV-{selectedSale[0].id.slice(-6)}</h2>
            <p className="modal-customer"><strong>{selectedSale[0].customer_name}</strong> · {selectedSale[0].customer_mobile || "No mobile"} · {selectedSale[0].payment_mode}</p>
            <div className="modal-items">{selectedSale.map((item) => <div key={`${item.name}-${item.product_id}`}><span>{item.name} <small>{item.size || ""} {item.color || ""}</small></span><span>{item.qty} × {formatCurrency(item.price)}</span><strong>{formatCurrency(item.total)}</strong></div>)}</div>
            <div className="modal-total"><span>Subtotal {formatCurrency(selectedSale[0].subtotal)}</span><span>GST {formatCurrency(selectedSale[0].gst_amount)}</span><span>Discount -{formatCurrency(selectedSale[0].discount_amount)}</span><strong>Grand Total {formatCurrency(selectedSale[0].grand_total)}</strong></div>
            <button className="print-button" onClick={reprintBill}><FaPrint /> Reprint Invoice</button>
          </article>
        </div>
      )}
    </section>
  );
}

export default Sales;
