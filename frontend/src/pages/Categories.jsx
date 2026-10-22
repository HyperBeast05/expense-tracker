import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteCategory, getCategories } from "../services/categoryService";
import getErrorMessage from "../utils/getErrorMessage";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import { Spinner } from "react-bootstrap";
import CategoryModal from "../components/CategoryModal";
import DeleteCategoryModal from "../components/DeleteCategoryModal";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();

      if (response.success) {
        setCategories(response.categories);
      } else {
        setError(response.message || "Unable to load categores.");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      setError(getErrorMessage(error, "Unable to load categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      await fetchCategories();
    };
    loadCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (categoryData, saveCategory) => {
    try {
      setSubmitting(true);

      const response = await saveCategory(categoryData);

      if (!response.success) {
        toast.error(response.message || "Unable to save category.");
        return;
      }

      toast.success(response.message || "Category saved successfully.");

      setShowCategoryModal(false);
      setEditingCategory(null);

      await fetchCategories();
    } catch (error) {
      console.error("Save category error:", error);

      toast.error(getErrorMessage(error, "Unable to save category"));
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      setIsDeleting(true);

      const response = await deleteCategory(deletingCategory.id);

      if (!response.success) {
        toast.error(response.message || "Unable to delete category.");
        return;
      }

      toast.success(response.message || "Category deleted successfully.");

      setShowDeleteModal(false);
      setDeletingCategory(null);

      await fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error(getErrorMessage(error, "Unable to delete category."));
    } finally {
      setIsDeleting(false);
    }
  };

  const incomeCount = categories.filter(
    (category) => category.type === "income",
  ).length;

  const expenseCount = categories.filter(
    (category) => category.type === "expense",
  ).length;

  return (
    <div className="container px-2 py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Categories</h2>
          <p className="text-muted mb-0">
            Manage your income and expense categories.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/dashboard" className="btn btn-outline-secondary">
            <FaArrowLeft className="me-2" />
            Back to Dashboard
          </Link>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <FaPlus className="me-2" />
            Add Category
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <p className="text-muted mb-1">Income Categories</p>
              <h3 className="fw-bold text-success mb-0">{incomeCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <p className="text-muted mb-1">Expense Categories</p>
              <h3 className="fw-bold text-danger mb-0">{expenseCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-3 p-sm-4">
          <h5 className="fw-bold mb-3">All Categories</h5>

          {loading ? (
            <div className="text-center py-5">
              <Spinner
                animation="border"
                variant="primary"
                role="status"
                aria-label="Loading Categories"
              />
              <p className="text-muted mt-2 mb-0">Loading Categories...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              <p className="mb-3">{error}</p>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={fetchCategories}
              >
                Retry
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="fw-semibold">No categories yet</h5>
              <p className="text-muted">
                Add a category to organize your income and expenses.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={openAddModal}
              >
                <FaPlus className="me-2" />
                Add Your First Category
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th scope="col">Category Name</th>
                    <th scope="col">Type</th>
                    <th scope="col" className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="fw-semibold">{category.name}</td>

                      <td>
                        <span
                          className={`badge ${
                            category.type === "income"
                              ? "text-bg-success"
                              : "text-bg-danger"
                          }`}
                        >
                          {category.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            aria-label={`Edit category: ${category.name}`}
                            onClick={() => openEditModal(category)}
                          >
                            <FaPen className="me-2" />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            aria-label={`Delete category: ${category.name}`}
                            onClick={() => openDeleteModal(category)}
                          >
                            <FaTrash className="me-2" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CategoryModal
        key={`${showCategoryModal}-${editingCategory?.id ?? "new"}`}
        show={showCategoryModal}
        onClose={() => {
          if (submitting) return;
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        submitting={submitting}
        onSubmit={handleSaveCategory}
      />

      <DeleteCategoryModal
        show={showDeleteModal}
        category={deletingCategory}
        deleting={isDeleting}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteModal(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
};

export default Categories;
