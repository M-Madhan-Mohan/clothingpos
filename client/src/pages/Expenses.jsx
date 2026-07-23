import { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaPlus } from "react-icons/fa";
import "../styles/expenses.css";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatMonthYear = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-");
    return new Date(`${year}-${month}-01`).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });
  }
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
};

const getTotalAmount = (expense) =>
  Number(expense.rent || 0) +
  Number(expense.electricity || 0) +
  Number(expense.staff_salary || 0);

const formatDaysLeft = (dueDate) => {
  if (!dueDate) return "-";
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) {
    return `Overdue ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`;
  }
  return `${diff} day${diff === 1 ? "" : "s"} left`;
};

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [expenseMonth, setExpenseMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [rent, setRent] = useState("");
  const [electricity, setElectricity] = useState("");
  const [staffSalary, setStaffSalary] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:5000/api/expenses");
      setExpenses(response.data || []);
    } catch {
      setError("Unable to load expenses. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExpenses = () => {
      void loadExpenses();
    };

    fetchExpenses();
  }, []);

  const saveExpense = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!expenseMonth) {
      setError("Please select month and year.");
      return;
    }

    try {
      const totalAmount = Number(rent || 0) + Number(electricity || 0) + Number(staffSalary || 0);
      const paidAmount = Number(amountPaid || 0);
      const updatedStatus = paidAmount >= totalAmount ? "Paid" : "Pending";

      await axios.post("http://localhost:5000/api/expenses/add", {
        entry_month: expenseMonth,
        due_date: dueDate || null,
        rent: Number(rent || 0),
        electricity: Number(electricity || 0),
        staff_salary: Number(staffSalary || 0),
        amount_paid: paidAmount,
        status: updatedStatus
      });

      setMessage("Expense saved successfully.");
      setRent("");
      setElectricity("");
      setStaffSalary("");
      setDueDate("");
      setAmountPaid("");
      setExpenseMonth(new Date().toISOString().slice(0, 7));
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save expense.");
    }
  };

  const markExpensePaid = async (expenseId) => {
    try {
      setMessage("");
      setError("");
      await axios.patch(`http://localhost:5000/api/expenses/${expenseId}/pay`);
      setMessage("Expense marked as paid.");
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark expense as paid.");
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.rent || 0) + Number(expense.electricity || 0) + Number(expense.staff_salary || 0),
    0
  );

  return (
    <section className="expenses-page">
      <header className="expenses-header">
        <div>
          <h1>Admin Expenses</h1>
          <p>● RS9 EXPORTS</p>
        </div>
        <div className="expenses-meta">
          <span><FaCalendarAlt /> {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
          <span><FaClock /> {new Date().toLocaleTimeString("en-IN")}</span>
        </div>
      </header>

      <section className="expenses-card">
        <h2>Record Monthly Expenses</h2>
        <form className="expenses-form" onSubmit={saveExpense}>
          <label className="expenses-field">
            <span>Date (Month & Year)</span>
            <input
              type="month"
              value={expenseMonth}
              onChange={(event) => setExpenseMonth(event.target.value)}
              required
            />
          </label>

          <label className="expenses-field">
            <span>Rent</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rent}
              onChange={(event) => setRent(event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="expenses-field">
            <span>Electricity</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={electricity}
              onChange={(event) => setElectricity(event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="expenses-field">
            <span>Staff Salary</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={staffSalary}
              onChange={(event) => setStaffSalary(event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="expenses-field">
            <span>Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>

          <label className="expenses-field">
            <span>Amount Paid</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
              placeholder="0.00"
            />
          </label>

          <div className="expenses-actions">
            <button type="submit" className="save-btn"><FaPlus /> Save Expense</button>
            {message && <span className="expenses-message success">{message}</span>}
            {error && <span className="expenses-message error">{error}</span>}
          </div>
        </form>
      </section>

      <section className="expenses-table-section">
        <div className="expenses-table-header">
          <h2>Expense History</h2>
          <span>Total: {formatCurrency(totalExpenses)}</span>
        </div>

        {loading ? (
          <p className="expenses-loading">Loading expense records…</p>
        ) : expenses.length === 0 ? (
          <p className="expenses-empty">No expense records found.</p>
        ) : (
          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Rent</th>
                  <th>Electricity</th>
                  <th>Staff Salary</th>
                  <th>Paid</th>
                  <th>Due Date</th>
                  <th>Days Left</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatMonthYear(expense.entry_month)}</td>
                    <td>{formatCurrency(expense.rent)}</td>
                    <td>{formatCurrency(expense.electricity)}</td>
                    <td>{formatCurrency(expense.staff_salary)}</td>
                    <td>{formatCurrency(expense.amount_paid)}</td>
                    <td>{expense.due_date ? new Date(expense.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                    <td>{formatDaysLeft(expense.due_date)}</td>
                    <td>{expense.status || "Pending"}</td>
                    <td>
                      {expense.status !== "Paid" ? (
                        <button className="mark-paid-btn" type="button" onClick={() => markExpensePaid(expense.id)}>
                          Mark Paid
                        </button>
                      ) : (
                        <span className="paid-badge">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default Expenses;
