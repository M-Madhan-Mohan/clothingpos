import { useEffect, useState } from "react";
import axios from "axios";
import Barcode from "react-barcode";
import {
  FaPlus,
  FaTrash,
  FaPrint,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import "../styles/barcode.css";

function BarcodePrinter() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [queue, setQueue] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadProducts = () => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch(console.log);
  };

  const addQueue = () => {
    if (!selectedProduct) return;

    const product = products.find(
      (p) => p.id == selectedProduct
    );

    if (!product) return;

    setQueue([
      ...queue,
      {
        ...product,
        copies: 1,
      },
    ]);

    setSelectedProduct("");
  };

  const removeQueue = (id) => {
    setQueue(queue.filter((q) => q.id !== id));
  };

  return (
    <div className="barcode-page">

      <div className="page-header">

        <div className="header-left">
          <h1>Barcode Label Printing</h1>
          <p>📍 RAINTECH CLOTHING STUDIO</p>
        </div>

        <div className="header-right">

          <div className="date-box">
            <FaCalendarAlt />
            {new Date().toLocaleDateString()}
          </div>

          <div className="date-box">
            <FaClock />
            {time.toLocaleTimeString()}
          </div>

        </div>

      </div>

      <div className="toolbar-card">

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">
            -- Choose Product --
          </option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name} ({product.size} - {product.color})
            </option>
          ))}

        </select>

        <button
          className="purple-btn"
          onClick={addQueue}
        >
          <FaPlus />
          Add To Queue
        </button>

        <button
          className="dark-btn"
          onClick={() => setQueue([])}
        >
          Clear Queue
        </button>

        <button
          className="green-btn"
          onClick={() => window.print()}
        >
          <FaPrint />
          Print Sheet
        </button>

      </div>

      <div className="barcode-content">

        <div className="queue-card">

          <h2>
            Print Queue ({queue.length})
          </h2>

          {queue.map((item) => (

            <div
              key={item.id}
              className="queue-row"
            >

              <div>

                <strong>{item.name}</strong>

                <p>{item.barcode}</p>

              </div>

              <div>

                {item.size}

                <br />

                {item.color}

              </div>

              <input
                type="number"
                min="1"
                value={item.copies}
                onChange={(e) =>
                  setQueue(
                    queue.map((q) =>
                      q.id === item.id
                        ? {
                            ...q,
                            copies: Number(e.target.value),
                          }
                        : q
                    )
                  )
                }
              />

              <button
                className="delete-btn"
                onClick={() =>
                  removeQueue(item.id)
                }
              >
                <FaTrash />
              </button>

            </div>

          ))}

        </div>
        <div className="preview-card">

          <h2>
            Sheet Live Preview ({queue.reduce((total, item) => total + item.copies, 0)} Labels)
          </h2>

          <p className="preview-text">
            Below is the live layout that will print on your barcode sheet.
          </p>

          <div className="preview-area">

            {queue.flatMap((item) =>
              Array.from({ length: item.copies }, (_, index) => (

                <div
                  key={`${item.id}-${index}`}
                  className="label-card"
                >

                  <div className="label-header">

                    RS9 TRENDS

                  </div>

                  <div className="label-product">

                    {item.name}

                  </div>

                  <div className="label-info">

                    <span>Sz: {item.size}</span>

                    <span>Col: {item.color}</span>

                  </div>

                  <div className="label-line"></div>

                  <div className="barcode-wrapper">

                    <Barcode
                      value={String(item.barcode)}
                      format="CODE128"
                      width={1.3}
                      height={42}
                      margin={0}
                      displayValue={false}
                      background="#ffffff"
                    />

                  </div>

                  <div className="barcode-number">

                    {item.barcode}

                  </div>

                  <div className="price-box">

                    MRP: ₹{item.mrp || item.price || 0}

                  </div>

                  <div className="footer-text">

                    Art: {item.code || item.id} | INCL. ALL TAXES

                  </div>

                </div>

              ))
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default BarcodePrinter;