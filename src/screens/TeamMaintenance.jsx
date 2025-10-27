import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import Select from "react-select";
import api from "../api/axios";
import Loader from "../components/Loader";

// ✅ Custom dropdown styles (readable)
const selectCustomStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: "#ced4da",
    minHeight: "42px",
    "&:hover": { borderColor: "#007bff" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0d6efd"
      : state.isFocused
      ? "#e7f1ff"
      : "#fff",
    color: state.isSelected ? "#fff" : "#000",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#e7f1ff",
    color: "#0d6efd",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#0d6efd",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#0d6efd",
    ":hover": { backgroundColor: "#0d6efd", color: "#fff" },
  }),
};

const TeamMaintenance = () => {
  const [teams, setTeams] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editForm, setEditForm] = useState({ teamName: "", inspectors: [] });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load all teams
  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get("teams/all");
      setTeams(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load all available inspectors
  const loadInspectors = async () => {
    try {
      const res = await api.get("teams/inspectors"); // show all, even assigned
      const list = res.data.map((i) => ({
        value: i.Id || i.id,
        label: i.Name || i.name,
      }));
      setInspectors(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTeams();
    loadInspectors();
  }, []);

  // ✅ Open Edit Modal
  const handleEdit = (team) => {
    setSelectedTeam(team);
    const assignedInspectors = team.inspectors?.map((ins) => ({
      value: ins.id || ins.Id,
      label: ins.name || ins.Name,
    })) || [];
    setEditForm({
      teamName: team.TeamName || team.teamName,
      inspectors: assignedInspectors,
    });
    setShowModal(true);
  };

  // ✅ Handle edit field change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // ✅ Handle inspector selection change
  const handleInspectorChange = (selected) => {
    setEditForm({ ...editForm, inspectors: selected || [] });
  };

  // ✅ Update team
  const handleUpdate = async () => {
    if (!editForm.teamName.trim()) return alert("Team name is required.");

    try {
      setLoading(true);
      const payload = {
        teamName: editForm.teamName,
        inspectorIds: editForm.inspectors.map((x) => x.value),
      };

      await api.post(`teams/update/${selectedTeam.teamID}`, payload);
      alert("Team updated successfully!");
      setShowModal(false);
      loadTeams();
    } catch (err) {
      console.error(err);
      alert("Failed to update team.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete team
  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await api.post(`teams/delete/${teamId}`);
      alert("Team deleted successfully!");
      loadTeams();
    } catch (err) {
      console.error(err);
      alert("Failed to delete team.");
    }
  };

  return (
    <>
      {loading && <Loader fullscreen />}
      <Container className="mt-4">
        <h3 className="mb-4 fw-bold text-center">Team Maintenance</h3>
        <Table striped bordered hover responsive>
  <thead>
    <tr>
      <th>#</th>
      <th>Team Name</th>
      <th>Inspectors</th>
      <th>Created Date</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {teams.length > 0 ? (
      teams.map((team, idx) => (
        <tr key={team.teamID || idx}>
          <td>{idx + 1}</td>
          <td>{team.teamName}</td>
          <td>
            {team.inspectors && team.inspectors.length > 0
              ? team.inspectors.map((i) => i.name).join(", ")
              : "—"}
          </td>
          <td>
            {new Date(team.createdDate).toLocaleDateString("en-GB")}
          </td>
          <td>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => handleEdit(team)}
            >
              Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDelete(team.teamID)}
            >
              Delete
            </Button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5" className="text-center text-muted">
          No teams found.
        </td>
      </tr>
    )}
  </tbody>
</Table>

      </Container>

      {/* ✅ Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                name="teamName"
                value={editForm.teamName}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Assign Inspectors</Form.Label>
              <Select
                isMulti
                value={editForm.inspectors}
                onChange={handleInspectorChange}
                options={inspectors}
                styles={selectCustomStyles}
                placeholder="Select Inspectors..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TeamMaintenance;
