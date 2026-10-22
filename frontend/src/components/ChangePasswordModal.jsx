import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { changePassword } from "../services/authService";
import { toast } from "react-toastify";
import getErrorMessage from "../utils/getErrorMessage";
import { Button, Form, InputGroup, Modal, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaKey, FaLock } from "react-icons/fa6";

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialVisibility = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
};

const PasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const passwordFields = [
  {
    name: "currentPassword",
    label: "Current Password",
    autoComplete: "current-password",
    icon: FaLock,
  },
  {
    name: "newPassword",
    label: "New password",
    autoComplete: "new-password",
    icon: FaKey,
  },
  {
    name: "confirmPassword",
    label: "Confirm new password",
    autoComplete: "new-password",
    icon: FaKey,
  },
];

const ChangePasswordModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(initialVisibility);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
    setShowPasswords(initialVisibility);
  };

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onHide();
  };

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

  const toggleLPasswordVisibility = (fieldName) => {
    setShowPasswords((previous) => ({
      ...previous,
      [fieldName]: !previous[fieldName],
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (
      formData.newPassword.length < 8 ||
      formData.newPassword.length > 128
    ) {
      newErrors.newPassword = "Password must contain 8-128 characters";
    } else if (!PasswordPattern.test(formData.newPassword)) {
      newErrors.newPassword =
        "Use uppercase, lowercase, a number and a special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password do not match";
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword = "New password must differ from current password";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      //Existing authService accepts these two arguments.
      const response = await changePassword(
        formData.currentPassword,
        formData.newPassword,
      );

      if (!response.success) {
        toast.error(response.message || "Unable to change password.");
        return;
      }
      toast.success(
        response.message || "Password changed. Please log in again.",
      );

      resetForm();
      onHide();

      //The backend clears the HTTP-only cookie.

      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to change password");

      //Show incorrect-current-password errors beside the field.
      if (error.response?.data?.field === "currentPassword") {
        setErrors((previous) => ({
          ...previous,
          currentPassword: message,
        }));
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop={submitting ? "static" : true}
      keyboard={!submitting}
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>
            <FaLock className="me-2" />
            Change Password
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small">
            Choose a strong password that you do not use elsewhere.
          </p>

          {passwordFields.map((field) => {
            const FieldIcon = field.icon;
            return (
              <Form.Group className="mb-3" key={field.name}>
                <Form.Label className="fw-semibold">
                  <FieldIcon className="me-2 text-primary" />
                  {field.label}
                </Form.Label>

                <InputGroup>
                  <Form.Control
                    type={showPasswords[field.name] ? "text" : "password"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    isInvalid={!!errors[field.name]}
                    autoComplete={field.autoComplete}
                    required
                    disabled={submitting}
                    aria-describedby={
                      errors[field.name] ? `${field.name}-error` : undefined
                    }
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => toggleLPasswordVisibility(field.name)}
                    disabled={submitting}
                    aria-label={
                      showPasswords[field.name]
                        ? `Hide ${field.label.toLowerCase()}`
                        : `Show ${field.label.toLowerCase()}`
                    }
                    aria-pressed={showPasswords[field.name]}
                  >
                    {showPasswords[field.name] ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>

                {errors[field.name] && (
                  <Form.Control.Feedback
                    type="invalid"
                    className="d-block"
                    id={`${field.name}-error`}
                  >
                    {errors[field.name]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            );
          })}
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <FaLock className="me-2" />
                Change Password
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
