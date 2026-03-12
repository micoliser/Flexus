import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import UserFormModal from "./UserFormModal";

const getRolePill = (user) => {
  if (user.isDisabled)
    return <span className="admin-pill admin-pill-disabled">Disabled</span>;
  if (user.isAdmin)
    return <span className="admin-pill admin-pill-live">Admin</span>;
  if (user.isStaff)
    return <span className="admin-pill admin-pill-draft">Staff</span>;
  return <span className="admin-pill admin-pill-draft">User</span>;
};

const getUserId = (user) => user?.id || user?._id;

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load users.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAdd = () => {
    setEditUser(null);
    setIsUserFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setIsUserFormOpen(true);
  };

  const handleDisable = async (user) => {
    const verb = user.isDisabled ? "enable" : "disable";
    const userId = getUserId(user);

    if (!userId) {
      toast.error("Unable to identify user for this action.");
      return;
    }

    try {
      setIsDisabling(true);
      await api.patch(`/users/${userId}/disable`);
      toast.success(
        user.isDisabled
          ? `User ${user.emailAddress} enabled successfully.`
          : `User ${user.emailAddress} disabled successfully.`,
      );
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to ${verb} user.`,
      );
    } finally {
      setIsDisabling(false);
      setConfirmUser(null);
    }
  };

  const handleFormClose = () => {
    setIsUserFormOpen(false);
    setEditUser(null);
  };

  const handleFormSuccess = () => {
    setIsUserFormOpen(false);
    setEditUser(null);
    fetchUsers();
  };

  return (
    <section className="admin-panel-content">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">Users</h2>
        <button className="btn btn-brand-primary" onClick={handleOpenAdd}>
          Add User
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-head admin-users-grid">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Actions</span>
        </div>

        {isLoading && (
          <div className="admin-table-empty">Loading users...</div>
        )}

        {!isLoading && users.length === 0 && (
          <div className="admin-table-empty">No users found.</div>
        )}

        {!isLoading &&
          users.map((user) => (
            <div key={getUserId(user)} className="admin-table-row admin-users-grid">
              <span>
                {user.firstName} {user.lastName}
              </span>
              <span>{user.emailAddress}</span>
              {getRolePill(user)}
              <div className="admin-actions-group">
                <button
                  type="button"
                  className="admin-icon-btn"
                  title="Edit user"
                  aria-label="Edit user"
                  onClick={() => handleOpenEdit(user)}
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button
                  type="button"
                  className="admin-icon-btn admin-icon-btn-danger"
                  title={user.isDisabled ? "Enable user" : "Disable user"}
                  aria-label={user.isDisabled ? "Enable user" : "Disable user"}
                  onClick={() => setConfirmUser(user)}
                >
                  <i
                    className={`bi ${
                      user.isDisabled ? "bi-person-check" : "bi-person-x"
                    }`}
                  ></i>
                </button>
              </div>
            </div>
          ))}
      </div>

      <UserFormModal
        isOpen={isUserFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        user={editUser}
      />

      {confirmUser && (
        <div className="admin-modal-overlay" onClick={() => setConfirmUser(null)}>
          <div className="admin-modal-card admin-modal-card-sm" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Confirm Action</h3>
                <p className="admin-modal-subtitle">
                  Are you sure you want to {confirmUser.isDisabled ? "enable" : "disable"} user with email {confirmUser.emailAddress}?
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setConfirmUser(null)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="admin-confirm-actions">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setConfirmUser(null)}
                disabled={isDisabling}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDisable(confirmUser)}
                disabled={isDisabling}
              >
                {isDisabling
                  ? "Please wait..."
                  : confirmUser.isDisabled
                    ? "Yes, enable"
                    : "Yes, disable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsersPanel;
