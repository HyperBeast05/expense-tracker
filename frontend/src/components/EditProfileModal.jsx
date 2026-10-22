import { useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { updateProfile } from "../services/profileService";
import { toast } from "react-toastify";
import getErrorMessage from "../utils/getErrorMessage";
import { FaUserPen } from "react-icons/fa6";

const EditProfileModal = ({ show, onHide, user, onUpdated }) => {
  const [formData, setFormData] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const validate = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      const response = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      if (response.success) {
        onUpdated(response.user);
        toast.success(response.message || "Profile updated successfully");
        onHide();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update profile"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onHide();
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
            <FaUserPen className="me-2" />
            Edit Profile
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Full name</Form.Label>

            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
              maxLength={100}
              autoComplete="name"
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Email address</Form.Label>

            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              autoComplete="email"
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
