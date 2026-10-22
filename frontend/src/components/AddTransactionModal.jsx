import { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const getInitialForm = () => ({
  type: "expense",
  categoryId: "",
  amount: "",
  description: "",
  transactionDate: new Date().toLocaleDateString("en-CA"),
});

const AddTransactionModal = ({
  show,
  categories,
  onClose,
  onSubmit,
  submitting,
  editingTransaction = null,
}) => {
  const [formData, setFormData] = useState(() => {
    if (editingTransaction) {
      return {
        type: editingTransaction.type,
        categoryId: String(editingTransaction.categoryId),
        amount: String(editingTransaction.amount),
        description: editingTransaction.description || "",
        transactionDate: editingTransaction.transactionDate
          ? String(editingTransaction.transactionDate).slice(0, 10)
          : getInitialForm().transactionDate,
      };
    }
    return getInitialForm();
  });
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(editingTransaction);

  const availableCategories = categories.filter(
    (category) => category.type === formData.type,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" ? { categoryId: "" } : {}),
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "type" ? { categoryId: "" } : {}),
    }));
  };

  const validateform = () => {
    const newErrors = {};
    const amount = Number(formData.amount);
    const selectedCategory = availableCategories.find(
      (category) => String(category.id) === formData.categoryId,
    );

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category.";
    } else if (!selectedCategory) {
      newErrors.categoryId =
        "Select a valid category for this transaction type.";
    }

    if (formData.amount.trim() === "") {
      newErrors.amount = "Please enter an amount.";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      newErrors.amount = "Amount must be greater than zero.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      newErrors.amount = "Enter a valid amount with up to 2 decimal places.";
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = "Please select a transaction date.";
    } else {
      const [year, month, day] = formData.transactionDate
        .split("-")
        .map(Number);

      const date = new Date(year, month - 1, day);

      const validate =
        /^\d{4}-\d{2}-\d{2}$/.test(formData.transactionDate) &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;

      if (!validate) {
        newErrors.transactionDate = "Please enter a valid date.";
      }
    }

    if (formData.description.length > 255) {
      newErrors.description = "Description cannot exceed 255 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateform()) return;

    onSubmit({
      ...formData,
      categoryId: Number(formData.categoryId),
      amount: Number(formData.amount),
      description: formData.description.trim(),
    });
  };

  return (
    <Modal
      show={show}
      onHide={submitting ? undefined : onClose}
      centered
      backdrop={submitting ? "static" : true}
      keyboard={!submitting}
      contentClassName="border-0 rounded-4 shadow"
    >
      <Modal.Header closeButton={!submitting}>
        <Modal.Title className="fw-bold">
          {isEditing ? "Edit Transactions" : "Add Transactions"}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="type" className="form-label fw-semibold">
              Transaction type
            </label>

            <select
              id="type"
              name="type"
              className="form-select"
              value={formData.type}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="categoryId" className="form-label fw-semibold">
              Category
            </label>

            <select
              id="categoryId"
              name="categoryId"
              className={`form-select ${errors.categoryId ? "is-invalid" : ""}`}
              value={formData.categoryId}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select category</option>

              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.categoryId && (
              <div className="invalid-feedback">{errors.categoryId}</div>
            )}

            {availableCategories.length === 0 && (
              <small className="text-muted">
                No categories available for this transaction type.
              </small>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="amount" className="form-label fw-semibold">
              Amount (₹)
            </label>

            <input
              type="number"
              id="amount"
              name="amount"
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              disabled={submitting}
              required
            />

            {errors.amount && (
              <div className="invalid-feedback">{errors.amount}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="transactionDate" className="form-label fw-semibold">
              Transaction date
            </label>

            <input
              type="date"
              id="transactionDate"
              name="transactionDate"
              className={`form-control ${errors.transactionDate ? "is-invalid" : ""}`}
              value={formData.transactionDate}
              onChange={handleChange}
              disabled={submitting}
              required
            />

            {errors.transactionDate && (
              <div className="invalid-feedback">{errors.transactionDate}</div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="form-label fw-semibold">
              Description (optional)
            </label>

            <textarea
              id="description"
              name="description"
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              rows={2}
              maxLength={255}
              value={formData.description}
              onChange={handleChange}
              placeholder="What was this transaction for?"
              disabled={submitting}
            />

            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting || availableCategories.length === 0}
          >
            {submitting ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  role="status"
                />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : isEditing ? (
              "Update Transaction"
            ) : (
              "Save Transaction"
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;
