import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  FaSearch,
  FaShoppingBag,
  FaCamera,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCalendarAlt,
  FaClock,
  FaPrint,
  FaTimes
} from "react-icons/fa";

import "../styles/posterminal.css";
const STORE_SETTINGS_KEY = "clothing-pos-store-settings";
const DEFAULT_STORE = { storeName: "RS9 EXPORTS", storeAddress: "RAINTECH BUILDING, VADAYAR PO, KOTTAYAM, KERALA", contactNumber: "+91 8078311945", gstin: "32AAAAA1111A1Z1" };
const POSTerminal = ({ user, onStaffChange }) => {

const [products, setProducts] = useState([]);

const [cart, setCart] = useState([]);

const [search, setSearch] = useState("");

const [gridFilter, setGridFilter] = useState("");
const [showScanner, setShowScanner] = useState(false);
const [scannerMessage, setScannerMessage] = useState("");
const scannerVideoRef = useRef(null);
const scannerStreamRef = useRef(null);
const scannerControlsRef = useRef(null);

const [category, setCategory] =
  useState("ALL");

const [paymentMode, setPaymentMode] =
  useState("Cash");

const [cashReceived, setCashReceived] =
  useState("");

const [showStaffAccess, setShowStaffAccess] = useState(false);
const [staffEmail, setStaffEmail] = useState("");
const [staffPassword, setStaffPassword] = useState("");
const [staffAccessError, setStaffAccessError] = useState("");
const [isVerifyingStaff, setIsVerifyingStaff] = useState(false);

const [showCheckout, setShowCheckout] =
  useState(false);

const [showInvoice, setShowInvoice] =
  useState(false);

const [invoiceData, setInvoiceData] =
  useState(null);

const [dateTime, setDateTime] =
  useState(new Date());

 
useEffect(() => {
  const timer = setInterval(() => {
    setDateTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);

 



const removeItem = (id) => {
  setCart((prev) =>
    prev.filter(
      (item) => item.id !== id
    )
  );
};
  

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);

      if (existing) {
        if (existing.qty >= Number(product.stock || 0)) {
          alert("No More Stock");
          return prevCart;
        }

        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          qty: 1,
          discountPercent: 0
        }
      ];
    });
  };

  const closeScanner = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    scannerStreamRef.current?.getTracks().forEach((track) => track.stop());
    scannerStreamRef.current = null;
    setShowScanner(false);
    setScannerMessage("");
  };

  useEffect(() => {
    if (!showScanner) return undefined;
    let isActive = true;

    const startScanner = async () => {
      try {
        setScannerMessage("Point the camera at a product barcode.");
        const video = scannerVideoRef.current;
        if (!video) return;
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          video,
          (result) => {
            if (!isActive || !result) return;
            const barcode = result.getText().trim();
            const product = products.find((item) => String(item.barcode).trim() === barcode);
            if (product) {
              addToCart(product);
              closeScanner();
              return;
            }
            setScannerMessage(`Barcode ${barcode} was not found in your products.`);
          }
        );
        if (!isActive) return controls.stop();
        scannerControlsRef.current = controls;
      } catch (error) {
        setScannerMessage(error.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access and try again." : "Unable to start the camera. Check that it is not being used by another app.");
      }
    };

    startScanner();
    return () => {
      isActive = false;
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
      scannerStreamRef.current?.getTracks().forEach((track) => track.stop());
      scannerStreamRef.current = null;
    };
  }, [showScanner, products]);

  const changeStaff = async (event) => {
    event.preventDefault();
    setStaffAccessError("");
    setIsVerifyingStaff(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: staffEmail,
        password: staffPassword,
        role: "staff"
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onStaffChange(response.data.user);
      setShowStaffAccess(false);
      setStaffEmail("");
      setStaffPassword("");
    } catch (error) {
      setStaffAccessError(error.response?.data?.message || "Staff access could not be verified.");
    } finally {
      setIsVerifyingStaff(false);
    }
  };

  const increaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          if (item.qty >= Number(item.stock || 0)) {
            alert("No More Stock");
            return item;
          }

          return {
            ...item,
            qty: item.qty + 1
          };
        }

        return item;
      })
    );
  };

  const decreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty: item.qty - 1
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

const subtotal = cart.reduce((sum, item) => {
  const itemSubtotal = Number(item.qty || 0) * Number(item.selling_price || 0);
  const discountAmount = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
  return sum + (itemSubtotal - discountAmount);
}, 0);

const cgstAmount = subtotal * 0.06;
const sgstAmount = subtotal * 0.06;
const totalTaxAmount = cgstAmount + sgstAmount;

const discountAmount = cart.reduce((sum, item) => {
  const itemSubtotal = Number(item.qty || 0) * Number(item.selling_price || 0);
  const discountAmt = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
  return sum + discountAmt;
}, 0);

const grandTotal = subtotal + totalTaxAmount;

const printReceipt = (bill = invoiceData) => {
  if (!bill) return;
  const receiptWindow = window.open("", "_blank", "width=420,height=720");
  if (!receiptWindow) return alert("Please allow pop-ups to print the receipt.");
  const money = (amount) => `&#8377;${Number(amount || 0).toFixed(2)}`;
  const safe = (value = "") => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rows = bill.items.map((item) => {
    const itemSubtotal = item.qty * Number(item.selling_price);
    const discountAmt = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
    const taxable = itemSubtotal - discountAmt;
    return `<tr><td><b>${safe(item.name)}</b><small>Size: ${safe(item.size || "Free Size")} | Color: ${safe(item.color || "N/A")} | GST ${item.gst_rate || 12}%</small></td><td class="right">${item.qty} x ${money(item.selling_price)}</td><td class="right">${money(taxable * 1.12)}</td></tr>`;
  }).join("");
  receiptWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safe(bill.invoiceNo)}</title><style>@page{size:80mm auto;margin:4mm}*{box-sizing:border-box}body{margin:0;font:11px Arial;color:#111}.receipt{width:72mm;margin:auto}.center{text-align:center}h1{font-size:16px;margin:0 0 7px}p{line-height:1.45;margin:3px 0}.rule{border:0;border-top:1px dashed #111;margin:10px 0}table{width:100%;border-collapse:collapse}th{text-align:left;padding-bottom:6px;border-bottom:1px dashed #111}td{padding:7px 0;vertical-align:top;border-bottom:1px dotted #999}small{display:block;color:#555;margin-top:3px;line-height:1.35}.right{text-align:right;white-space:nowrap;padding-left:5px}.totals div{display:flex;justify-content:space-between;padding:4px 0}.total{font-size:14px;font-weight:700;border-top:1px dashed #111;border-bottom:1px dashed #111;margin-top:5px;padding:9px 0!important}.thanks{text-align:center;font-weight:700;margin-top:14px}</style></head><body><main class="receipt"><header class="center"><h1>${safe(bill.store.storeName)}</h1><p>${safe(bill.store.storeAddress)}</p><p>GSTIN: ${safe(bill.store.gstin || "N/A")} | Ph: ${safe(bill.store.contactNumber || "N/A")}</p></header><hr class="rule"><p><b>Invoice:</b> ${safe(bill.invoiceNo)}<br><b>Date:</b> ${new Date(bill.date).toLocaleString("en-IN")}<br><b>Customer:</b> ${safe(bill.customer)}${bill.mobile ? ` (${safe(bill.mobile)})` : ""}<br><b>Payment:</b> ${safe(bill.payment)}</p><hr class="rule"><table><thead><tr><th>Item Description</th><th class="right">Qty/Price</th><th class="right">Total</th></tr></thead><tbody>${rows}</tbody></table><section class="totals"><div><span>Subtotal (Taxable)</span><span>${money(bill.subtotal)}</span></div>${bill.discountAmount > 0 ? `<div><span>Discount Applied</span><span>-${money(bill.discountAmount)}</span></div>` : ""}<div><span>CGST (6%)</span><span>${money(bill.cgst)}</span></div><div><span>SGST (6%)</span><span>${money(bill.sgst)}</span></div><div><span>Total Tax</span><span>${money(bill.gst)}</span></div><div class="total"><span>GRAND TOTAL (${safe(bill.payment)})</span><span>${money(bill.total)}</span></div></section><p class="thanks">*** THANK YOU! VISIT AGAIN ***</p></main></body></html>`);
  receiptWindow.document.close();
  receiptWindow.focus();
  setTimeout(() => receiptWindow.print(), 300);
};

const closeReceipt = () => {
  setShowInvoice(false);
  setShowCheckout(false);
  setInvoiceData(null);
  setCart([]);
  setPaymentMode("Cash");
  setCashReceived("");
};

const saveBill = async () => {
  if (cart.length === 0) {
    alert("Cart Empty");
    return;
  }
  if (
  paymentMode === "Cash" &&
  Number(cashReceived || 0) <
    grandTotal
) {
  alert("Insufficient Amount");
  return;
}

  try {
    const response = await axios.post("http://localhost:5000/api/sales/save", {
      total: grandTotal,
      cart: cart.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size || "",
        color: item.color || "",
        quantity: item.qty,
        selling_price: item.selling_price,
        gst_rate: item.gst_rate || 0
      })),
      customerName: "Walk-in Customer",
      customerMobile: "",
      paymentMode
    });

    const invoiceNo = response.data.invoiceId || response.data.transactionId;
    let store = DEFAULT_STORE;
    try {
      store = { ...DEFAULT_STORE, ...JSON.parse(localStorage.getItem(STORE_SETTINGS_KEY) || "{}") };
    } catch {
      // Use the default store profile when saved settings are invalid.
    }
      setInvoiceData({
  invoiceNo,
      staff: user?.name || user?.username || user?.email || "Staff Member",
  payment: paymentMode,
  date: new Date(),
  items: cart,
  subtotal,
  cgst: cgstAmount,
  sgst: sgstAmount,
  gst: totalTaxAmount,
  discountAmount,
  total: grandTotal,
  store
});

setShowCheckout(false);
setShowInvoice(true);

    /* const receiptWindow =
      window.open("", "_blank");
      
      

    receiptWindow.document.write(`
      <html>
      <body style="font-family:Arial;padding:20px">
      
      <h2 style="text-align:center">
        RS9 EXPORTS
      </h2>

      <hr>

      <p>
        <strong>Invoice:</strong>
        ${invoiceNo}
      </p>

      <p>
<strong>Customer:</strong>
${customer?.customer_name || "Walk-in Customer"}
</p>

<p>
<strong>Mobile:</strong>
${customer?.phone || ""}
</p>
      </p>

      <p>
        <strong>Payment:</strong>
        ${paymentMode}
      </p>
      <p>
  <strong>Date:</strong>
  ${new Date().toLocaleString()}
</p>
      

      <hr>

      ${cart
        .map(
          (item) => `
          <div>
            ${item.name}
            <br/>
            Qty: ${item.qty}
            × ₹${item.selling_price}
            =
            ₹${
              item.qty *
              item.selling_price
            }
          </div>
          <br/>
        `
        )
        .join("")}

      <hr>
      <p>
Discount:
₹${discountAmount.toFixed(2)}
</p>
     

      <h3>
        Grand Total:
        ₹${grandTotal.toFixed(2)}
      </h3>

      <hr>

      <p style="text-align:center">
        THANK YOU
      </p>

      </body>
      </html>
    `);

    receiptWindow.document.close();

    setTimeout(() => {
      receiptWindow.print();
    }, 500); */

  setCart([]);
setPaymentMode("Cash");
setCashReceived("");
setShowCheckout(false);
  

    loadProducts();
  } catch (error) {
    console.log(error);

    alert("Failed To Save Bill");
  }
};

  return (
<div className="pos-container">

<div className="header">

<div>
<h1 className="title">
RS9 Sales Terminal
</h1>

<p className="subtitle">
📍 RS9 EXPORTS
</p>
</div>

<div className="datetime">

<div className="chip">
<FaCalendarAlt />

<span>
{dateTime.toLocaleDateString()}
</span>

</div>

<div className="chip">
<FaClock />

<span>
{dateTime.toLocaleTimeString()}
</span>

</div>

<button className="camera-btn" type="button" onClick={() => { setStaffAccessError(""); setShowStaffAccess(true); }}>
Change Staff
</button>

</div>

</div>

<div className="search-section">

<div className="search-box">

<FaSearch />

<input
type="text"
placeholder="Scan Barcode or Search Product"
value={search}
onChange={(e)=>
setSearch(e.target.value)
}
/>

</div>

<button className="camera-btn" type="button" onClick={() => { setScannerMessage(""); setShowScanner(true); }}>

<FaCamera />

Webcam Scanner

</button>

</div>

<div className="catalog-header">

<h2>

Quick Select Catalog

</h2>

<input
className="filter-box"
placeholder="Filter grid..."
value={gridFilter}
onChange={(event) => setGridFilter(event.target.value)}
/>

</div>

<div className="category-bar">

<button
className={
category==="ALL"
?"active-category"
:"category-btn"
}
onClick={()=>
setCategory("ALL")
}
>
ALL
</button>

<button
className={
category==="MENS"
?"active-category"
:"category-btn"
}
onClick={()=>
setCategory("MENS")
}
>
MENS
</button>

<button
className={
category==="WOMENS"
?"active-category"
:"category-btn"
}
onClick={()=>
setCategory("WOMENS")
}
>
WOMENS
</button>

<button
className={
category==="KIDS"
?"active-category"
:"category-btn"
}
onClick={()=>
setCategory("KIDS")
}
>
KIDS
</button>

<button
className={
category==="ACCESSORIES"
?"active-category"
:"category-btn"
}
onClick={()=>
setCategory("ACCESSORIES")
}
>
ACCESSORIES
</button>

</div>

<div className="pos-layout">
        <div className="products-grid">
          {products
.filter(
  (p) =>
    (p.name || "")
  .toLowerCase()
  .includes(
    search.toLowerCase()
  )||
    p.barcode
      ?.toString()
      .includes(search)
)            .filter((p) =>
              category === "ALL"
                ? true
                : p.category ===
                  category
            )
            .filter((p) => {
              const query = gridFilter.trim().toLowerCase();
              if (!query) return true;
              return [p.name, p.barcode, p.category, p.size, p.color]
                .some((value) => String(value || "").toLowerCase().includes(query));
            })
            .map((product) => (
             <div
  key={product.id}
  className="product-card"
>
  <div className="product-top">

    <span className="size-chip">
      {product.size || "FREE"}
    </span>

    {product.stock <= 3 && (
      <span className="stock-chip">
        Low Stock
      </span>
    )}

  </div>

  <h3>
    {product.name}
  </h3>

  <p className="barcode">
    Barcode :
    {product.barcode}
  </p>

  <p className="category">
    {product.category}
  </p>

  <div className="price-row">

    <h2>
      ₹{product.selling_price}
    </h2>

    <span>
      Stock :
      {product.stock}
    </span>

  </div>

  <button
    className="cart-btn"
    disabled={product.stock<=0}
    onClick={()=>
      addToCart(product)
    }
  >
    <FaShoppingBag />

    {product.stock<=0
      ? "Out of Stock"
      : "Add To Cart"}
  </button>

</div>
            ))}
  </div>

<div className="cart-panel">

<div className="cart-header">
<h2>
🧾 Cart Invoice
</h2>

<div className="cart-count">

{
cart.reduce(
(sum,item)=>
sum+item.qty,
0
)
}

Items

</div>

</div>

{cart.length===0?

(

<div className="empty-cart">

<FaShoppingBag
size={45}
/>

<p>
Cart is Empty
</p>

</div>

)

:

(

cart.map(item=>(

<div
key={item.id}
className="cart-card"
>

<div className="cart-info">

<div>

<h4>

{item.name}

</h4>

<p>

Size :
{item.size || "FREE"}

</p>

</div>

<div className="cart-price">

<h4>
₹
{(
  (item.qty * item.selling_price) -
  ((item.qty * item.selling_price) * (item.discountPercent || 0) / 100)
).toFixed(2)}
</h4>

<small>
+₹
{(
  ((item.qty * item.selling_price) -
  ((item.qty * item.selling_price) * (item.discountPercent || 0) / 100)) * 0.12
).toFixed(2)}
Tax
</small>

</div>

</div>
<div className="cart-actions">

<button
onClick={() => decreaseQty(item.id)}
>
-
</button>

<span>{item.qty}</span>

<button
onClick={() => increaseQty(item.id)}
>
+
</button>

<input
type="number"
placeholder="Disc%"
value={item.discountPercent || 0}
onChange={(e)=>
setCart(
cart.map(p=>
p.id===item.id
?{
...p,
discountPercent:Math.min(100, Math.max(0, Number(e.target.value)))
}
:p
)
)
}
className="discount-input"
min="0"
max="100"
/>

<button
className="delete-btn"
onClick={()=>
removeItem(item.id)
}
>
🗑
</button>

</div>

</div>

))

)}
          <select
  value={paymentMode}
  onChange={(e) =>
    setPaymentMode(e.target.value)
  }
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "15px"
  }}
>
  <option value="Cash">
    Cash
  </option>

  <option value="UPI">
    UPI
  </option>

  <option value="Card">
    Card
  </option>

  <option value="Credit">
    Credit
  </option>
</select>
{paymentMode === "Cash" && (
  <input
    type="number"
    placeholder="Cash Received"
    value={cashReceived}
    onChange={(e) =>
      setCashReceived(e.target.value)
    }
    style={{
      width: "100%",
      padding: "10px",
      marginTop: "10px"
    }}
  />
)}

<h3>
  Balance Return:
  ₹
  {Math.max(
    0,
    Number(cashReceived || 0) -
      grandTotal
  ).toFixed(2)}
</h3>


<div className="summary">

  <div className="summary-row">
    <span>Subtotal (Taxable)</span>
    <span>₹{subtotal.toFixed(2)}</span>
  </div>

  {discountAmount > 0 && (
    <div className="summary-row">
      <span>Discount Applied</span>
      <span style={{ color: "#22c55e" }}>-₹{discountAmount.toFixed(2)}</span>
    </div>
  )}

  <div className="summary-row">
    <span>CGST (6%)</span>
    <span>₹{cgstAmount.toFixed(2)}</span>
  </div>

  <div className="summary-row">
    <span>SGST (6%)</span>
    <span>₹{sgstAmount.toFixed(2)}</span>
  </div>

  <div className="summary-row">
    <span>Total CGST + SGST Tax</span>
    <span>₹{totalTaxAmount.toFixed(2)}</span>
  </div>

  <hr />

  <div className="grand-total">
    <span>Grand Total</span>

    <h2>
      ₹{grandTotal.toFixed(2)}
    </h2>
  </div>

</div>


          <button
            onClick={clearCart}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom:
                "10px"
            }}
          >
            Clear Cart
          </button>

       <button
  disabled={cart.length === 0}
  onClick={() => setShowCheckout(true)}
  style={{
    width: "100%",
    padding: "12px",
    color: "white",
    background:
      cart.length === 0
        ? "gray"
        : "#7c3aed",
    cursor:
      cart.length === 0
        ? "not-allowed"
        : "pointer",
    border: "none",
    borderRadius: "10px"
  }}
>
  Proceed To Pay
</button>
        </div>
      </div>
     {showScanner && (
  <div className="scanner-backdrop" role="dialog" aria-modal="true" aria-label="Barcode scanner">
    <section className="scanner-modal">
      <button className="scanner-close" type="button" aria-label="Close scanner" onClick={closeScanner}><FaTimes /></button>
      <h2><FaCamera /> Scan Product Barcode</h2>
      <video ref={scannerVideoRef} className="scanner-video" muted playsInline />
      <div className="scanner-target" aria-hidden="true" />
      <p>{scannerMessage || "Starting camera..."}</p>
      <button className="scanner-cancel" type="button" onClick={closeScanner}>Cancel</button>
    </section>
  </div>
)}
      {showStaffAccess && (
  <div className="scanner-backdrop" role="dialog" aria-modal="true" aria-label="Staff access verification">
    <form className="scanner-modal" onSubmit={changeStaff}>
      <button className="scanner-close" type="button" aria-label="Close staff verification" onClick={() => setShowStaffAccess(false)}><FaTimes /></button>
      <h2>Change Staff</h2>
      <p>Enter the new staff member's email and password to continue.</p>
      <input type="email" placeholder="Staff email" value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} required style={{ width: "100%", padding: "12px", marginBottom: "10px" }} />
      <input type="password" placeholder="Staff password" value={staffPassword} onChange={(event) => setStaffPassword(event.target.value)} required style={{ width: "100%", padding: "12px", marginBottom: "10px" }} />
      {staffAccessError && <p style={{ color: "#fca5a5" }}>{staffAccessError}</p>}
      <button className="scanner-cancel" type="submit" disabled={isVerifyingStaff}>{isVerifyingStaff ? "Verifying..." : "Verify & Change Staff"}</button>
    </form>
  </div>
)}
      {showCheckout && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}
  >
    <div
      style={{
        width: "520px",
        background: "#161b2d",
        padding: "25px",
        borderRadius: "15px",
        border: "1px solid #2d3559"
      }}
    >
      <h2
        style={{
          marginBottom: "20px"
        }}
      >
        Complete Checkout
      </h2>

      <label>Payment Mode</label>

      <select
        value={paymentMode}
        onChange={(e) =>
          setPaymentMode(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px"
        }}
      >
        <option>Cash</option>
        <option>Card</option>
        <option>UPI</option>
        <option>Credit</option>
      </select>

      {paymentMode === "Cash" && (
        <>
          <label>
            Cash Received
          </label>

          <input
            type="number"
            value={cashReceived}
            onChange={(e) =>
              setCashReceived(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px"
            }}
          />

          <h3>
            Balance Return
          </h3>

          <h2
            style={{
              color: "#10b981"
            }}
          >
            ₹
            {Math.max(
              0,
              Number(
                cashReceived || 0
              ) - grandTotal
            ).toFixed(2)}
          </h2>
        </>
      )}

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginTop: "20px"
        }}
      >
        <strong>
          Amount Payable
        </strong>

        <strong
          style={{
            color: "#8b5cf6",
            fontSize: "24px"
          }}
        >
          ₹
          {grandTotal.toFixed(2)}
        </strong>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px"
        }}
      >
        <button
          onClick={() => {
            setShowCheckout(false);
            setCashReceived("");
          }}
          style={{
            flex: 1,
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "10px"
          }}
        >
          Cancel
        </button>

        <button
          onClick={saveBill}
          style={{
            flex: 1,
            padding: "12px",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "10px"
          }}
        >
          Complete Checkout
        </button>
      </div>
    </div>
  </div>
)}
{showInvoice && invoiceData && (
  <div className="receipt-backdrop" role="dialog" aria-modal="true" aria-label="GST receipt preview" onClick={closeReceipt}>
    <section className="receipt-modal" onClick={(event) => event.stopPropagation()}>
      <button className="receipt-close" aria-label="Close receipt" onClick={closeReceipt}><FaTimes /></button>
      <div className="receipt-paper">
        <header>
          <h2>{invoiceData.store.storeName}</h2>
          <p>{invoiceData.store.storeAddress}</p>
          <p>GSTIN: {invoiceData.store.gstin || "N/A"} | Ph: {invoiceData.store.contactNumber || "N/A"}</p>
        </header>
        <div className="receipt-rule" />
        <p><b>Invoice:</b> {invoiceData.invoiceNo}<br /><b>Date:</b> {new Date(invoiceData.date).toLocaleString("en-IN")}<br /><b>Staff:</b> {invoiceData.staff}<br /><b>Payment:</b> {invoiceData.payment}</p>
        <div className="receipt-rule" />
        <table><thead><tr><th>Item Description</th><th>Qty/Price</th><th>Total (&#8377;)</th></tr></thead><tbody>{invoiceData.items.map((item) => {
          const itemSubtotal = item.qty * Number(item.selling_price);
          const discountAmt = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
          const taxable = itemSubtotal - discountAmt;
          return <tr key={item.id}><td><b>{item.name}</b><small>Size: {item.size || "Free Size"} | Color: {item.color || "N/A"} | GST {item.gst_rate || 12}%</small></td><td>{item.qty} x {Number(item.selling_price).toFixed(0)}</td><td>{(taxable * 1.12).toFixed(2)}</td></tr>;
        })}</tbody></table>
        <div className="receipt-rule" />
        <div className="receipt-total-row"><span>Subtotal (Taxable)</span><span>&#8377;{invoiceData.subtotal.toFixed(2)}</span></div>
        {invoiceData.discountAmount > 0 && <div className="receipt-total-row"><span>Discount Applied</span><span style={{ color: "#22c55e" }}>-&#8377;{invoiceData.discountAmount.toFixed(2)}</span></div>}
        <div className="receipt-total-row"><span>CGST (6%)</span><span>&#8377;{invoiceData.cgst.toFixed(2)}</span></div>
        <div className="receipt-total-row"><span>SGST (6%)</span><span>&#8377;{invoiceData.sgst.toFixed(2)}</span></div>
        <div className="receipt-total-row"><span>Total CGST + SGST Tax</span><span>&#8377;{invoiceData.gst.toFixed(2)}</span></div>
        <div className="receipt-grand-total"><span>GRAND TOTAL ({invoiceData.payment})</span><span>&#8377;{invoiceData.total.toFixed(2)}</span></div>
        <div className="receipt-rule" /><p className="receipt-thanks">*** THANK YOU! VISIT AGAIN ***</p>
      </div>
      <div className="receipt-actions"><button onClick={closeReceipt}>Done<br />(Close)</button><button className="receipt-print" onClick={() => printReceipt()}><FaPrint /> Print Receipt<br />(80mm)</button></div>
    </section>
  </div>
)}
</div>
);

}

export default POSTerminal;
