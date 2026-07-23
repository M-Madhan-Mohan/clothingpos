import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { FaCalendarAlt, FaChartLine, FaExclamationTriangle, FaReceipt, FaRupeeSign } from "react-icons/fa";
import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const API = "http://localhost:5000/api";
const currency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Dashboard() {
  const [stats, setStats] = useState({ todayRevenue: 0, todaySales: 0, todayGst: 0, lowStockCount: 0 });
  const [analytics, setAnalytics] = useState({ trend: [], categories: [] });
  const [lowStock, setLowStock] = useState([]);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    Promise.all([
      axios.get(`${API}/dashboard`),
      axios.get(`${API}/dashboard/analytics`),
      axios.get(`${API}/products/low-stock`)
    ]).then(([statsResponse, analyticsResponse, lowStockResponse]) => {
      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);
      setLowStock(lowStockResponse.data);
    }).catch(() => setError("Live dashboard data is unavailable. Please check that the backend is running."));
    return () => clearInterval(clock);
  }, []);

  const trendData = useMemo(() => ({
    labels: analytics.trend.map((item) => item.label),
    datasets: [{ data: analytics.trend.map((item) => item.revenue), borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,.16)", borderWidth: 3, pointRadius: 3, pointBackgroundColor: "#b59aff", fill: true, tension: .35 }]
  }), [analytics]);
  const categoryColors = ["#8247ee", "#19b7d1", "#f59e0b", "#ef5da8", "#5aca89"];
  const categoryData = useMemo(() => ({
    labels: analytics.categories.map((item) => item.category),
    datasets: [{ data: analytics.categories.map((item) => item.revenue), backgroundColor: categoryColors, borderWidth: 0, cutout: "72%" }]
  }), [analytics]);
  const totalCategorySales = analytics.categories.reduce((sum, item) => sum + Number(item.revenue), 0);

  return <section className="management-dashboard">
    <header className="dashboard-header">
      <div><h1>Management Dashboard</h1><p>● RS9 EXPORTS</p></div>
      <div className="dashboard-chips"><span><FaCalendarAlt /> {now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span><span>◷ {now.toLocaleTimeString("en-IN")}</span></div>
    </header>
    <main className="dashboard-content">
      {error && <p className="dashboard-error">{error}</p>}
      <div className="metric-grid">
        <Metric label="Today's Sales" value={currency(stats.todayRevenue)} icon={<FaRupeeSign />} variant="green" />
        <Metric label="Transactions" value={stats.todaySales || 0} icon={<FaReceipt />} variant="purple" />
        <Metric label="GST Collected" value={currency(stats.todayGst)} icon={<FaChartLine />} variant="amber" />
        <Metric label="Low Stock Items" value={stats.lowStockCount || 0} icon={<FaExclamationTriangle />} variant="red" />
      </div>
      <div className="analytics-grid">
        <section className="dashboard-panel trend-panel"><div className="panel-heading"><h2>Last 7 Days Sales Trend (INR)</h2><span>Live Analytics</span></div><div className="chart-area"><Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => currency(context.raw) } } }, scales: { x: { grid: { display: false }, ticks: { color: "#9baec8" }, border: { color: "#282a39" } }, y: { beginAtZero: true, grid: { color: "rgba(63,65,84,.32)" }, ticks: { color: "#9baec8", callback: (value) => `₹${value}` }, border: { display: false } } } }} /></div></section>
        <section className="dashboard-panel category-panel"><h2>Sales by Category</h2><div className="donut-area"><Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${currency(context.raw)}` } } } }} /><div className="donut-total"><strong>{currency(totalCategorySales)}</strong><small>Total Sales</small></div></div><div className="category-list">{analytics.categories.length ? analytics.categories.map((item, index) => <div key={item.category}><span><i style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />{item.category} ({totalCategorySales ? Math.round((item.revenue / totalCategorySales) * 100) : 0}%)</span><strong>{currency(item.revenue)}</strong></div>) : <p>No category sales yet.</p>}</div></section>
      </div>
      <section className="dashboard-panel stock-panel"><div className="panel-heading"><h2><FaExclamationTriangle /> Inventory &amp; Stock Alerts</h2><span className="restock-badge">Needs Restocking</span></div><div className="stock-table-wrap"><table className="stock-table"><thead><tr><th>Product Code</th><th>Product Name</th><th>Category</th><th>Size</th><th>Color</th><th>Min Stock</th><th>Current Stock</th></tr></thead><tbody>{lowStock.length ? lowStock.map((product) => <tr key={product.id}><td>{product.code || "—"}</td><td>{product.name}</td><td>{product.category || "—"}</td><td><span className="size-tag">{product.size || "Free Size"}</span></td><td>{product.color || "—"}</td><td>{product.min_stock || 0} pcs</td><td className="current-stock">{product.stock} pcs</td></tr>) : <tr><td colSpan="7" className="no-stock">All products are above their minimum stock level.</td></tr>}</tbody></table></div></section>
    </main>
  </section>;
}

function Metric({ label, value, icon, variant }) { return <section className="metric-card"><div><p>{label}</p><strong>{value}</strong></div><i className={`metric-icon ${variant}`}>{icon}</i></section>; }
export default Dashboard;
