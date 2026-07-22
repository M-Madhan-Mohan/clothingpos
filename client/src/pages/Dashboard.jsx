import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
function Dashboard() {
  const [stats, setStats] = useState({
  totalProducts: 0,
  totalCustomers: 0,
  totalSales: 0,
  revenue: 0,
  expenses: 0,
  profit: 0,
  todaySales: 0,
  todayRevenue: 0,
  todayProfit: 0,
  lowStockCount: 0
});
  const [lowStock, setLowStock] = useState([]);
  const [sales, setSales] = useState([]);
  const [monthlySales, setMonthlySales] =
  useState([]);
  const [topProducts, setTopProducts] =
  useState([]);
  useEffect(() => {
    axios
  .get(
    "http://localhost:5000/api/dashboard/monthly-sales"
  )
  .then((res) => {
    console.log("MONTHLY SALES");
    console.log(res.data);
    setMonthlySales(res.data);
  })
  .catch((err) => {
    console.log(err);
  });
    axios
      .get("http://localhost:5000/api/dashboard")
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get("http://localhost:5000/api/products/low-stock")
      .then((res) => {
        setLowStock(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
      axios
  .get(
    "http://localhost:5000/api/dashboard/top-products"
  )
  .then((res) => {
    setTopProducts(res.data);
  })
  .catch((err) => {
    console.log(err);
  });

    axios
      .get("http://localhost:5000/api/sales")
      .then((res) => {
        setSales(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get("http://localhost:5000/api/dashboard/monthly-sales")
      .then((res) => {
        setMonthlySales(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
const chartData = {
  labels: monthlySales.map(
    (item) => item.month
  ),

  datasets: [
    {
      label: "Revenue",
      data: monthlySales.map(
        (item) => Number(item.revenue)
      ),
      borderColor: "#3b82f6",
      backgroundColor:
        "rgba(59,130,246,0.25)",
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 5
    }
  ]
};
const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: "#fff"
      }
    }
  },

  scales: {
    x: {
      ticks: {
        color: "#fff"
      }
    },

    y: {
      beginAtZero: true,
      ticks: {
        color: "#fff"
      }
    }
  }
};
const card = {
  border: "1px solid #444",
  boxShadow: "0 0 10px rgba(255,255,255,0.1)",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center"
};
 return (
  <div
    style={{
      padding: "20px",
      maxWidth: "1400px",
      margin: "0 auto"
    }}
  >
    <h1 style={{ textAlign: "center" }}>
      Dashboard
    </h1>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}
    >
      <div style={card}>
        <h3>Products</h3>
        <h2>{stats.totalProducts}</h2>
      </div>

      <div style={card}>
        <h3>Customers</h3>
        <h2>{stats.totalCustomers}</h2>
      </div>

      <div style={card}>
        <h3>Total Bills</h3>
        <h2>{stats.totalSales}</h2>
      </div>

      <div style={card}>
        <h3>Revenue</h3>
        <h2>₹{stats.revenue}</h2>
      </div>

      <div style={card}>
        <h3>Expenses</h3>
        <h2>₹{stats.expenses}</h2>
      </div>

      <div style={card}>
        <h3>Profit</h3>
        <h2>
          ₹{Number(stats.profit).toFixed(2)}
        </h2>
        <p>
          {stats.profitPercentage}% Margin
        </p>
      </div>

      <div style={card}>
        <h3>Today's Sales</h3>
        <h2>{stats.todaySales}</h2>
      </div>

      <div style={card}>
        <h3>Today's Revenue</h3>
        <h2>₹{stats.todayRevenue}</h2>
      </div>

      <div style={card}>
        <h3>Today's Profit</h3>
        <h2>₹{stats.todayProfit}</h2>
      </div>

      <div style={card}>
        <h3>Low Stock Items</h3>
        <h2>{stats.lowStockCount}</h2>
      </div>
    </div>

    <h2>Revenue vs Profit</h2>

    <div
      style={{
        width: "100%",
        height: "450px",
        border: "1px solid #444",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "30px",
        boxShadow:
          "0 0 10px rgba(255,255,255,0.1)"
      }}
    >
      <Line
        data={chartData}
        options={options}
      />
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
      }}
    >
      <div
        style={{
          border: "1px solid #444",
          borderRadius: "10px",
          padding: "20px",
          boxShadow:
            "0 0 10px rgba(255,255,255,0.1)"
        }}
      >
        <h2>Top Selling Products</h2>

        {topProducts.length === 0 ? (
          <p>No Sales Yet</p>
        ) : (
          topProducts.map(
            (product, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px"
                }}
              >
                {index + 1}. {product.name}
                {" - "}
                {product.total_sold} sold
              </div>
            )
          )
        )}
      </div>

      <div
        style={{
          border: "1px solid #444",
          borderRadius: "10px",
          padding: "20px",
          boxShadow:
            "0 0 10px rgba(193,243,14,0.1)"
        }}
      >
        <h2>Low Stock Alerts</h2>

        {lowStock.length === 0 ? (
          <p>No Low Stock Products</p>
        ) : (
          lowStock.map((product) => (
            <div
              key={product.id}
              style={{
                marginBottom: "10px"
              }}
            >
              ⚠ {product.name}
              {" - Stock: "}
              {product.stock}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
}

export default Dashboard;