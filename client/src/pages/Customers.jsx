import { useEffect, useState } from "react";
import axios from "axios";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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
  }, []);

  const addCustomer = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/customers/add",
        {
          customer_name: customerName,
          phone,
          address
        }
      );

      setCustomerName("");
      setPhone("");
      setAddress("");

      loadCustomers();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCustomer = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/customers/${id}`
    );

    loadCustomers();
  };

  return (
    <div>
      <h1>Customers</h1>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) =>
          setCustomerName(e.target.value)
        }
      />

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
      />

      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) =>
          setAddress(e.target.value)
        }
      />

      <button onClick={addCustomer}>
        Add Customer
      </button>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.customer_name}</td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>
                <button
                  onClick={() =>
                    deleteCustomer(customer.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;