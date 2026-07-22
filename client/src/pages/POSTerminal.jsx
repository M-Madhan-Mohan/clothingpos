import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaShoppingBag,
  FaCamera,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";

import "../styles/posterminal.css";
const POSTerminal = () => {

const [products, setProducts] = useState([]);
const [customers, setCustomers] = useState([]);

const [cart, setCart] = useState([]);

const [search, setSearch] = useState("");

const [category, setCategory] =
  useState("ALL");

const [selectedCustomer, setSelectedCustomer] =
  useState("");

const [paymentMode, setPaymentMode] =
  useState("Cash");

const [cashReceived, setCashReceived] =
  useState("");

const [discount, setDiscount] =
  useState(0);

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
    loadCustomers();
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

  const loadCustomers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/customers"
      );

      setCustomers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {
  if (existing.qty >= product.stock) {
    alert("No More Stock");
    return;
  }

  setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
  ...product,
  qty: 1,
  discount: 0
}
      ]);
    }
  };

  const increaseQty = (id) => {
  setCart(
    cart.map((item) => {
      if (item.id === id) {
        if (item.qty >= item.stock) {
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
    setCart(
      cart
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

const subtotal = cart.reduce(
(sum,item)=>

sum+

(item.qty*Number(item.selling_price))

-

Number(item.discount||0),

0
);

const gstAmount=subtotal*0.12;

const discountAmount=cart.reduce(

(sum,item)=>

sum+

Number(item.discount||0),

0

);

const grandTotal=

subtotal+

gstAmount;
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
    const customer = customers.find(
      (c) => c.id == selectedCustomer
    );

    const response = await axios.post(
      "http://localhost:5000/api/sales/save",
      {
        total: grandTotal,

        cart: cart.map((item) => ({
          id: item.id,
          name: item.name,
          size: item.size || "",
          color: item.color || "",
          quantity: item.qty,
          selling_price:
            item.selling_price,
          gst_rate:
            item.gst_rate || 0
        })),

        customerName:
          customer?.customer_name ||
          "Walk-in Customer",

        customerMobile:
          customer?.phone || "",
        
        

        paymentMode
      }
    );

    const invoiceNo =
      response.data.transactionId;
      setInvoiceData({
  invoiceNo,
  customer:
    customer?.customer_name ||
    "Walk-in Customer",
  mobile:
    customer?.phone || "",
  payment: paymentMode,
  date: new Date(),
  items: cart,
  subtotal,
  gst: gstAmount,
  discount,
  total: grandTotal
});

setShowInvoice(true);

    const receiptWindow =
      window.open("", "_blank");
      
      

    receiptWindow.document.write(`
      <html>
      <body style="font-family:Arial;padding:20px">
      
      <h2 style="text-align:center">
        CLOTHING POS
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
    }, 500);

  setCart([]);
setSelectedCustomer("");
setPaymentMode("Cash");
setCashReceived("");
setDiscount(0);
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
📍 RS9 CLOTHING POS STUDIO
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

<button className="camera-btn">

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

<select
className="customer-select"
value={selectedCustomer}
onChange={(e)=>
setSelectedCustomer(
e.target.value
)
}
>

<option value="">
Walk-in Customer
</option>

{customers.map(customer=>(

<option
key={customer.id}
value={customer.id}
>

{customer.customer_name}

</option>

))}

</select>

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
(item.discount || 0)
).toFixed(2)}
</h4>

<small>
+₹
{(
(item.qty * item.selling_price * 0.12)
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
placeholder="Disc"
value={item.discount || 0}
onChange={(e)=>
setCart(
cart.map(p=>
p.id===item.id
?{
...p,
discount:Number(e.target.value)
}
:p
)
)
}
className="discount-input"
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
    <span>Subtotal</span>
    <span>₹{subtotal.toFixed(2)}</span>
  </div>

  <div className="summary-row">
    <span>GST</span>
    <span>₹{gstAmount.toFixed(2)}</span>
  </div>

  <div className="summary-row">
    <span>Discount</span>
    <span>-₹{discountAmount.toFixed(2)}</span>
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

      <label>Customer</label>

      <select
        value={selectedCustomer}
        onChange={(e) =>
          setSelectedCustomer(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px"
        }}
      >
        <option value="">
          Walk-in Customer
        </option>

        {customers.map((customer) => (
          <option
            key={customer.id}
            value={customer.id}
          >
            {customer.customer_name}
          </option>
        ))}
      </select>

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
          onClick={() =>
            setShowCheckout(false)
          }
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
</div>
);

}

export default POSTerminal;