import { useEffect, useState } from "react";
import { FaBolt, FaChartPie, FaKeyboard, FaMoon, FaReceipt, FaTshirt, FaSignOutAlt, FaSun, FaTags, FaTools, FaWallet } from "react-icons/fa";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Login from "./pages/Login";
import POSTerminal from "./pages/POSTerminal";
import BarcodePrinter from "./pages/BarcodePrinter";
import StoreSettings from "./pages/StoreSettings";
import Expenses from "./pages/Expenses";
import "./styles/app-shell.css";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: FaChartPie },
  { key: "pos", label: "POS Terminal", shortcut: "F1", icon: FaReceipt },
  { key: "products", label: "Products", shortcut: "F7", icon: FaTshirt },
  { key: "sales", label: "Sales History", icon: FaTags }
];

function App() {
  const [page, setPage] = useState(() => localStorage.getItem("rs9-page") || "pos");
  const [theme, setTheme] = useState(() => localStorage.getItem("rs9-theme") || "dark");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem("rs9-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("rs9-page", page);
  }, [page]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!user || event.altKey || event.ctrlKey || event.metaKey || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      if (event.key === "F1") { event.preventDefault(); setPage("pos"); }
      if (event.key === "F7") { event.preventDefault(); setPage("products"); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user]);

  if (!user) return <Login onLogin={setUser} />;

  const isStaff = String(user.role || "").toLowerCase() === "staff";
  const items = [
    ...navItems,
    ...(!isStaff ? [{ key: "barcode", label: "Barcode Labels", icon: FaTags }, { key: "settings", label: "Store Settings", icon: FaTools }, { key: "expenses", label: "Expenses", icon: FaWallet }] : [])
  ];
  const title = items.find((item) => item.key === page)?.label || "POS Terminal";
  const logout = () => { localStorage.removeItem("user"); setUser(null); setPage("pos"); };

  return <div className="app-shell" data-theme={theme}>
    <aside className="app-sidebar">
      <div className="brand-lockup"><span className="brand-mark"><FaBolt /></span><div><strong>RS9 EXPORTS</strong><small>POS MANAGEMENT</small></div></div>
      <nav className="main-nav" aria-label="Main navigation">
        <span className="nav-label">Workspace</span>
        {items.map(({ key, label, shortcut, icon: Icon }) => <button key={key} className={page === key ? "nav-item active" : "nav-item"} onClick={() => setPage(key)}><Icon /><span>{label}</span>{shortcut && <kbd>{shortcut}</kbd>}</button>)}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card"><span className="avatar">{isStaff ? "ST" : "AD"}</span><div><strong>{user.name || user.username || (isStaff ? "Staff Member" : "Administrator")}</strong><small>{isStaff ? "Staff access" : "Administrator"}</small></div></div>
        <button className="logout-button" onClick={logout}><FaSignOutAlt /> Sign out</button>
      </div>
    </aside>
    <section className="app-main">
      <header className="app-topbar"><div><p>RS9 EXPORTS / {isStaff ? "STAFF WORKSPACE" : "ADMIN WORKSPACE"}</p><h1>{title}</h1></div><div className="topbar-actions"><span className="shortcut-help"><FaKeyboard /> F1 POS · F7 Products</span><button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <FaSun /> : <FaMoon />}<span>{theme === "dark" ? "Light" : "Dark"}</span></button></div></header>
      <main className="app-content">
        {page === "dashboard" && <Dashboard />}
        {page === "pos" && <POSTerminal user={user} onStaffChange={setUser} />}
        {page === "products" && <Products readOnly={isStaff} />}
        {page === "sales" && <Sales />}
        {page === "barcode" && !isStaff && <BarcodePrinter />}
        {page === "settings" && !isStaff && <StoreSettings />}
        {page === "expenses" && !isStaff && <Expenses />}
      </main>
    </section>
  </div>;
}

export default App;
