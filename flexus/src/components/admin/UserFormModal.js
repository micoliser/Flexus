import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";

const initialUserForm = {
  firstName: "",
  lastName: "",
  emailAddress: "",
  password: "",
  isStaff: false,
  isAdmin: false,
};

const getUserId = (user) => user?.id || user?._id;

const UserFormModal = ({ isOpen, onClose, onSuccess, user = null }) => {
  const isEditMode = user !== null;
  const [formData, setFormData] = useState(initialUserForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    if (isEditMode) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        emailAddress: user.emailAddress || "",
        password: "",
        isStaff: user.isStaff || false,
        isAdmin: user.isAdmin || false,
      });
    } else {
      setFormData(initialUserForm);
    }
    setErrors({});

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isEditMode, user]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};

    if (!formData.firstName.trim())
      nextErrors.firstName = "This field is required.";
    if (!formData.lastName.trim())
      nextErrors.lastName = "This field is required.";
    if (!formData.emailAddress.trim()) {
      nextErrors.emailAddress = "This field is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.emailAddress.trim())) {
      nextErrors.emailAddress = "Enter a valid email address.";
    }

    if (!isEditMode && !formData.password.trim()) {
      nextErrors.password = "This field is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        const userId = getUserId(user);
        if (!userId) {
          toast.error("Unable to identify user for update.");
          return;
        }

        const payload = { ...formData };
        if (!payload.password.trim()) delete payload.password;
        await api.put(`/users/${userId}`, payload);
        toast.success("User updated successfully.");
      } else {
        await api.post("/users", formData);
        toast.success("User added successfully.");
      }
      onSuccess();
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      const fallback = isEditMode
        ? "Failed to update user. Please try again."
        : "Failed to add user. Please try again.";
      toast.error(serverMessage || fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-card admin-modal-card-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">{isEditMode ? "Edit User" : "Add User"}</h3>
            <p className="admin-modal-subtitle">
              {isEditMode
                ? "Update this user's information."
                : "Set up an admin or staff account."}
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group">
            <label htmlFor="user-firstName" className="admin-form-label">
              First Name *
            </label>
            <input
              id="user-firstName"
              name="firstName"
              className={`admin-form-control ${errors.firstName ? "is-invalid" : ""}`}
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Eg John"
            />
            {errors.firstName && (
              <p className="admin-form-error">{errors.firstName}</p>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="user-lastName" className="admin-form-label">
              Last Name *
            </label>
            <input
              id="user-lastName"
              name="lastName"
              className={`admin-form-control ${errors.lastName ? "is-invalid" : ""}`}
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Eg Doe"
            />
            {errors.lastName && (
              <p className="admin-form-error">{errors.lastName}</p>
            )}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="user-emailAddress" className="admin-form-label">
              Email Address *
            </label>
            <input
              id="user-emailAddress"
              type="email"
              name="emailAddress"
              className={`admin-form-control ${errors.emailAddress ? "is-invalid" : ""}`}
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="Eg john@example.com"
            />
            {errors.emailAddress && (
              <p className="admin-form-error">{errors.emailAddress}</p>
            )}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="user-password" className="admin-form-label">
              Password {isEditMode ? "(Optional)" : "*"}
            </label>
            <input
              id="user-password"
              type="password"
              name="password"
              className={`admin-form-control ${errors.password ? "is-invalid" : ""}`}
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditMode ? "Leave blank to keep current password" : "Eg Min 8 characters"}
            />
            {errors.password && (
              <p className="admin-form-error">{errors.password}</p>
            )}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label className="admin-form-label">Permissions</label>
            <div className="admin-checkbox-grid">
              <label className="admin-checkbox-card">
                <input
                  type="checkbox"
                  name="isStaff"
                  checked={formData.isStaff}
                  onChange={handleChange}
                />
                <span>Staff Access</span>
              </label>
              <label className="admin-checkbox-card">
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                />
                <span>Admin Access</span>
              </label>
            </div>
          </div>

          <div className="admin-form-actions admin-form-group-full">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-brand-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Save User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
