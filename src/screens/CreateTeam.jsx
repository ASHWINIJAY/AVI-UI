import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "../api/axios";
import Loader from "../components/Loader";

// ✅ Custom dropdown style (fully readable)
const selectCustomStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: state.isFocused ? "#007bff" : "#ced4da",
    boxShadow: state.isFocused
      ? "0 0 0 0.25rem rgba(13,110,253,.25)"
      : "none",
    minHeight: "42px",
    "&:hover": { borderColor: "#007bff" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#fff",
    zIndex: 9999,
    border: "1px solid #dee2e6",
    borderRadius: "0.25rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0d6efd" // bright blue
      : state.isFocused
      ? "#e7f1ff" // light blue hover
      : "#ffffff", // white otherwise
    color: state.isSelected ? "#ffffff" : "#000000",
    fontWeight: state.isSelected ? 600 : 400,
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#e7f1ff",
    color: "#0d6efd",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#0d6efd",
    fontWeight: 500,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#0d6efd",
    ":hover": { backgroundColor: "#0d6efd", color: "#fff" },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6c757d",
  }),
  input: (base) => ({
    ...base,
    color: "#000",
  }),
};

const CreateTeam = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    inspectors: [],
  });

  const [inspectorsList, setInspectorsList] = useState([]);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch available inspectors (not assigned to any team)
  useEffect(() => {
    const fetchInspectors = async () => {
      try {
        setLoading(true);
        const res = await api.get("teams/available-inspectors"); // ✅ correct endpoint
        const options = res.data.map((inspector) => ({
          value: inspector.Id,
          label: inspector.Name,
        }));
        setInspectorsList(options);
      } catch (err) {
        console.error("Error fetching inspectors:", err);
        alert("Failed to load inspectors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInspectors();
  }, []);

  // ✅ Validate inputs
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Team Name is required";
    if (formData.inspectors.length === 0)
      newErrors.inspectors = "Please select at least one inspector";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle text field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle multi-select dropdown
  const handleInspectorsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      inspectors: selectedOptions || [],
    }));
  };

  // ✅ Confirm create
  const handleCreateClick = () => {
    if (validate()) setShowConfirm(true);
  };

  // ✅ Submit (Create team)
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setLoading(true);
const createdBy = localStorage.getItem("userId");
      const payload = {
        teamName: formData.name,
        createdBy: createdBy, // optional if needed
        inspectorIds: formData.inspectors.map((i) => i.value),
      };

      await api.post("teams/create", payload);
      alert("Team created successfully!");
      navigate("/master/welcome");
    } catch (err) {
      console.error("Team creation error:", err);
      const message =
        err.response?.data?.message ||
        "Error creating team. Please try again.";
      alert(message);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
      setLoading(false);
    }
  };

  // ✅ Cancel
  const handleCancel = () => navigate("/master/welcome");

  return (
    <>
      {loading && <Loader fullscreen />}
      <Container className="mt-5 d-flex justify-content-center">
        <Form
          className="p-4 border rounded shadow-sm"
          style={{ maxWidth: "500px", width: "100%", backgroundColor: "white" }}
          noValidate
        >
          <h3 className="text-center mb-4 fw-bold">Create New Team</h3>

          {/* Team Name */}
          <Form.Group className="mb-3">
            <Form.Label>Team Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Inspectors Multi-Select */}
          <Form.Group className="mb-3">
            <Form.Label>Select Inspectors</Form.Label>
            <Select
              isMulti
              name="inspectors"
              value={formData.inspectors}
              onChange={handleInspectorsChange}
              options={inspectorsList}
              classNamePrefix="select"
              placeholder="Choose Inspectors..."
              isDisabled={loading}
              styles={selectCustomStyles}
            />
            {errors.inspectors && (
              <div className="text-danger mt-1">{errors.inspectors}</div>
            )}
          </Form.Group>

          {/* Buttons */}
          <Row className="mt-4">
            <Col>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
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

        {/* Confirmation Modal */}
        <Modal
          show={showConfirm}
          onHide={() => !submitting && setShowConfirm(false)}
          centered
        >
          <Modal.Header closeButton={!submitting}>
            <Modal.Title>Confirm Team Creation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to create this new team?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Yes, Create"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default CreateTeam;
