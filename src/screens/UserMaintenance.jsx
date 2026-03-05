import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import api from "../api/axios";
import Loader from "../components/Loader";

const UserMaintenance = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [password, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const storedUserId = localStorage.getItem("userId") ?? "";
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/list"); // backend should return all users
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Edit user
  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setResetPassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };
const handleDelete = async (username) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    setLoading(true);

    await api.post("/auth/delete", username, {
  headers: { "Content-Type": "application/json" }
});

    alert("User deleted successfully");
    fetchUsers();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting user");
  } finally {
    setLoading(false);
  }
};
const handleActiveToggle = async (user) => {
  try {
    const updatedUser = {
      ...user,
      active: user.active === 1 ? 0 : 1
    };

    await api.post("/auth/update", updatedUser);

    fetchUsers();
  } catch (err) {
    console.error("Status update error:", err);
  }
};
  const handleUpdate = async () => {
    try {
      if (resetPassword) {
        if (!password || !confirmPassword) {
          alert("Please enter and confirm the new password.");
          return;
        }
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
        editingUser.userPassword = password;        
      }
      else{
        editingUser.userPassword = "";
      }
      editingUser.createdBy=storedUserId;
 setLoading(true);
      await api.post(`/auth/update`, editingUser);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Update error:", err);
    }
    finally{
       setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader fullscreen />}
      <div className="p-4">
        <h3>User Maintenance</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <Table bordered hover responsive>
            <thead>
  <tr>
    <th>ID</th>
    <th>Name</th>
    <th>Email</th>
    <th>Username</th>
    <th>Role</th>
    <th>Active</th>
    <th>Edit</th>
    <th>Delete</th>
  </tr>
</thead>
            <tbody>
  {users.length === 0 ? (
    <tr>
      <td colSpan="8" className="text-center">
        No users found
      </td>
    </tr>
  ) : (
    users.map((u) => (
      <tr key={u.userId}>
        <td>{u.userId}</td>
        <td>{u.name}</td>
        <td>{u.userEmail}</td>
        <td>{u.userName}</td>
        <td>{u.userRole}</td>

        {/* Active Toggle */}
       <td>
  {u.active === 1 ? (
    <span className="text-success fw-bold">Active</span>
  ) : (
    <span className="text-danger fw-bold">Inactive</span>
  )}
</td>

        {/* Edit */}
        <td>
          <Button
            size="sm"
            variant="warning"
            onClick={() => handleEdit(u)}
          >
            Edit
          </Button>
        </td>

        {/* Delete */}
        <td>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(u.userName)}
          >
            Delete
          </Button>
        </td>
      </tr>
    ))
  )}
</tbody>
          </Table>
          </div>
        )}

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingUser && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={editingUser.name}
                    onChange={handleEditChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="userEmail"
                    value={editingUser.userEmail}
                    onChange={handleEditChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="userRole"
                    value={editingUser.userRole}
                    onChange={handleEditChange}
                  >
                    <option value="Super User">Super User</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Assessor">Assessor</option>
                    <option value="Asset Monitor">Asset Monitor</option>
                  </Form.Select>
                </Form.Group>
<Form.Group className="mb-3">
  <Form.Label>Status</Form.Label>
  <Form.Check
    type="switch"
    label={editingUser?.active === 1 ? "Active" : "Inactive"}
    name="active"
    checked={editingUser?.active === 1}
    onChange={(e) =>
      setEditingUser((prev) => ({
        ...prev,
        active: e.target.checked ? 1 : 0
      }))
    }
  />
</Form.Group>
                {/* Reset Password Checkbox */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Reset Password"
                    checked={resetPassword}
                    onChange={(e) => setResetPassword(e.target.checked)}
                  />
                </Form.Group>

                {/* Password Fields */}
                {resetPassword && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default UserMaintenance;
