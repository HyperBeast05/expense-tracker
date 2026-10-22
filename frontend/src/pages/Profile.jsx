import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaPenToSquare,
  FaShieldHalved,
  FaUser,
} from "react-icons/fa6";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

const Profile = () => {
  const { user, checkAuth } = useAuth();

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(null);

  const profileUser = updatedUser || user;

  const handleProfileUpdated = async (updatedProfile) => {
    setUpdatedUser(updatedProfile);
    await checkAuth({ showLoading: false });
  };

  if (!profileUser) {
    return (
      <div className="container py-5 text-center">
        <h4>Unable to load profile</h4>
        <p className="text-muted">Please log in again to view your profile.</p>

        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  const initials = (profileUser.name || "U")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/dashboard"
          className="btn btn-outline-secondary"
          aria-label="Back to dashboard"
        >
          <FaArrowLeft />
        </Link>

        <div>
          <h2 className="fw-bold mb-1">My Profile</h2>
          <p className="text-muted mb-0">
            Manage your account details and security.
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4 p-md-5">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: 100,
                  height: 100,
                  fontSize: "2rem",
                  fontWeight: 700,
                }}
                aria-label={`Profile initials ${initials}`}
              >
                {initials}
              </div>

              <h4 className="fw-bold mb-1">{profileUser.name}</h4>

              <p className="text-muted text-break mb-3">{profileUser.email}</p>

              <span className="badge text-bg-success">
                <FaShieldHalved className="me-1" />
                Account active
              </span>

              <hr className="my-4" />

              <button
                type="button"
                className="btn btn-primary w-100 mb-2"
                onClick={() => setShowEditProfileModal(true)}
              >
                <FaPenToSquare className="me-2" />
                Edit Profile
              </button>

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => setShowPasswordModal(true)}
              >
                <FaLock className="me-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Account Information</h5>

              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="d-flex gap-3">
                    <div className="text-primary fs-5">
                      <FaUser />
                    </div>

                    <div>
                      <div className="text-muted small mb-1">Full name</div>
                      <div className="fw-semibold text-break">
                        {profileUser.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="d-flex gap-3">
                    <div className="text-primary fs-5">
                      <FaEnvelope />
                    </div>

                    <div>
                      <div className="text-muted small mb-1">Email address</div>
                      <div className="fw-semibold text-break">
                        {profileUser.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex gap-3">
                <div className="text-primary fs-3">
                  <FaShieldHalved />
                </div>

                <div>
                  <h5 className="fw-bold mb-2">Account Security</h5>

                  <p className="text-muted mb-3">
                    Protect your account with a strong, unique password.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        key={`${showEditProfileModal}-${user?.id ?? "no-user"}`}
        show={showEditProfileModal}
        onHide={() => setShowEditProfileModal(false)}
        user={profileUser}
        onUpdated={handleProfileUpdated}
      />

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default Profile;
