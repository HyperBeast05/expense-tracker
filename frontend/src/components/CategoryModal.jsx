import { useState } from "react";
import { createCategory, updateCategory } from "../services/categoryService";
import { Button, Modal, Spinner } from "react-bootstrap";

const initialForm = {
  name: "",
  type: "expense",
};

const CategoryModal = ({
  show,
  onClose,
  editingCategory,
  submitting,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(() =>
    editingCategory
      ? {
          name: editingCategory.name,
          type: editingCategory.type,
        }
      : initialForm,
  );
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const name = formData.name.trim();

    if (!name) {
      newErrors.name = "Category name is required.";
    } else if (name.length < 2 || name.length > 50) {
      newErrors.name = "Category name must be between 2 and 50 characters.";
    }

    if (!["income", "expense"].includes(formData.type)) {
      newErrors.type = "Please select a valid category type.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const categoryData = {
      name: formData.name.trim(),
      type: formData.type,
    };

    await onSubmit(categoryData, (data) =>
      editingCategory
        ? updateCategory(editingCategory.id, data)
        : createCategory(data),
    );
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={submitting ? "static" : true}
      keyboard={!submitting}
    >
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>
          {editingCategory ? "Edit Category" : "Add Category"}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="categoryName" className="form-label fw-semibold">
              Category name
            </label>

            <input
              id="categoryName"
              name="name"
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              placeholder="e.g. Groceries"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={50}
              disabled={submitting}
              required
              autoFocus
            />

            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>

          <div className="mb-2">
            <label htmlFor="categoryType" className="form-label fw-semibold">
              Category type
            </label>

            <select
              id="categoryType"
              name="type"
              className={`form-select ${errors.type ? "is-invalid" : ""}`}
              value={formData.type}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            {errors.type && (
              <div className="invalid-feedback">{errors.type}</div>
            )}

            {editingCategory && (
              <div className="form-text">
                A category's type cannot be changed if existing transactions use
                it.
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : editingCategory ? (
              "Updating Category"
            ) : (
              "Save Category"
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CategoryModal;
