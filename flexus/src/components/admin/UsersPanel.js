import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import UserFormModal from "./UserFormModal";
import ConfirmModal from "./ConfirmModal";
import AdminTableSkeleton from "./AdminTableSkeleton";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (roleFilter && roleFilter !== "all") {
        params.role = roleFilter;
      }

      const { data } = await api.get("/users", { params });
      setUsers(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, roleFilter]);

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
      toast.error(error.response?.data?.message || `Failed to ${verb} user.`);
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
        <div className="admin-products-toolbar">
          <div className="admin-search-wrapper">
            <input
              type="text"
              className="admin-form-control"
              placeholder="Search by first or last name"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search users by name"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            className="admin-form-control"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter users by role"
          >
            <option value="all">All users</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div className="admin-table-head admin-users-grid">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Actions</span>
        </div>

        {isLoading && (
          <AdminTableSkeleton
            gridClass="admin-users-grid"
            columns={4}
            rows={6}
          />
        )}

        {!isLoading && users.length === 0 && (
          <div className="admin-table-empty">No users found.</div>
        )}

        {!isLoading &&
          users.map((user) => (
            <div
              key={getUserId(user)}
              className="admin-table-row admin-users-grid"
            >
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

      <ConfirmModal
        isOpen={!!confirmUser}
        title="Confirm Action"
        message={
          confirmUser
            ? `Are you sure you want to ${confirmUser.isDisabled ? "enable" : "disable"} user with email ${confirmUser.emailAddress}?`
            : ""
        }
        confirmLabel={confirmUser?.isDisabled ? "Yes, enable" : "Yes, disable"}
        loadingLabel={confirmUser?.isDisabled ? "Enabling..." : "Disabling..."}
        onConfirm={() => confirmUser && handleDisable(confirmUser)}
        onCancel={() => !isDisabling && setConfirmUser(null)}
        isLoading={isDisabling}
      />
    </section>
  );
};

export default UsersPanel;
