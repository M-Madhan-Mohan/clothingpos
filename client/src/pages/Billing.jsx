import { useState, useEffect } from "react";
import axios from "axios";

function Billing() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
const [selectedCustomer, setSelectedCustomer] = useState("");
const [paidAmount, setPaidAmount] =
  useState("");

 const searchProduct = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/products/barcode/${barcode}`
    );

    if (res.data.stock <= 0) {
      alert("Product Out Of Stock");
      setProduct(null);
      return;
    }

    setProduct(res.data);
  }catch (error) {
  console.log("ERROR:", error);

  setProduct(null);

  alert("Item Not Found");
}
};
  const handleBarcodeScan = async (
  barcodeValue
) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/products/barcode/${barcodeValue}`
    );

    const scannedProduct = res.data;
    if (scannedProduct.stock <= 0) {
  alert("Product Out Of Stock");
  return;
}

    const existingItem = cart.find(
      (item) => item.id === scannedProduct.id
    );

   if (existingItem) {
  if (existingItem.quantity >= scannedProduct.stock) {
    alert(
      `Only ${scannedProduct.stock} items available`
    );
    return;
  }

  setCart(
    cart.map((item) =>
      item.id === scannedProduct.id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    )
  );
}else {
      setCart([
        ...cart,
        {
          ...scannedProduct,
          quantity: 1,
        },
      ]);
    }

    setProduct(scannedProduct);
    setBarcode("");
  } catch (error) {
  setProduct(null);

  alert("Item Not Found");

  setBarcode("");
}
};
 const removeFromCart = (id) => {
  setCart(
    cart.filter((item) => item.id !== id)
  );
};

const addToCart = () => {
  if (!product) return;

  const existingItem = cart.find(
    (item) => item.id === product.id
  );

  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      alert(
        `Only ${product.stock} items available in stock`
      );
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  } else {
    if (product.stock <= 0) {
      alert("Out of Stock");
      return;
    }

    setCart([
      ...cart,
      {
        ...product,
        quantity: 1,
      },
    ]);
  }
};const decreaseQty = (id) => {
  setCart(
    cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity:
              item.quantity > 1
                ? item.quantity - 1
                : 1
          }
        : item
    )
  );
};
const increaseQty = (id) => {
  setCart(
    cart.map((item) => {
      if (item.id === id) {
        if (item.quantity >= item.stock) {
          alert(
            `Only ${item.stock} items available in stock`
          );

          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    })
  );
};
const customerName =
  customers.find(
    (c) => c.id == selectedCustomer
  )?.customer_name || "Walk-in Customer";


const printReceipt = () => {
  const receiptWindow = window.open("", "_blank");

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
      </head>
      <body>
        <h1>Clothing POS</h1>

        <p><strong>Customer:</strong> ${customerName}</p>

        <hr>

        ${cart
          .map(
            (item) =>
              `<p>${item.name} x ${item.quantity} - ₹${item.selling_price}</p>`
          )
          .join("")}

        <hr>

        <h2>Total: ₹${total}</h2>
      </body>
    </html>
  `);

  receiptWindow.document.close();

  setTimeout(() => {
    receiptWindow.print();
  }, 500);
};
const saveBill = async () => {
  try {
    const selectedCustomerData =
      customers.find(
        (c) => c.id == selectedCustomer
      );

    const res = await axios.post(
      "http://localhost:5000/api/sales/save",
      {
        total,
        cart,

        customerName:
          selectedCustomerData
            ?.customer_name ||
          "Walk-in Customer",

        customerMobile:
          selectedCustomerData?.phone ||
          "",

        paymentMode: "Cash"
      }
    );

    alert(
      "Bill Saved Successfully"
    );

    setCart([]);
    setPaidAmount("");
  } catch (error) {
    console.log(error);
    alert("Failed To Save Bill");
  }
};
const total = cart.reduce(
  (sum, item) =>
    sum +
    Number(item.selling_price) *
      item.quantity,
  0
);
useEffect(() => {
  axios
    .get("http://localhost:5000/api/customers")
    .then((res) => {
      setCustomers(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
}, []);

  return (
    <div>
      <h1>Billing Screen</h1>
      <h2>Cart</h2>

   {cart.map((item) => (
  <div
    key={item.id}
    style={{
      borderBottom: "1px solid gray",
      padding: "8px"
    }}
  >
    <strong>{item.name}</strong>

    <button
      onClick={() => decreaseQty(item.id)}
      style={{ marginLeft: "10px" }}
    >
      -
    </button>

    {item.quantity}

    <button
      onClick={() => increaseQty(item.id)}
    >
      +
    </button>

    {" | ₹"}
    {item.selling_price}

    {" | Total ₹"}
    {item.quantity *
      Number(item.selling_price)}

    <button
      onClick={() =>
        removeFromCart(item.id)
      }
      style={{ marginLeft: "10px" }}
    >
      Remove
    </button>
  </div>
))}
<h2>Total: ₹{total}</h2>
<input
  type="number"
  placeholder="Paid Amount"
  value={paidAmount}
  onChange={(e) =>
    setPaidAmount(e.target.value)
  }
/>

<h3>
  Due Amount: ₹
  {total - (Number(paidAmount) || 0)}
</h3>

<button
  onClick={saveBill}
  disabled={cart.length === 0}
>
  Save Bill
</button>

<button onClick={printReceipt}>
  Print Receipt
</button>
<select
  value={selectedCustomer}
  onChange={(e) =>
    setSelectedCustomer(e.target.value)
  }
>
  <option value="">
    Select Customer
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

<br />
<br />
      <input
  type="text"
  placeholder="Scan Barcode"
  value={barcode}
  onChange={(e) =>
    setBarcode(e.target.value)
  }
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleBarcodeScan(barcode);
    }
  }}
/>

      <button onClick={searchProduct}>
        Search
      </button>

{product && (
  <div
    style={{
      border: "1px solid #ccc",
      padding: "10px",
      marginTop: "10px"
    }}
  >
    <h3>{product.name}</h3>

    <p>Barcode: {product.barcode}</p>

    <p>
      Price: ₹{product.selling_price}
    </p>

    <p>
      Stock Left:{" "}
      {product.stock -
        (cart.find(
          (item) => item.id === product.id
        )?.quantity || 0)}
    </p>

    <button onClick={addToCart}>
      Add To Cart
    </button>
  </div>
)}
    </div>
  );
}


export default Billing;