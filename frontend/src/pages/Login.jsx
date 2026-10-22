import { useForm } from "react-hook-form";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRightToBracket,
} from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await login(data.email, data.password);

      if (response.success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        responseData.errors.forEach((error) => {
          toast.error(error.msg);
        });
      } else {
        toast.error(
          responseData?.message || "Unable to login. Please try again.",
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
          <FaRightToBracket size={22} />
        </div>

        <h2 className="fw-bold mb-2">Welcome Back</h2>

        <p className="text-muted mb-0">Sign in to manage your expenses</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">
            <FaEnvelope className="me-2" />
            Email
          </label>

          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Enter your email"
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

        {/* Password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label fw-semibold">
            <FaLock className="me-2" />
            Password
          </label>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
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

          {errors.password && (
            <div className="invalid-feedback">{errors.password.message}</div>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-end mb-4">
          <Link
            to="/forgot-password"
            className="text-decoration-none fw-semibold"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
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
              Logging in...
            </>
          ) : (
            <>
              <FaRightToBracket className="me-2" />
              Login
            </>
          )}
        </button>
      </form>

      {/* Register */}
      <div className="text-center mt-4">
        <span className="text-muted">Don't have an account? </span>

        <Link to="/register" className="text-decoration-none fw-semibold">
          Create Account
        </Link>
      </div>
    </>
  );
};
export default Login;
