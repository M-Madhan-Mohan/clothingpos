import { useState } from "react";

import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Login from "./pages/Login";
import POSTerminal from "./pages/POSTerminal";
import BarcodePrinter from "./pages/BarcodePrinter";


function App() {
  const [page, setPage] = useState("pos");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("user")
  );

  const logout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() =>
          setIsLoggedIn(true)
        }
      />
    );
  }

  const menuStyle = (menu) => ({
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border:
      page === menu
        ? "1px solid #8b5cf6"
        : "1px solid #1f2937",
    background:
      page === menu
        ? "#151c35"
        : "transparent",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "15px",
    transition: "0.3s"
  });

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#070b18",
        color: "white",
        overflow: "hidden"
      }}
    >
      {/* SIDEBAR */}

      <div
        style={{
          width: "240px",
          background: "#0f172a",
          borderRight: "1px solid #1e293b",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* LOGO */}

        <div>
          <h1
            style={{
              color: "#8b5cf6",
              marginBottom: "5px"
            }}
          >
            GlowPOS
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "13px"
            }}
          >
            CLOTH BILLING PRO
          </p>
        </div>

        {/* MENU */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "40px"
          }}
        >
          <button
            style={menuStyle("dashboard")}
            onClick={() =>
              setPage("dashboard")
            }
          >
            📊 Dashboard
          </button>

          <button
            style={menuStyle("pos")}
            onClick={() =>
              setPage("pos")
            }
          >
            🛒 POS Terminal (F1)
          </button>

          <button
            style={menuStyle("products")}
            onClick={() =>
              setPage("products")
            }
          >
            👕 Product Entry (F7)
          </button>

          <button
  style={menuStyle("barcode")}
  onClick={() => setPage("barcode")}
>
  🏷 Barcode Printer
</button>

          <button
            style={menuStyle("sales")}
            onClick={() =>
              setPage("sales")
            }
          >
            🕘 Sales History
          </button>

          <button
            style={{
              ...menuStyle("settings"),
              opacity: 0.8
            }}
          >
            ⚙ Store Settings
          </button>
        </div>

        {/* USER PROFILE */}

        <div
          style={{
            marginTop: "auto",
            borderTop: "1px solid #1f2937",
            paddingTop: "20px",
            marginBottom: "20px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}
            >
              AD
            </div>

            <div>
              <div
                style={{
                  fontWeight: "bold"
                }}
              >
                Administrator
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "12px"
                }}
              >
                Master Entry
              </div>
            </div>
          </div>
        </div>

        {/* LOGOUT */}

        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#ef4444",
            color: "white",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}

      <div
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          padding: "20px"
        }}
      >
        {page === "dashboard" && (
          <Dashboard />
        )}

        {page === "pos" && (
          <POSTerminal />
        )}

        {page === "products" && (
          <Products />
        )}

        {page === "sales" && (
          <Sales />
        )}
        {page === "barcode" && (
  <BarcodePrinter />
)}

        {page === "customers" && (
          <Customers />
        )}
      </div>
    </div>
  );
}

export default App;