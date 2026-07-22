import { useEffect, useState } from "react";
import axios from "axios";
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
function Products() {
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
setHsnCode("");
setCostPrice("");
setMrp("");
setSellingPrice("");
setGstRate("12");
setStock("");
setMinStock("");

setShowModal(false);
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);
      alert(JSON.stringify(error.response?.data));
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

<p>📍 RAINTECH CLOTHING STUDIO</p>

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

<button
className="add-btn"
onClick={()=>{
setEditId(null);
setShowModal(true);
}}
>

<FaPlus />

Add Product

</button>

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

<input
placeholder="Size"
value={size}
onChange={(e)=>
setSize(e.target.value)
}
/>

<input
placeholder="Color"
value={color}
onChange={(e)=>
setColor(e.target.value)
}
/>

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

<div>ACTIONS</div>

</div>

{products

.filter(product=>

(product.name || "")

.toLowerCase()

.includes(search.toLowerCase())

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

<div>

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

<div>

<div className="size-chip">

{product.size}

</div>

<div className="color-text">

{product.color}

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

<button
className="icon-btn"

onClick={()=>{

setEditId(product.id);

setBarcode(product.barcode);

setProductName(product.name);

setCategory(product.category);

setBrand(product.brand);

setSize(product.size);

setColor(product.color);

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

<button
className="icon-btn delete"

onClick={()=>deleteProduct(product.id)}

>

<FaTrash/>

</button>

</div>

</div>

))

}

</div>
</div>
  );
}


export default Products;