import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";
import { getCategories } from "../services/categoryService";
import { toast } from "react-toastify";
import AddTransactionModal from "../components/AddTransactionModal";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import DeleteTransactionModal from "../components/DeleteTransactionModal";
import getErrorMessage from "../utils/getErrorMessage";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sortBy, setSortBy] = useState("transaction_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editingTransaction, setEditingTransaction] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTransactions({
          page: currentPage,
          limit: 10,
          sortBy,
          sortOrder,
          search,
          type,
          ...(categoryId ? { categoryId } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });

        if (response.success) {
          setTransactions(response.data.transactions);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Fetch transactions error:", error);
        setError(getErrorMessage(error, "Unable to load transactions."));
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [
    currentPage,
    search,
    type,
    categoryId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    refreshKey,
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();

        if (response.success) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);

        toast.error(getErrorMessage(error, "Unable to load categories"));
      }
    };
    fetchCategories();
  }, []);

  const handleCreateTransaction = async (transactionData) => {
    try {
      setSubmitting(true);

      const response = await createTransaction(transactionData);

      if (response.success) {
        toast.success(response.message || "Transaction created successfully");
        setShowAddModal(false);

        //Refresh the transaction list.
        setCurrentPage(1);
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Create transaction error:", error);

      toast.error(getErrorMessage(error, "Unable to create transaction."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTransaction = async (transactionData) => {
    if (!editingTransaction) return;

    try {
      setSubmitting(true);

      const response = await updateTransaction(
        editingTransaction.id,
        transactionData,
      );

      if (response.success) {
        toast.success(response.message || "Transaction updated successfully");

        setShowAddModal(false);
        setEditingTransaction(null);
        setCurrentPage(1);
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Update transaction error:", error);

      toast.error(getErrorMessage(error, "Unable to update transaction."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;

    try {
      setIsDeleting(true);

      const response = await deleteTransaction(deletingTransaction.id);

      if (response.success) {
        toast.success(response.message || "Transaction deleted successfully");

        setShowDeleteModal(false);
        setDeletingTransaction(null);

        //If the last item on this page was deleted,
        //move back one page when possible
        if (transactions.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          setRefreshKey((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Delete transaction error:", error);

      toast.error(getErrorMessage(error, "Unable to delete transaction."));
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(
    search.trim() || type || categoryId || startDate || endDate,
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Transactions</h2>
          <p className="text-muted mb-0">Manage your income and expenses.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingTransaction(null);
            setShowAddModal(true);
          }}
        >
          Add Transaction
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-3 p-sm-4 p-lg-5">
          <div className="mb-4">
            <h5 className="fw-bold mb-1">All Transactions</h5>
            <p className="text-muted small mb-0">
              View your income and expenses.
            </p>
          </div>

          <div className="row g-3 mb-4 ">
            <div className="col-12 col-md-6 col-xl-4">
              <label
                htmlFor="transactionSearch"
                className="form-label fw-semibold"
              >
                Search transactions
              </label>

              <input
                type="search"
                id="transactionSearch"
                className="form-control"
                placeholder="Search by description..."
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <label
                htmlFor="transactionType"
                className="form-label fw-semibold"
              >
                Transaction type
              </label>

              <select
                id="transactionType"
                className="form-select"
                value={type}
                onChange={(e) => handleFilterChange(setType, e.target.value)}
              >
                <option value="">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <label
                htmlFor="transactionCategory"
                className="form-label fw-semibold"
              >
                Category
              </label>

              <select
                id="transactionCategory"
                className="form-select"
                value={categoryId}
                onChange={(e) =>
                  handleFilterChange(setCategoryId, e.target.value)
                }
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start date
              </label>

              <input
                type="date"
                id="startDate"
                className="form-control"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) =>
                  handleFilterChange(setStartDate, e.target.value)
                }
              />
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End date
              </label>

              <input
                type="date"
                id="endDate"
                className="form-control"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <label htmlFor="transactionSort" className="form-label">
                Sort by
              </label>

              <select
                id="transactionSort"
                className="form-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(1);
                }}
              >
                <option value="transaction_date-desc">Newest first</option>
                <option value="transaction_date-asc">Oldest first</option>
                <option value="amount-asc">Amount: Low to high</option>
                <option value="amount-desc">Amount: High to low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center py-5">
              <Spinner
                animation="border"
                variant="primary"
                role="status"
                aria-label="Loading transactions"
              />
              <p className="text-muted mt-2 mb-0">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger mb-0" role="alert">
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5">
              {hasActiveFilters ? (
                <>
                  <h5 className="fw-semibold mb-2">No matching transactions</h5>

                  <p className="text-muted mb-3">
                    Try changing your search or filters.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setSearch("");
                      setType("");
                      setCategoryId("");
                      setStartDate("");
                      setEndDate("");
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <h5 className="fw-semibold mb-2">No transactions yet</h5>

                  <p className="text-muted mb-3">
                    Start tracking your income and expenses by adding your first
                    transaction.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingTransaction(null);
                      setShowAddModal(true);
                    }}
                  >
                    Add your First Transaction
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr className="text-muted small">
                      <th scope="col">Transaction</th>
                      <th scope="col">Category</th>
                      <th scope="col">Date</th>
                      <th scope="col" className="text-end">
                        Amount
                      </th>
                      <th scope="col" className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => {
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
                            {transaction.transactionDate
                              ? (() => {
                                  const dateString =
                                    transaction.transactionDate;

                                  const [year, month, day] = String(dateString)
                                    .slice(0, 10)
                                    .split("-")
                                    .map(Number);

                                  return `${String(day).padStart(2, "0")} ${new Date(
                                    Date.UTC(year, month - 1, day),
                                  ).toLocaleString("en-IN", {
                                    month: "short",
                                    timeZone: "UTC",
                                  })} ${year}`;
                                })()
                              : "-"}
                          </td>

                          <td
                            className={`text-end fw-semibold text-nowrap ${
                              isIncome ? "text-success" : "text-danger"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(Number(transaction.amount))}
                          </td>

                          <td className="text-end">
                            <div className="d-flex flex-column flex-sm-row justify-content-end align-items-end align-items-sm-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setEditingTransaction(transaction);
                                  setShowAddModal(true);
                                }}
                                aria-label={`Edit transaction: ${
                                  transaction.description ||
                                  transaction.categoryName
                                }`}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setDeletingTransaction(transaction);
                                  setShowDeleteModal(true);
                                }}
                                aria-label={`Delete transaction: ${
                                  transaction.description ||
                                  transaction.categoryName
                                }`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!loading && !error && transactions.length > 0 && (
                <nav
                  className="mt-4 d-flex justify-content-center"
                  aria-label="Transaction pagination"
                >
                  <ul className="pagination mb-0 flex-wrap justify-content-center">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        <FaAnglesLeft />
                      </button>
                    </li>

                    {Array.from(
                      { length: Math.max(totalPages, 1) },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        <FaAnglesRight />
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
      <AddTransactionModal
        key={`${showAddModal}-${editingTransaction?.id ?? "new"}`}
        show={showAddModal}
        categories={categories}
        editingTransaction={editingTransaction}
        onClose={() => {
          setShowAddModal(false);
          setEditingTransaction(null);
        }}
        onSubmit={
          editingTransaction ? handleUpdateTransaction : handleCreateTransaction
        }
        submitting={submitting}
      />

      <DeleteTransactionModal
        show={showDeleteModal}
        transaction={deletingTransaction}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingTransaction(null);
        }}
        onConfirm={handleDeleteTransaction}
        deleting={isDeleting}
      />
    </div>
  );
};

export default Transactions;
