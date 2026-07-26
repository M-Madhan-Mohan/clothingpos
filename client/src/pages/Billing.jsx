import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/billing.css";

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
            discountPercent: 0,
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
          discountPercent: 0,
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

    const itemsHTML = cart
      .map((item) => {
        const itemSubtotal = item.quantity * Number(item.selling_price);
        const discountAmt = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
        const taxable = itemSubtotal - discountAmt;
        return `<p><strong>${item.name}</strong><br>Size: ${item.size || "Free Size"} | Color: ${item.color || "N/A"}<br>Qty: ${item.quantity} x ₹${item.selling_price} = ₹${taxable.toFixed(2)} (${item.discountPercent || 0}% off)</p>`;
      })
      .join("");

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; }
            .summary { margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; }
            .summary-row { display: flex; justify-content: space-between; margin: 8px 0; }
          </style>
        </head>
        <body>
          <h1>Clothing POS Receipt</h1>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Mobile:</strong> ${customerMobile}</p>
          <hr>
          ${itemsHTML}
          <div class="summary">
            <div class="summary-row"><span>Subtotal (Taxable):</span><span>₹${subtotal.toFixed(2)}</span></div>
            ${discountAmount > 0 ? `<div class="summary-row"><span>Discount Applied:</span><span>-₹${discountAmount.toFixed(2)}</span></div>` : ""}
            <div class="summary-row"><span>CGST (6%):</span><span>₹${cgstAmount.toFixed(2)}</span></div>
            <div class="summary-row"><span>SGST (6%):</span><span>₹${sgstAmount.toFixed(2)}</span></div>
            <div class="summary-row"><span>Total Tax:</span><span>₹${totalTaxAmount.toFixed(2)}</span></div>
            <div class="summary-row" style="font-weight: bold; font-size: 16px;"><span>GRAND TOTAL:</span><span>₹${total.toFixed(2)}</span></div>
          </div>
          <p style="text-align: center; margin-top: 30px; font-weight: bold;">THANK YOU FOR YOUR PURCHASE!</p>
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

  const subtotal = cart.reduce((sum, item) => {
    const itemSubtotal = Number(item.selling_price || 0) * Number(item.quantity || 0);
    const discountAmount = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
    return sum + (itemSubtotal - discountAmount);
  }, 0);

  const cgstAmount = subtotal * 0.06;
  const sgstAmount = subtotal * 0.06;
  const totalTaxAmount = cgstAmount + sgstAmount;

  const discountAmount = cart.reduce((sum, item) => {
    const itemSubtotal = Number(item.selling_price || 0) * Number(item.quantity || 0);
    const discountAmt = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
    return sum + discountAmt;
  }, 0);

  const total = subtotal + totalTaxAmount;

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
    <div className="billing-container">
      <div className="billing-header">
        <h1>Billing Screen</h1>
      </div>

      <div className="billing-layout">
        <div className="billing-main">
          <div className="search-section">
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
              className="barcode-input"
            />
            <button onClick={searchProduct} className="search-btn">
              Search
            </button>
          </div>

          {product && product.id && (
            <div className="product-details">
              <h3>{product.name}</h3>
              <p>
                <strong>Barcode:</strong> {product.barcode || "N/A"}
              </p>
              <p>
                <strong>Price:</strong> ₹{product.selling_price}
              </p>
              <p>
                <strong>Stock Left:</strong>{" "}
                {(product.stock || 0) - (cart.find((item) => item.id === product.id)?.quantity || 0)}
              </p>
              <button onClick={addToCart} className="add-btn">
                Add To Cart
              </button>
            </div>
          )}
        </div>

        <div className="cart-panel">
          <h2>🛒 Cart</h2>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Cart is Empty</p>
            </div>
          ) : (
            <>
              {cart.map((item) => {
                const itemSubtotal = item.quantity * Number(item.selling_price);
                const discountAmt = (itemSubtotal * Number(item.discountPercent || 0)) / 100;
                const itemTotal = itemSubtotal - discountAmt;

                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-header">
                      <div>
                        <h4>{item.name}</h4>
                        <small>
                          Size: {item.size || "FREE"} | Color: {item.color || "N/A"}
                        </small>
                      </div>
                      <div className="cart-item-price">
                        <h4>₹{itemTotal.toFixed(2)}</h4>
                        <small>+₹{(itemTotal * 0.12).toFixed(2)} Tax</small>
                      </div>
                    </div>

                    <div className="cart-item-controls">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span className="qty">{item.quantity}</span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="qty-btn"
                      >
                        +
                      </button>
                      <input
                        type="number"
                        placeholder="Disc%"
                        value={item.discountPercent || 0}
                        onChange={(e) =>
                          setCart(
                            cart.map((p) =>
                              p.id === item.id
                                ? {
                                    ...p,
                                    discountPercent: Math.min(100, Math.max(0, Number(e.target.value))),
                                  }
                                : p
                            )
                          )
                        }
                        className="discount-input"
                        min="0"
                        max="100"
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="delete-btn"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="customer-select"
          >
            <option value="">Select Existing Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_name}
              </option>
            ))}
          </select>

          <div className="customer-inputs">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerNameInput}
              onChange={(e) => setCustomerNameInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={customerPhoneInput}
              onChange={(e) => setCustomerPhoneInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Address (optional)"
              value={customerAddressInput}
              onChange={(e) => setCustomerAddressInput(e.target.value)}
            />
          </div>

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
              <h2>₹{total.toFixed(2)}</h2>
            </div>
          </div>

          <input
            type="number"
            placeholder="Paid Amount"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            className="paid-input"
          />

          <h3 className="due-amount">
            Due Amount: ₹{Math.max(0, total - (Number(paidAmount) || 0)).toFixed(2)}
          </h3>

          <div className="button-group">
            <button onClick={saveBill} disabled={cart.length === 0} className="save-btn">
              Save Bill
            </button>
            <button onClick={printReceipt} disabled={cart.length === 0} className="print-btn">
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;