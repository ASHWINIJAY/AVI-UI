import React, { useEffect, useState } from "react";
import { Container, Card, Modal, Button, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";

export default function WagonDashboard() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const BACKEND_URL = "https://avi-app.co.za/AVIapi"; // <-- Adjust if different

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/dashboard/getAllWagonDashboard`)
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
        { field: "wagonNumber", headerName: "Wagon Number", width: 130 },
        { field: "wagonGroup", headerName: "Wagon Group", width: 130 },
        { field: "wagonType", headerName: "Wagon Type", width: 150 },
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
        { field: "liftPhoto", headerName: "Lift Photo", width: 150, renderCell: (params) => renderImageCell(params.value, "Lift") },
        { field: "liftDate", headerName: "Lift Date", width: 110 },
        { field: "liftLapsed", headerName: "Lift Lapsed", width: 110 },
        { field: "barrelPhoto", headerName: "Barrel Photo", width: 150, renderCell: (params) => renderImageCell(params.value, "Barrel") },
        { field: "barrelDate", headerName: "Barrel Test Date", width: 110 },
        { field: "barrelLapsed", headerName: "Barrel Lapsed", width: 110 },
        { field: "brakePhoto", headerName: "Brake Photo", width: 150, renderCell: (params) => renderImageCell(params.value, "Brake") },
        { field: "brakeDate", headerName: "Brake Test Date", width: 110 },
        { field: "brakeLapsed", headerName: "Brake Lapsed", width: 110 },
        { field: "refurbishValue", headerName: "Refurbish Value", width: 130 },
        { field: "missingValue", headerName: "Missing Value", width: 130 },
        { field: "replaceValue", headerName: "Replace Value", width: 130 },
        { field: "assessmentQuote", headerName: "Assessment Quote", width: 130 },
        { field: "assessmentCert", headerName: "Assessment Cert", width: 130 },
        { field: "uploadStatus", headerName: "Upload Status", width: 130 },
        { field: "uploadDate", headerName: "Upload Date", width: 130 },
        { field: "wagonPhoto", headerName: "Wagon Photo", width: 150, renderCell: (params) => renderImageCell(params.value, "Wagon") },
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
            <Card className="mt-3" style={{marginBottom: "30px"}}>
                <Card.Header>Wagon Dashboard</Card.Header>
                <Card.Body style={{ height: 600, width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        disableSelectionOnClick
                        getRowId={(row) =>
                            `${row.wagonNumber ?? "NA"}-${row.inspectorId ?? "NA"}-${row.dateAssessed ?? "NA"}-${row.timeAssessed ?? "NA"}`
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
