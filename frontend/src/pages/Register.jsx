import { useForm, useWatch } from "react-hook-form";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaUserPlus,
} from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { toast } from "react-toastify";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();

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
    name: "password",
    defaultValue: "",
  });

  const onSubmit = async (data) => {
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error) {
      const responseData = error.response?.data;

      //Hanlde backend validation errors
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        responseData.errors.forEach((error) => {
          toast.error(error.msg);
        });
      } else {
        toast.error(
          responseData?.message || "Unable to register. Please try again.",
        );
      }
    }
  };

  return (
    <>
      <div className="text-center mb-4">
        <div
          className="d-inline-flex   justify-content-center align-items-center bg-primary text-white rounded-circle mb-3"
          style={{ width: "56px", height: "56px" }}
        >
          <FaUserPlus size={22} />
        </div>

        <h2 className="fw-bold mb-2">Create Account</h2>
        <p className="text-muted mb-0">
          Start managing your money with Expense Tracker
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label fw-semibold">
            <FaUser className="me-2" />
            Name
          </label>

          <input
            type="text"
            id="name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Enter your name"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
              maxLength: {
                value: 100,
                message: "Name cannot exceed 100 characters",
              },
            })}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>

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
                required: "password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                maxLength: {
                  value: 128,
                  message: "Password cannot exceed 128 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                  message:
                    "Password must contain uppercase, lowercase, number, and special character",
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
          {errors.password?.message && (
            <div className="text-danger small mt-1">
              {errors.password.message}
            </div>
          )}
        </div>

        {/* Password Requirements */}
        <div className="small text-muted mb-3">
          Password must contain at least 8 characters, including uppercase,
          lowercase, number and special character.
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label fw-semibold">
            <FaLock className="me-2" />
            Confirm Password
          </label>

          <div className="input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
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
          {errors.confirmPassword?.message && (
            <div className="text-danger small mt-1">
              {errors.confirmPassword.message}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Creating Account...
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center mt-4">
        <span className="text-muted">Already have an account? </span>
        <Link to="/login" className="text-decoration-none fw-semibold">
          Login
        </Link>
      </div>
    </>
  );
};

export default Register;
