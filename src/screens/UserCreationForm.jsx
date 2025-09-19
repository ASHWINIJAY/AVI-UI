import React, { useState } from "react";
import { Container, Form, Row, Col, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const UserCreationForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    userRole: "", // New field
  });

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    )
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.userRole) newErrors.userRole = "User Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateClick = () => {
    if (validate()) {
      setShowConfirm(true);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/auth/create", formData); // Adjust API endpoint
      alert("User created successfully!");
      navigate("/master/dashboard");
    } catch (err) {
      console.error("User creation error:", err);
      const message =
      err.response?.data?.message || "Error creating user. Please try again.";

    alert(message);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => navigate("/master/dashboard");

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Form
        className="p-4 border rounded shadow-sm"
        style={{ maxWidth: "500px", width: "100%", backgroundColor: "white" }}
        noValidate
      >
        <h3 className="text-center mb-4" style={{ fontWeight: "bold" }}>
          Create New User
        </h3>

        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            isInvalid={!!errors.username}
          />
          <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>User Role</Form.Label>
          <Form.Select
            name="userRole"
            value={formData.userRole}
            onChange={handleChange}
            isInvalid={!!errors.userRole}
          >
            <option value="">Select Role</option>
            <option value="Super User">Super User</option>
            <option value="Inspection">Inspection</option>
            <option value="Assessor">Assessor</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.userRole}</Form.Control.Feedback>
        </Form.Group>

        <Row className="mt-4">
          <Col>
            <Button variant="secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
          </Col>
          <Col className="text-end">
            <Button
              variant="primary"
              onClick={handleCreateClick}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </Col>
        </Row>
      </Form>

      <Modal show={showConfirm} onHide={() => !submitting && setShowConfirm(false)}>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>Confirm User Creation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to create this new user?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Yes, Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserCreationForm;
