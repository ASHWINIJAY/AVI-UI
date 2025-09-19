import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Image, Form, Card } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import api from "../api/axios";

const DashBoardItems = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoList, setPhotoList] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchDashboardData();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("DashBoardItems");
      setDashboardData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching dashboard items:", err);
      setDashboardData([]);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const openPhotoModal = (photos, title) => {
    if (!photos) {
      setPhotoList([]);
      setModalTitle(title);
      setSelectedPhotoIndex(null);
      setShowPhotoModal(true);
      return;
    }

    let list = Array.isArray(photos) ? photos.flatMap(p => p.split(";")) : photos.split(";");
    list = list.filter(Boolean).map(p => p.replace(/\\/g, "/"));
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const formatted = list.map(p => (p.startsWith("uploads/") ? baseUrl + p : baseUrl + "uploads/" + p));

    setPhotoList(formatted);
    setModalTitle(title);
    setSelectedPhotoIndex(null);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhotoIndex(null);
  };

  const showPrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  };

  const showNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
  };

  const filteredData = dashboardData.filter(item => {
    const locoNumber = item?.locoNumber ?? "";
    const inspectorName = (item?.inspectorName ?? "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return locoNumber.toString().includes(search) || inspectorName.includes(search);
  });

  const columns = [
    { field: "record", headerName: "Record", flex: 1, minWidth: 80 },
    { field: "locoNumber", headerName: "Loco No.", flex: 1, minWidth: 100 },
    { field: "dateAssessed", headerName: "Date Assessed", flex: 1, minWidth: 120 },
    { field: "timeAssessed", headerName: "Time Assessed", flex: 1, minWidth: 100 },
    { field: "inspectorName", headerName: "Inspector Name", flex: 1, minWidth: 120 },
    { field: "proMain", headerName: "Program Maintenance", flex: 1, minWidth: 120 },
    { field: "bodyDamage", headerName: "Body Damage", flex: 1, minWidth: 100 },
    { field: "bodyRepairValue", headerName: "Body Repair Value", flex: 1, minWidth: 120 },
    { field: "replaceValue", headerName: "Replace Value", flex: 1, minWidth: 120 },
    { field: "refurbishValue", headerName: "Refurbish Value", flex: 1, minWidth: 120 },
    { field: "liftingRequired", headerName: "Lifting Required", flex: 1, minWidth: 120 },
    {
      field: "bodyPhotos",
      headerName: "Body Photos",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Button size="sm" onClick={() => openPhotoModal(params.row.bodyPhotos, "Body Photos")}>View</Button>
      ),
    },
    {
      field: "liftPhotos",
      headerName: "Lift Photos",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Button size="sm" onClick={() => openPhotoModal(params.row.liftPhotos, "Lift Photos")}>View</Button>
      ),
    },
    {
      field: "assessmentPhotos",
      headerName: "Assessment Photos",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Button size="sm" onClick={() => openPhotoModal(params.row.assessmentPhotos, "Assessment Photos")}>View</Button>
      ),
    },
    { field: "assessmentResults", headerName: "Results", flex: 1, minWidth: 100 },
    { field: "assessmentQuote", headerName: "Quote", flex: 1, minWidth: 100 },
    { field: "assessmentCert", headerName: "Certificate", flex: 1, minWidth: 120 },
    { field: "uploadStatus", headerName: "Upload Status", flex: 1, minWidth: 120 },
    { field: "uploadDate", headerName: "Upload Date", flex: 1, minWidth: 120 },
  ];

  return (
    <Container fluid className="p-3 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Dashboard Heading */}
      <Row className="mb-3">
        <Col xs="12" className="text-center">
          <h3 className="text-white fw-bold">Dashboard</h3>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-3">
        <Col xs="12" className="d-flex justify-content-center">
          <Form.Control
            type="text"
            placeholder="Search by LocoNumber or Inspector Name"
            value={searchTerm}
            onChange={handleSearch}
            style={{ maxWidth: "400px", width: "100%" }}
          />
        </Col>
      </Row>

      {/* Responsive Data */}
      {!isMobile ? (
        <Row>
          <Col xs="12" style={{ overflowX: "auto" }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              getRowId={(row) => row.record}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection
              disableSelectionOnClick
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f0f2f5",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  lineHeight: "1.2",
                },
              }}
            />
          </Col>
        </Row>
      ) : (
        <Row className="g-3">
          {filteredData.map((row) => (
            <Col xs="12" key={row.record}>
              <Card className="shadow-sm rounded-3 hover-shadow" style={{ transition: "0.3s" }}>
                <Card.Body>
                  <Card.Title className="mb-2 fw-bold">{row.locoNumber}</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">{row.inspectorName}</Card.Subtitle>
                  <Card.Text className="mb-2" style={{ lineHeight: "1.5" }}>
                    <strong>Date:</strong> {row.dateAssessed} <br />
                    <strong>Time:</strong> {row.timeAssessed} <br />
                    <strong>Program Maintenance:</strong> {row.proMain} <br />
                    <strong>Body Damage:</strong> {row.bodyDamage} <br />
                    <strong>Body Repair Value:</strong> {row.bodyRepairValue} <br />
                    <strong>Replace Value:</strong> {row.replaceValue} <br />
                    <strong>Refurbish Value:</strong> {row.refurbishValue} <br />
                    <strong>Lifting Required:</strong> {row.liftingRequired} <br />
                    <strong>Results:</strong> {row.assessmentResults} <br />
                    <strong>Quote:</strong> {row.assessmentQuote} <br />
                    <strong>Certificate:</strong> {row.assessmentCert} <br />
                    <strong>Upload Status:</strong> {row.uploadStatus} <br />
                    <strong>Upload Date:</strong> {row.uploadDate} <br />
                  </Card.Text>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {row.bodyPhotos && <Button size="sm" variant="outline-primary" onClick={() => openPhotoModal(row.bodyPhotos, "Body Photos")}>Body Photos</Button>}
                    {row.liftPhotos && <Button size="sm" variant="outline-primary" onClick={() => openPhotoModal(row.liftPhotos, "Lift Photos")}>Lift Photos</Button>}
                    {row.assessmentPhotos && <Button size="sm" variant="outline-primary" onClick={() => openPhotoModal(row.assessmentPhotos, "Assessment Photos")}>Assessment Photos</Button>}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Action Buttons */}
      <Row className="mt-3 mb-3">
        <Col xs="12" className="d-flex justify-content-start flex-wrap gap-2">
          <Button variant="primary">Upload</Button>
          <Button
            variant="success"
            onClick={() => {
              localStorage.removeItem("locoNumber");
              window.location.href = "/landing";
            }}
          >
            Start New Inspection
          </Button>
        </Col>
      </Row>

      {/* Photo Modal (Lightbox) */}
      <Modal show={showPhotoModal} onHide={closePhotoModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {photoList.length === 0 ? (
            <p>No Photos</p>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="outline-secondary" onClick={showPrevPhoto}>&larr; Prev</Button>
                <Button variant="outline-secondary" onClick={showNextPhoto}>Next &rarr;</Button>
              </div>
              <Image
                src={selectedPhotoIndex === null ? photoList[0] : photoList[selectedPhotoIndex]}
                fluid
                rounded
                style={{ maxHeight: "70vh", objectFit: "contain" }}
                onClick={() => {
                  if (selectedPhotoIndex === null) setSelectedPhotoIndex(0);
                }}
              />
            </>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </Container>
  );
};

export default DashBoardItems;
