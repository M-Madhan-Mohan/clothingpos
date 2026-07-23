import { useEffect, useState } from "react";
import axios from "axios";
import Barcode from "react-barcode";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";

import "../styles/products.css";

const colorNameMap = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  orange: "#ffa500",
  yellow: "#ffff00",
  green: "#008000",
  blue: "#0000ff",
  navy: "#000080",
  purple: "#800080",
  magenta: "#ff00ff",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  gray: "#808080",
  silver: "#c0c0c0",
  olive: "#808000",
  teal: "#008080",
  lime: "#00ff00",
  aqua: "#00ffff",
  coral: "#ff7f50",
  gold: "#ffd700",
  indigo: "#4b0082",
  violet: "#ee82ee",
  beige: "#f5f5dc",
  tan: "#d2b48c",
  salmon: "#fa8072",
  mint: "#98ff98",
  lavender: "#e6e6fa",
  peach: "#ffe5b4",
  chocolate: "#d2691e",
  crimson: "#dc143c",
  forestgreen: "#228b22",
  khaki: "#f0e68c",
  plum: "#dda0dd",
  sienna: "#a0522d",
  turquoise: "#40e0d0",
  slategray: "#708090",
  midnightblue: "#191970"
};

const hexToName = Object.fromEntries(
  Object.entries(colorNameMap).map(([name, hex]) => [hex.toLowerCase(), name.charAt(0).toUpperCase() + name.slice(1)])
);

const normalizeHex = (hex) => {
  const normalized = String(hex || "").trim().toLowerCase();
  if (!normalized.startsWith("#")) return `#${normalized}`;
  return normalized;
};

const getRgb = (hex) => {
  const normalized = normalizeHex(hex).replace("#", "");
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return { r, g, b };
};

const getDistance = (a, b) =>
  Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);

const getClosestColorName = (hex) => {
  const normalizedHex = normalizeHex(hex);
  if (hexToName[normalizedHex]) return hexToName[normalizedHex];
  const target = getRgb(normalizedHex);
  let nearest = "Custom";
  let smallestDistance = Infinity;
  for (const [name, colorHex] of Object.entries(colorNameMap)) {
    const distance = getDistance(target, getRgb(colorHex));
    if (distance < smallestDistance) {
      smallestDistance = distance;
      nearest = name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return nearest;
};

const getHexFromName = (name) => {
  if (!name) return "#7c3aed";
  const normalized = String(name || "").trim().toLowerCase();
  if (normalized.startsWith("#")) return normalizeHex(normalized);
  return colorNameMap[normalized] || "#7c3aed";
};

function Products({ readOnly = false }) {
  const [products, setProducts] = useState([]);

const [search, setSearch] = useState("");

const [categoryFilter, setCategoryFilter] =
useState("All Categories");

const [showModal, setShowModal] =
useState(false);
const [showBarcode, setShowBarcode] =
useState(false);

const [selectedProduct, setSelectedProduct] =
useState(null);

const [time, setTime] =
useState(new Date());

const [barcode, setBarcode] =
useState("");

const [productName, setProductName] =
useState("");

const [category, setCategory] =
useState("MENS");

const [brand, setBrand] =
useState("");

const [size, setSize] =
useState("");

const [color, setColor] =
useState("");

const [colorHex, setColorHex] =
useState("#7c3aed");

const [hsnCode, setHsnCode] =
useState("");

const [costPrice, setCostPrice] =
useState("");

const [mrp, setMrp] =
useState("");

const [sellingPrice, setSellingPrice] =
useState("");

const [gstRate, setGstRate] =
useState("12");

const [stock, setStock] =
useState("");

const [minStock, setMinStock] =
useState("");


const [editId, setEditId] =
useState(null);
  const loadProducts = () => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        console.log(res.data);
        setProducts(res.data || []);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadProducts();
  }, []);
  useEffect(() => {

const timer = setInterval(() => {

setTime(new Date());

},1000);

return ()=>clearInterval(timer);

},[]);

  const addProduct = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/products/add",
       {
  barcode,
  name: productName,
  category,
  brand,
  size,
  color,
  hsn_code: hsnCode,
  cost_price: Number(costPrice),
  mrp: Number(mrp),
  selling_price: Number(sellingPrice),
  gst_rate: Number(gstRate),
  stock: Number(stock),
  min_stock: Number(minStock)
}
      );

setBarcode("");
setProductName("");
setCategory("MENS");
setBrand("");
setSize("");
setColor("");
setColorHex("#7c3aed");
setGstRate("12");
setStock("");
setMinStock("");

setShowModal(false);
loadProducts();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to save the product. Please try again.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${id}`
      );
      loadProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editId}`,
        {
  barcode,
  name: productName,
  category,
  brand,
  size,
  color,
  hsn_code: hsnCode,
  cost_price: Number(costPrice),
  mrp: Number(mrp),
  selling_price: Number(sellingPrice),
  gst_rate: Number(gstRate),
  stock: Number(stock),
  min_stock: Number(minStock)
}
      );

      alert("Product Updated");
      setEditId(null);
      loadProducts();
    } catch (error) {
      console.log(error);
    }
  };

 return (
<div className="product-page">

<div className="page-header">

<div className="header-left">

<h1>Garment Product Master</h1>

<p>📍 RS9 EXPORTS</p>

</div>

<div className="header-right">

<div className="date-box">

<FaCalendarAlt />

<span>
{time.toLocaleDateString("en-US",{
weekday:"short",
month:"short",
day:"numeric",
year:"numeric"
})}
</span>

</div>

<div className="date-box">

<FaClock />

<span>
{time.toLocaleTimeString()}
</span>

</div>

</div>

</div>
<div className="toolbar-card">

<div className="top-toolbar">

<div className="search-box">
<FaSearch />

<input
type="text"
placeholder="Search by code, barcode, name, brand..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

</div>

<select
value={categoryFilter}
onChange={(e)=>setCategoryFilter(e.target.value)}
>

<option>All Categories</option>
<option>MENS</option>
<option>WOMENS</option>
<option>KIDS</option>
<option>ACCESSORIES</option>

</select>

{!readOnly && <button
className="add-btn"
onClick={()=>{
setEditId(null);
setShowModal(true);
}}
>

<FaPlus />

Add Product

</button>
}

</div>

</div>
      {showModal && (

<div className="modal-overlay">

<div className="product-modal">

<div className="modal-header">

<h2>

{editId
? "Edit Product Details"
: "New Product"}

</h2>

<button
className="close-btn"
onClick={()=>{
setShowModal(false);
setEditId(null);
}}
>

<FaTimes/>

</button>

</div>

<div className="form-grid">

<input
placeholder="Barcode"
value={barcode}
onChange={(e)=>
setBarcode(e.target.value)
}
/>

<input
placeholder="Product Name"
value={productName}
onChange={(e)=>
setProductName(e.target.value)
}
/>

<select
value={category}
onChange={(e)=>
setCategory(e.target.value)
}
>

<option>MENS</option>

<option>WOMENS</option>

<option>KIDS</option>

<option>ACCESSORIES</option>

</select>

<input
placeholder="Brand"
value={brand}
onChange={(e)=>
setBrand(e.target.value)
}
/>

<select
value={size}
onChange={(e)=>
setSize(e.target.value)
}
>
<option value="">Select Size</option>
<option value="S">S</option>
<option value="M">M</option>
<option value="L">L</option>
<option value="XL">XL</option>
<option value="2XL">2XL</option>
<option value="3XL">3XL</option>
<option value="4XL">4XL</option>
</select>

<div className="color-picker-row">
<div className="color-picker-wrapper">
<label htmlFor="colorPlate">Color Plate</label>
<input
id="colorPlate"
type="color"
value={colorHex}
onChange={(e)=>{
  const nextHex = e.target.value;
  setColorHex(nextHex);
  setColor(getClosestColorName(nextHex));
}}
/>
</div>

<input
placeholder="Color Name"
value={color}
onChange={(e)=>{
  const nextColor = e.target.value;
  setColor(nextColor);
  setColorHex(getHexFromName(nextColor));
}}
/>
</div>

<input
placeholder="HSN Code"
value={hsnCode}
onChange={(e)=>
setHsnCode(e.target.value)
}
/>

<input
type="number"
placeholder="Cost Price"
value={costPrice}
onChange={(e)=>
setCostPrice(e.target.value)
}
/>

<input
type="number"
placeholder="MRP"
value={mrp}
onChange={(e)=>
setMrp(e.target.value)
}
/>

<input
type="number"
placeholder="Retail Price"
value={sellingPrice}
onChange={(e)=>
setSellingPrice(e.target.value)
}
/>

<input
type="number"
placeholder="GST %"
value={gstRate}
onChange={(e)=>
setGstRate(e.target.value)
}
/>

<input
type="number"
placeholder="Stock"
value={stock}
onChange={(e)=>
setStock(e.target.value)
}
/>

<input
type="number"
placeholder="Minimum Stock"
value={minStock}
onChange={(e)=>
setMinStock(e.target.value)
}
/>

</div>

<div className="modal-buttons">

<button
className="cancel-btn"
onClick={()=>{
setShowModal(false);
setEditId(null);
}}
>

Cancel

</button>

<button
className="save-btn"
onClick={
editId
? updateProduct
: addProduct
}
>

{editId
? "Update Product"
: "Save Product"}

</button>

</div>

</div>

</div>

)}

{showBarcode && selectedProduct && (
<div className="modal-overlay barcode-preview-overlay" role="dialog" aria-modal="true" aria-label="Barcode label preview">
  <div className="barcode-preview-modal">
    <div className="modal-header">
      <h2>Barcode Label Preview</h2>
      <button className="close-btn" aria-label="Close barcode preview" onClick={() => { setShowBarcode(false); setSelectedProduct(null); }}><FaTimes /></button>
    </div>
    <div className="barcode-preview-stage">
      <article className="barcode-label">
        <strong>RS9 EXPORTS</strong>
        <span className="barcode-label-product">{selectedProduct.name}</span>
        <div className="barcode-label-details"><span>Size: <b>{selectedProduct.size || "Free Size"}</b></span><span>Color: <b>{selectedProduct.color || "N/A"}</b></span></div>
        <div className="barcode-label-rule" />
        <Barcode value={String(selectedProduct.barcode || selectedProduct.code || selectedProduct.id)} format="CODE128" width={1.12} height={46} margin={0} displayValue={false} background="#fff" />
        <span className="barcode-label-number">{selectedProduct.barcode || selectedProduct.code || selectedProduct.id}</span>
        <strong className="barcode-label-mrp">MRP: &#8377;{Number(selectedProduct.mrp || selectedProduct.selling_price || 0).toFixed(2)}</strong>
        <small>Art: {selectedProduct.code || `P-${String(selectedProduct.id).padStart(4, "0")}`} | INCL. ALL TAXES</small>
      </article>
    </div>
    <div className="barcode-preview-actions"><span>Standard label: 50mm x 25mm</span><button onClick={() => { setShowBarcode(false); setSelectedProduct(null); }}>Close</button><button className="barcode-print-label" onClick={() => window.print()}>Print Label</button></div>
  </div>
</div>
)}

<div className="table-card">

<div className="table-header">

<div>CODE</div>

<div>BARCODE</div>

<div>PRODUCT NAME</div>

<div>CATEGORY</div>

<div>SIZE / COLOR</div>

<div>COST (₹)</div>

<div>MRP (₹)</div>

<div>RETAIL (₹)</div>

<div>GST RATE</div>

<div>STOCK STATUS</div>

<div>{readOnly ? "LABEL" : "ACTIONS"}</div>

</div>

{products

.filter(product=>

[product.code, product.barcode, product.name, product.brand]

.some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))

&&

(categoryFilter==="All Categories"

?true

:product.category===categoryFilter)

)

.map(product=>(

<div
key={product.id}
className="table-row"
>

<div>

{product.code ||

`P-${String(product.id).padStart(4,"0")}`}

</div>

<div className="barcode-preview-cell" onClick={()=>{ setSelectedProduct(product); setShowBarcode(true); }} role="button" tabIndex={0} onKeyDown={(event)=>{ if(event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedProduct(product); setShowBarcode(true); } }}>

🏷 {product.barcode}

</div>

<div>

<strong>

{product.name}

</strong>

<small>

Brand: {product.brand || "-"}

|

HSN: {product.hsn_code || "-"}

</small>

</div>

<div>

{product.category}

</div>

<div className="product-variant-cell">
  <span className="color-dot" style={{ backgroundColor: getHexFromName(product.color) }} />
  <div>
    <div className="size-chip">
      {product.size}
    </div>
    <div className="color-text">
      {product.color}
    </div>
  </div>
</div>

<div>

₹{Number(product.cost_price).toFixed(2)}

</div>

<div>

₹{Number(product.mrp).toFixed(2)}

</div>

<div
style={{
color:"#16d88a",
fontWeight:"700"
}}
>

₹{Number(product.selling_price).toFixed(2)}

</div>

<div>

{product.gst_rate}%

</div>

<div>

<span
className={
product.stock<=product.min_stock

?

"stock-badge low"

:

"stock-badge good"
}
>

{

product.stock<=product.min_stock

?

`${product.stock} pcs (Low)`

:

`${product.stock} pcs`

}

</span>

</div>

<div className="action-btns">

<button
className="icon-btn"
onClick={()=>{
setSelectedProduct(product);
setShowBarcode(true);
}}
>

🏷

</button>

{!readOnly && <button
className="icon-btn"

onClick={()=>{

setEditId(product.id);

setBarcode(product.barcode);

setProductName(product.name);

setCategory(product.category);

setBrand(product.brand);

setSize(product.size);

setColor(product.color);
setColorHex(getHexFromName(product.color));

setHsnCode(product.hsn_code);

setCostPrice(product.cost_price);

setMrp(product.mrp);

setSellingPrice(product.selling_price);

setGstRate(product.gst_rate);

setStock(product.stock);

setMinStock(product.min_stock);

setShowModal(true);

}}

>

<FaEdit/>

</button>
}

{!readOnly && <button
className="icon-btn delete"

onClick={()=>deleteProduct(product.id)}

>

<FaTrash/>

</button>
}

</div>

</div>

))

}

</div>
</div>
  );
}


export default Products;
