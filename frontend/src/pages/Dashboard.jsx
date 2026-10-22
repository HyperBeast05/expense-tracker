import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaArrowDown, FaArrowUp, FaWallet } from "react-icons/fa6";
import {
  getCategorySummary,
  getMonthlySummary,
  getRecentTransactions,
  getTransactionSummary,
} from "../services/transactionService";
import MonthlySummaryChart from "../components/MonthlySummaryChart";
import CategoryExpenseChart from "../components/CategoryExpenseChart";

const Dashboard = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        monthlyResponse,
        categoryResponse,
        recentResponse,
      ] = await Promise.all([
        getTransactionSummary(),
        getMonthlySummary(),
        getCategorySummary(),
        getRecentTransactions(),
      ]);

      if (summaryResponse.success) {
        setSummary(summaryResponse.summary);
      }

      if (monthlyResponse.success) {
        setMonthlySummary(monthlyResponse.summary);
      }

      if (categoryResponse.success) {
        setCategorySummary(categoryResponse.summary);
      }

      if (recentResponse.success) {
        setRecentTransactions(recentResponse.data.transactions);
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);

      setError(
        error.response?.data?.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      await fetchDashboardData();
    };
    loadDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount ?? 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const dateString = typeof date === "string" ? date.slice(0, 10) : date;

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={fetchDashboardData}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Dashboard Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Dashboard</h2>
      </div>

      <p className="text-muted">
        Welcome back, {user?.name ? `${user.name}` : ""}! Here's your financial
        overview
      </p>

      {/* Summary Cards */}
      <div className="row g-4">
        {/* Total Income */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Total Income</p>

                  <h3 className="fw-bold mb-1">
                    {formatCurrency(summary?.totalIncome)}
                  </h3>

                  <small className="text-muted">Money received</small>
                </div>

                <div
                  className="d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle"
                  style={{ width: "48px", height: "48px" }}
                >
                  <FaArrowUp />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Total Expenses</p>

                  <h3 className="fw-bold mb-1">
                    {formatCurrency(summary?.totalExpenses)}
                  </h3>

                  <small className="text-muted">Money spent</small>
                </div>

                <div
                  className="d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle"
                  style={{ width: "48px", height: "48px" }}
                >
                  <FaArrowDown />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="col-12 col-md col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Balance</p>

                  <h3 className="fw-bold mb-1">
                    {formatCurrency(summary?.balance)}
                  </h3>

                  <small className="text-muted">Current balance</small>
                </div>

                <div
                  className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle"
                  style={{ width: "48px", height: "48px" }}
                >
                  <FaWallet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Income vs Expenses Chart */}
      <div className="row g-4 mt-1 align-items-stretch">
        <div className="col-12 col-lg-7">
          <MonthlySummaryChart data={monthlySummary} />
        </div>

        {/* Category-wise Expense Chart */}
        <div className="col-12 col-lg-5">
          <CategoryExpenseChart data={categorySummary} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card border-0 shadow-sm rounded-4 mt-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-1">Recent Transactions</h5>
              <p className="text-muted small mb-0">
                Your latest income and expenses.
              </p>
            </div>

            <Link to="/transactions" className="btn btn-outline-primary btn-sm">
              View all
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="fw-semibold mb-1">No transactions yet</p>
              <p className="text-muted small mb-0">
                Your recent transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th scope="col">Transactions</th>
                    <th scope="col">Category</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="text-end">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentTransactions.map((transaction) => {
                    const isIncome = transaction.type === "income";

                    return (
                      <tr key={transaction.id}>
                        <td>
                          <div className="fw-semibold">
                            {transaction.description ||
                              transaction.categoryName}
                          </div>
                          <small className="text-muted">
                            {isIncome ? "Income" : "Expense"}
                          </small>
                        </td>

                        <td>{transaction.categoryName}</td>

                        <td className="text-nowrap">
                          {formatDate(transaction.transactionDate)}
                        </td>

                        <td
                          className={`text-end fw-semibold text-nowrap ${
                            isIncome ? "text-success" : "text-danger"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
