import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Barcode from "react-barcode";
import { FaCalendarAlt, FaClock, FaInfoCircle, FaPlus, FaPrint, FaTrash } from "react-icons/fa";
import "../styles/barcode.css";
import "../styles/stickerLabel.css";

const STORE_NAME = "RS9 TRENDS";

function BarcodePrinter() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [queue, setQueue] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    axios.get("http://localhost:5000/api/products").then((res) => setProducts(res.data)).catch(console.error);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const labels = useMemo(() => queue.flatMap((item) => Array.from({ length: Math.max(1, Number(item.copies) || 1) }, (_, index) => ({ ...item, labelId: `${item.id}-${index}` }))), [queue]);

  const addQueue = () => {
    const product = products.find((item) => item.id === selectedProduct);
    if (!product) return;
    setQueue((items) => {
      const existing = items.find((item) => item.id === product.id);
      return existing ? items.map((item) => item.id === product.id ? { ...item, copies: item.copies + 1 } : item) : [...items, { ...product, copies: 1 }];
    });
    setSelectedProduct("");
  };

  const updateCopies = (id, copies) => setQueue((items) => items.map((item) => item.id === id ? { ...item, copies: Math.max(1, Number(copies) || 1) } : item));

  return <section className="barcode-page">
    <header className="barcode-header">
      <div><h1>Barcode Label Printing</h1><p>● RS9 EXPORTS</p></div>
      <div className="barcode-date-chips"><span><FaCalendarAlt /> {time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span><span><FaClock /> {time.toLocaleTimeString("en-IN")}</span></div>
    </header>

    <main className="barcode-main">
      <section className="barcode-toolbar">
        <label>Select Product to Add to Print Queue<select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}><option value="">-- Choose Product --</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.code || product.barcode}</option>)}</select></label>
        <button className="barcode-add" onClick={addQueue} disabled={!selectedProduct}><FaPlus /> Add to Queue</button>
        <button className="barcode-clear" onClick={() => setQueue([])} disabled={!queue.length}>Clear Queue</button>
        <button className="barcode-print" onClick={() => window.print()} disabled={!labels.length}><FaPrint /> Print Sheet</button>
      </section>

      <div className="barcode-workspace">
        <section className="print-queue-card"><h2>Print Job Queue ({queue.length} Products)</h2>{queue.length ? <div className="queue-table-wrap"><table className="queue-table"><thead><tr><th>Product</th><th>Code / Barcode</th><th>Size / Color</th><th>Copies</th><th>Remove</th></tr></thead><tbody>{queue.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.brand || "Unbranded"}</small></td><td><strong>{item.code || "—"}</strong><small>Barcode: {item.barcode || "—"}</small></td><td><span className="queue-size">{item.size || "Free Size"}</span> <span>{item.color || "—"}</span></td><td><input aria-label={`Copies for ${item.name}`} type="number" min="1" value={item.copies} onChange={(event) => updateCopies(item.id, event.target.value)} /></td><td><button className="queue-delete" onClick={() => setQueue((items) => items.filter((queueItem) => queueItem.id !== item.id))} aria-label={`Remove ${item.name}`}><FaTrash /></button></td></tr>)}</tbody></table></div> : <p className="empty-queue">Select a product above to start your print queue.</p>}</section>

        <section className="label-preview-card"><h2>Sheet Live Preview ({labels.length} Labels)</h2><p><FaInfoCircle /> This is the exact 50 × 25 mm layout that will print on your sticker sheet.</p><div className="print-sheet">{labels.length ? labels.map((item) => <StickerLabel key={item.labelId} product={item} />) : <div className="empty-preview">Your label preview will appear here.</div>}</div></section>
      </div>
    </main>
  </section>;
}

function StickerLabel({ product }) {
  const barcodeValue = String(product.barcode || product.code || product.id);
  return <article className="sticker-label">
    <strong className="sticker-shop-name">{STORE_NAME}</strong>
    <div className="sticker-label-body">
      <div className="sticker-product">{product.name}</div>
      <div className="sticker-details"><span>Sz: {product.size || "Free Size"}</span><span>Col: {product.color || "—"}</span></div>
      <div className="sticker-divider" />
      <Barcode value={barcodeValue} format="CODE128" width={1.05} height={34} margin={0} displayValue={false} background="#fff" />
      <span className="sticker-barcode">{barcodeValue}</span>
      <strong className="sticker-mrp">MRP: ₹{Number(product.mrp || product.selling_price || 0).toFixed(2)}</strong>
    </div>
  </article>;
}

export default BarcodePrinter;
