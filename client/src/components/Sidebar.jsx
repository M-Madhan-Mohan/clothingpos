import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "20px"
      }}
    >
      <h2>RS9 EXPORTS</h2>

      <div style={{ marginTop: "30px" }}>
        <p><Link to="/dashboard">Dashboard</Link></p>
        <p><Link to="/pos">POS Terminal</Link></p>
        <p><Link to="/products">Products</Link></p>
        <p><Link to="/sales">Sales</Link></p>
        <p><Link to="/customers">Customers</Link></p>
        <p><Link to="/suppliers">Suppliers</Link></p>
        <p><Link to="/purchases">Purchases</Link></p>
        <p><Link to="/expenses">Expenses</Link></p>
      </div>
    </div>
  );
}

export default Sidebar;