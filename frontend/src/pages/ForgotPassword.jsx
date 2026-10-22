import { useForm } from "react-hook-form";
import { forgotPassword } from "../services/authService";
import { FaArrowLeft, FaEnvelope, FaKey } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await forgotPassword(data.email);

      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message || "Unable to process request");
      }
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        responseData.errors.forEach((error) => {
          toast.error(error.msg);
        });
      } else {
        toast.error(
          responseData?.message ||
            "Unable to process request. Please try again.",
        );
      }
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-4">
        <div
          className="d-inline-flex justify-content-center align-items-center bg-primary text-white rounded-circle mb-3"
          style={{ width: "56px", height: "56px" }}
        >
          <FaKey size={22} />
        </div>

        <h2 className="fw-bold mb-2">Forgot Password?</h2>

        <p className="text-muted mb-0">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="form-label fw-semibold">
            <FaEnvelope className="me-2" />
            Email
          </label>

          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Email is required"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
          />

          {errors.email && (
            <div className="invalid-feedback">{errors.email.message}</div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Sending...
            </>
          ) : (
            <>
              <FaKey className="me-2" />
              Send Reset Link
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center mt-4">
        <Link to="/login" className="text-decoration-none fw-semibold">
          <FaArrowLeft className="me-2" />
          Back to Login
        </Link>
      </div>
    </>
  );
};
export default ForgotPassword;
