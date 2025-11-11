import React, { useEffect, useState } from "react";
import { Container, Card, Modal, Button, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import ExcelJS from "exceljs"; //npm install exceljs file-saver //PLEASE ADD
import { saveAs } from "file-saver"; //PLEASE ADD

export default function WagonDashboard() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null); //PLEASE ADD
    const [showPdfModal, setShowPdfModal] = useState(false); //PLEASE ADD

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

    //PLEASE ADD
    const handleOpenPdf = (pdfPath) => {
        if (!pdfPath || pdfPath === "N/A" || pdfPath === "No File") {
            alert("No PDF available for this wagon.");
            return;
        }

        // Prepend BACKEND_URL if needed
        const fullUrl = pdfPath.startsWith("http") ? pdfPath : `${BACKEND_URL}/${pdfPath}`;
        setPdfUrl(fullUrl);
        setShowPdfModal(true);
    };

    const renderImageCell = (value, alt) => {
        if (!value || value === "N/A") return <span>N/A</span>;
        const url = value.startsWith("http") ? value : `${BACKEND_URL}${value}`;
        return <img src={url} alt={alt} style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }} />;
    };

    //PLEASE ADD
    const handleExportToExcel = async () => {
        if (!rows || rows.length === 0) {
            alert("No data to export.");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Wagon Dashboard");

        // Add headers
        const headers = [
            "Wagon Number",
            "Wagon Group",
            "Wagon Type",
            "Inspector",
            "Date",
            "Time",
            "Lift Date",
            "Lift Lapsed",
            "Barrel Test Date",
            "Barrel Lapsed",
            "Brake Test Date",
            "Brake Lapsed",
            "Refurbish Value",
            "Missing Value",
            "Replace Value",
            "Upload Status",
            "Upload Date"
        ];

        worksheet.addRow(headers);

        // Make header row bold and add border
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Add data rows
        rows.forEach((row) => {
            worksheet.addRow([
                row.wagonNumber,
                row.wagonGroup,
                row.wagonType,
                row.inspectorName,
                row.dateAssessed,
                row.timeAssessed,
                row.liftDate,
                row.liftLapsed,
                row.barrelDate,
                row.barrelLapsed,
                row.brakeDate,
                row.brakeLapsed,
                row.refurbishValue,
                row.missingValue,
                row.replaceValue,
                row.uploadStatus,
                row.uploadDate
            ]);
        });

        // Add borders to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });
        });

        // Auto-width columns
        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellLength = cell.value ? cell.value.toString().length : 10;
                if (cellLength > maxLength) maxLength = cellLength;
            });
            column.width = maxLength + 5;
        });

        // Generate file and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, `WagonDashboard_${new Date().toISOString().split("T")[0]}.xlsx`);
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
        //PLEASE ADD
        {
            field: "assessmentQuote",
            headerName: "Assessment Quote",
            width: 180,
            renderCell: (params) => (
                params.value && params.value !== "N/A" ? (
                    <Button size="sm" variant="outline-primary" onClick={() => handleOpenPdf(params.value)}>
                        View PDF
                    </Button>
                ) : (
                    <span>N/A</span>
                )
            ),
        },
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
                    {/*PLEASE ADD*/}
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="success" size="sm" onClick={handleExportToExcel}>
                            Export to Excel
                        </Button>
                    </div>
                    <DataGrid
                        style={{height: 530}} //PLEASE ADD
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

            {/*PLEASE ADD*/}
            <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Assessment Quote PDF</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: "80vh" }}>
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="Assessment Quote"
                            style={{ width: "100%", height: "100%", border: "none" }}
                        />
                    ) : (
                        <p>No PDF available</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPdfModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
