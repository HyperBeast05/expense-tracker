import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { toast } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaRightFromBracket,
} from "react-icons/fa6";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });

  const password = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  const onSubmit = async (data) => {
    try {
      if (!token) {
        toast.error("Invalid password reset link. Please request a new one.");
        return;
      }

      const response = await resetPassword(token, data.newPassword);

      if (response.success) {
        toast.success("Password reset successfully! Please login.");
        navigate("/login");
      } else {
        toast.error(response.message || "Unable to reset password");
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
            "Unable to reset password. Please try again.",
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

        <h2 className="fw-bold mb-2">Reset Password</h2>

        <p className="text-muted mb-0">
          Create a new password for your account.
        </p>
      </div>

      {!token ? (
        <div className="text-center">
          <div className="alert alert-danger">
            This password reset link is invalid or missing
          </div>

          <Link to="/forgot-password" className="btn btn-primary fw-semibold">
            Request New Link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* New Password */}
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label fw-semibold">
              <FaLock className="me-2" />
              New Password
            </label>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                placeholder="Enter your new password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  maxLength: {
                    value: 128,
                    message: "Password cannot exceed 128 characters",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                    message:
                      "Password must contain uppercase, lowercase, number, and special character.",
                  },
                  deps: "confirmPassword",
                })}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.newPassword && (
              <div className="text-danger small mt-1">
                {errors.newPassword.message}
              </div>
            )}
          </div>

          {/* Password Requirement */}
          <div className="small text-muted mb-3">
            Password must contain at least 8 characters, including uppercase,
            lowercase, number and special character.
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label fw-semibold">
              <FaLock className="me-2" />
              Confirm New Password
            </label>

            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                placeholder="Confirm your new password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "passwords do not match",
                })}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.confirmPassword && (
              <div className="text-danger small mt-1">
                {errors.confirmPassword.message}
              </div>
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
                Resetting Password...
              </>
            ) : (
              <>
                <FaKey className="me-2" />
                Reset Password
              </>
            )}
          </button>
        </form>
      )}

      {/* Login */}
      <div className="text-center mt-4">
        <Link to="/login" className="text-decoration-none fw-semibold">
          <FaRightFromBracket className="me-2" />
          Back to Login
        </Link>
      </div>
    </>
  );
};
export default ResetPassword;
