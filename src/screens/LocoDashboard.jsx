import React, { useEffect, useState } from "react";
import { Container, Card, Modal, Button, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";

export default function LocoDashboard() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const BACKEND_URL = "https://avi-app.co.za/AVIapi"; // <-- Adjust if different

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/Dashboard/getAllLocoDashboard`)
            .then((res) => res.json())
            .then((data) => {
                setRows(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching dashboard data:", err);
                setLoading(false);
            });
    }, []);

    const handleOpenModal = (photosValue) => {
        let photos = [];

        if (!photosValue || photosValue === "No Photos" || photosValue === "N/A") {
            photos = [];
        } else {
            try {
                let parsed = typeof photosValue === "string" ? JSON.parse(photosValue) : photosValue;
                if (!Array.isArray(parsed)) parsed = [parsed];

                // Filter out "No Photos" and empty strings
                photos = parsed.filter(p => p && p !== "No Photos" && p !== "N/A");
            } catch {
                // fallback if parsing fails
                photos = [photosValue];
            }
        }

        setModalPhotos(photos);
        setShowModal(true);
    };

    const renderImageCell = (value, alt) => {
        if (!value || value === "N/A") return <span>N/A</span>;
        const url = value.startsWith("http") ? value : `${BACKEND_URL}${value}`;
        return <img src={url} alt={alt} style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }} />;
    };

    const columns = [
        { field: "locoNumber", headerName: "Loco Number", width: 130 },
        { field: "locoClass", headerName: "Loco Class", width: 130 },
        { field: "locoModel", headerName: "Loco Model", width: 150 },
        { field: "inspectorName", headerName: "Inspector", width: 150 },
        { field: "dateAssessed", headerName: "Date", width: 110 },
        { field: "timeAssessed", headerName: "Time", width: 110 },
        {
            field: "bodyPhotos",
            headerName: "Body Photos",
            width: 150,
            renderCell: (params) => (
                <Button size="sm" onClick={() => handleOpenModal(params.value)}>View</Button>
            ),
        },
        { field: "locoPhoto", headerName: "Loco Photo", width: 150, renderCell: (params) => renderImageCell(params.value, "Locomotive") },
        { field: "refurbishValue", headerName: "Refurbish Value", width: 130 },
        { field: "missingValue", headerName: "Missing Value", width: 130 },
        { field: "replaceValue", headerName: "Replace Value", width: 130 },
        {
            field: "missingPhotos",
            headerName: "Missing Photos",
            width: 150,
            renderCell: (params) => (
                <Button size="sm" onClick={() => handleOpenModal(params.value)}>View</Button>
            ),
        },
        {
            field: "replacePhotos",
            headerName: "Replace Photos",
            width: 150,
            renderCell: (params) => (
                <Button size="sm" onClick={() => handleOpenModal(params.value)}>View</Button>
            ),
        },
        { field: "assessmentQuote", headerName: "Assessment Quote", width: 130 },
        { field: "assessmentCert", headerName: "Assessment Cert", width: 130 },
        { field: "uploadStatus", headerName: "Upload Status", width: 130 },
        { field: "uploadDate", headerName: "Upload Date", width: 130 },
    ];

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container fluid>
            <Card className="mt-3" style={{ marginBottom: "30px" }}>
                <Card.Header>Loco Dashboard</Card.Header>
                <Card.Body style={{ height: 600, width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        disableSelectionOnClick
                        getRowId={(row) =>
                            `${row.locoNumber ?? "NA"}-${row.inspectorId ?? "NA"}-${row.dateAssessed ?? "NA"}-${row.timeAssessed ?? "NA"}`
                        }
                    />
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Photos</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-wrap justify-content-center gap-2">
                    {modalPhotos.length > 0 ? (
                        modalPhotos.map((url, i) => {
                            // Prepend BACKEND_URL or window.location.origin but keep folder structure
                            const imageUrl = url.startsWith("http") ? url : `${BACKEND_URL}/${url}`;
                            return (
                                <img
                                    key={i}
                                    src={imageUrl}
                                    alt={`Photo ${i + 1}`}
                                    style={{ maxWidth: 200, maxHeight: 200, objectFit: "cover" }}
                                />
                            );
                        })
                    ) : (
                        <p>No Photos Available</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
