import { useState, useEffect } from "react";
import axios from "axios";

function Billing() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerAddressInput, setCustomerAddressInput] = useState("");

  const selectedCustomerData = customers.find(
    (customer) => String(customer.id) === String(selectedCustomer)
  );

  const customerName =
    selectedCustomerData?.customer_name || customerNameInput.trim() || "Walk-in Customer";
  const customerMobile = selectedCustomerData?.phone || customerPhoneInput.trim() || "";

  const searchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/barcode/${barcode}`);

      if (res.data.stock <= 0) {
        alert("Product Out Of Stock");
        setProduct(null);
        return;
      }

      setProduct(res.data);
    } catch (error) {
      console.log("ERROR:", error);
      setProduct(null);
      alert("Item Not Found");
    }
  };

  const handleBarcodeScan = async (barcodeValue) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/barcode/${barcodeValue}`);
      const scannedProduct = res.data;

      if (scannedProduct.stock <= 0) {
        alert("Product Out Of Stock");
        return;
      }

      const existingItem = cart.find((item) => item.id === scannedProduct.id);

      if (existingItem) {
        if (existingItem.quantity >= scannedProduct.stock) {
          alert(`Only ${scannedProduct.stock} items available`);
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
      } else {
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
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const addToCart = () => {
    if (!product) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= Number(product.stock || 0)) {
          alert(`Only ${product.stock} items available in stock`);
          return prevCart;
        }

        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      if (Number(product.stock || 0) <= 0) {
        alert("Out of Stock");
        return prevCart;
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const decreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity > 1 ? item.quantity - 1 : 1,
            }
          : item
      )
    );
  };

  const increaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          if (item.quantity >= Number(item.stock || 0)) {
            alert(`Only ${item.stock} items available in stock`);
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

  const saveCustomerIfNeeded = async () => {
    const trimmedName = customerNameInput.trim();
    const trimmedPhone = customerPhoneInput.trim();
    const trimmedAddress = customerAddressInput.trim();

    if (!trimmedName && !trimmedPhone) {
      return null;
    }

    const existingCustomer = customers.find((customer) => {
      const normalizedPhone = String(customer.phone || "").replace(/\D/g, "");
      const enteredPhone = trimmedPhone.replace(/\D/g, "");

      if (trimmedPhone && normalizedPhone && enteredPhone && normalizedPhone === enteredPhone) {
        return true;
      }

      return (
        trimmedName &&
        String(customer.customer_name || "").toLowerCase() === trimmedName.toLowerCase()
      );
    });

    if (existingCustomer) {
      setSelectedCustomer(String(existingCustomer.id));
      return existingCustomer;
    }

    const res = await axios.post("http://localhost:5000/api/customers/add", {
      customer_name: trimmedName || "Walk-in Customer",
      phone: trimmedPhone,
      address: trimmedAddress,
    });

    const newCustomer = {
      id: res.data.customerId,
      customer_name: trimmedName || "Walk-in Customer",
      phone: trimmedPhone,
      address: trimmedAddress,
    };

    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
    setSelectedCustomer(String(newCustomer.id));
    return newCustomer;
  };

  const printReceipt = () => {
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return;

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
            .map((item) => `<p>${item.name} x ${item.quantity} - ₹${item.selling_price}</p>`)
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
      if (cart.length === 0) {
        alert("Cart Empty");
        return;
      }

      const savedCustomer = await saveCustomerIfNeeded();

      const finalCustomerName =
        savedCustomer?.customer_name ||
        selectedCustomerData?.customer_name ||
        customerNameInput.trim() ||
        "Walk-in Customer";
      const finalCustomerMobile =
        savedCustomer?.phone || selectedCustomerData?.phone || customerPhoneInput.trim() || "";

      await axios.post("http://localhost:5000/api/sales/save", {
        total,
        cart,
        customerName: finalCustomerName,
        customerMobile: finalCustomerMobile,
        paymentMode: "Cash",
      });

      alert("Bill Saved Successfully");
      setCart([]);
      setPaidAmount("");
      setCustomerNameInput("");
      setCustomerPhoneInput("");
      setCustomerAddressInput("");
      setSelectedCustomer("");
    } catch (error) {
      console.log(error);
      alert("Failed To Save Bill");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.selling_price || 0) * Number(item.quantity || 0),
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

  useEffect(() => {
    if (!selectedCustomer) return;

    const currentCustomer = customers.find(
      (customer) => String(customer.id) === String(selectedCustomer)
    );

    if (currentCustomer) {
      setCustomerNameInput(currentCustomer.customer_name || "");
      setCustomerPhoneInput(currentCustomer.phone || "");
      setCustomerAddressInput(currentCustomer.address || "");
    }
  }, [selectedCustomer, customers]);

  return (
    <div>
      <h1>Billing Screen</h1>
      <h2>Cart</h2>

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            borderBottom: "1px solid gray",
            padding: "8px",
          }}
        >
          <strong>{item.name}</strong>

          <button onClick={() => decreaseQty(item.id)} style={{ marginLeft: "10px" }}>
            -
          </button>

          {item.quantity}

          <button onClick={() => increaseQty(item.id)}>+</button>

          {" | ₹"}
          {item.selling_price}

          {" | Total ₹"}
          {item.quantity * Number(item.selling_price)}

          <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: "10px" }}>
            Remove
          </button>
        </div>
      ))}

      <h2>Total: ₹{total}</h2>
      <input
        type="number"
        placeholder="Paid Amount"
        value={paidAmount}
        onChange={(e) => setPaidAmount(e.target.value)}
      />

      <h3>Due Amount: ₹{total - (Number(paidAmount) || 0)}</h3>

      <button onClick={saveBill} disabled={cart.length === 0}>
        Save Bill
      </button>

      <button onClick={printReceipt}>Print Receipt</button>

      <div style={{ marginTop: "12px" }}>
        <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
          <option value="">Select Existing Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.customer_name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "12px" }}>
        <input
          type="text"
          placeholder="Customer Name"
          value={customerNameInput}
          onChange={(e) => setCustomerNameInput(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={customerPhoneInput}
          onChange={(e) => setCustomerPhoneInput(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <input
          type="text"
          placeholder="Address (optional)"
          value={customerAddressInput}
          onChange={(e) => setCustomerAddressInput(e.target.value)}
        />
      </div>

      <br />
      <br />
      <input
        type="text"
        placeholder="Scan Barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleBarcodeScan(barcode);
          }
        }}
      />

      <button onClick={searchProduct}>Search</button>

      {product && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <h3>{product.name}</h3>
          <p>Barcode: {product.barcode}</p>
          <p>Price: ₹{product.selling_price}</p>
          <p>
            Stock Left: {product.stock - (cart.find((item) => item.id === product.id)?.quantity || 0)}
          </p>
          <button onClick={addToCart}>Add To Cart</button>
        </div>
      )}
    </div>
  );
}

export default Billing;