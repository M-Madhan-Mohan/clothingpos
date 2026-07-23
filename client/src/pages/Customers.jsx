import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const loadCustomers = () => {
    axios
      .get("http://localhost:5000/api/customers")
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    loadCustomers();
    loadSales();
  }, []);

  const loadSales = () => {
    axios
      .get("http://localhost:5000/api/sales")
      .then((res) => setSales(res.data))
      .catch((err) => console.log(err));
  };

  const addCustomer = async () => {
    try {
      await axios.post("http://localhost:5000/api/customers/add", {
        customer_name: customerName,
        phone,
        address,
      });

      setCustomerName("");
      setPhone("");
      setAddress("");

      loadCustomers();
    } catch (error) {
      console.log(error);
      alert("Failed to add customer");
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      loadCustomers();
    } catch (error) {
      console.log(error);
      alert("Failed to delete customer");
    }
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setEditValues({
      customer_name: customer.customer_name || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/customers/${id}`, editValues);
      setEditingId(null);
      setEditValues({});
      loadCustomers();
    } catch (err) {
      console.log(err);
      alert("Failed to update customer");
    }
  };

  const getLastPurchase = (customer) => {
    if (!sales || sales.length === 0) return "-";
    const byPhone = sales.filter(s => s.customer_mobile && customer.phone && String(s.customer_mobile).trim() === String(customer.phone).trim());
    const byName = sales.filter(s => s.customer_name && customer.customer_name && String(s.customer_name).trim().toLowerCase() === String(customer.customer_name).trim().toLowerCase());
    const relevant = byPhone.length ? byPhone : byName;
    if (!relevant || relevant.length === 0) return "-";
    const latest = relevant.reduce((a,b) => new Date(a.date) > new Date(b.date) ? a : b);
    return new Date(latest.date).toLocaleString();
  };

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h1>Customers</h1>
      </div>

      <div className="customers-controls">
        <input
          className="input-name"
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          className="input-phone"
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="input-address"
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button className="btn-add" onClick={addCustomer}>
          Add Customer
        </button>
      </div>

      <div className="customers-table-wrap">
        <table className="customers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Last Purchase</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>
                  {editingId === customer.id ? (
                    <input value={editValues.customer_name} onChange={(e) => setEditValues(prev => ({...prev, customer_name: e.target.value}))} />
                  ) : (
                    customer.customer_name
                  )}
                </td>
                <td>
                  {editingId === customer.id ? (
                    <input value={editValues.phone} onChange={(e) => setEditValues(prev => ({...prev, phone: e.target.value}))} />
                  ) : (
                    customer.phone
                  )}
                </td>
                <td>
                  {editingId === customer.id ? (
                    <input value={editValues.address} onChange={(e) => setEditValues(prev => ({...prev, address: e.target.value}))} />
                  ) : (
                    customer.address
                  )}
                </td>
                <td className="last-purchase">{getLastPurchase(customer)}</td>
                <td>
                  {editingId === customer.id ? (
                    <>
                      <button className="btn-edit" onClick={() => saveEdit(customer.id)}>Save</button>
                      <button className="btn-delete" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-edit" onClick={() => startEdit(customer)}>Edit</button>
                      <button className="btn-delete" onClick={() => deleteCustomer(customer.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;