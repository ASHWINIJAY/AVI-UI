import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Container, Card, Modal, Button, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function WagonDashboardUploaded() {
  //   const BACKEND_URL = "http://41.87.206.94/AVIapi"; 
    const BACKEND_URL = "http://41.87.206.94/AVIapi"; // Adjust if different http://41.87.206.94/AVIapi
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [allRows, setAllRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showNoPdf, setShowNoPdf] = useState(false);
    const gridContainerRef = React.useRef(null);

    const getRowUniqueId = (row) => `${row.wagonNumber ?? "NA"}-${row.inspectorId ?? "NA"}-${row.dateAssessed ?? "NA"}-${row.timeAssessed ?? "NA"}`;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/Dashboard/getUploadedWagons`);
            const data = await res.json();
            setAllRows(data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const visibleRows = useMemo(() => allRows, [allRows]);

    const handleOpenModal = (photosValue) => {
        let photos = [];

        if (!photosValue || photosValue === "No Photos" || photosValue === "N/A") {
            photos = [];
        } else {
            try {
                if (typeof photosValue === "string") {
                    if (photosValue.trim().startsWith("[")) photos = JSON.parse(photosValue);
                    else photos = photosValue.split(",").map(p => p.trim());
                } else if (Array.isArray(photosValue)) photos = photosValue;
                else photos = [photosValue];

                photos = photos.filter(p => p && p !== "No Photos" && p !== "N/A");
            } catch {
                photos = [photosValue];
            }
        }

        setModalPhotos(photos);
        setShowModal(true);
    };

    const handleOpenPdf = (pdfPath) => {
        if (!pdfPath || pdfPath === "N/A" || pdfPath === "No File" || pdfPath === "Not Ready") {
            setPdfUrl(null);
            setShowPdfModal(false);
            setShowNoPdf(true);
            return;
        }

        const fullUrl = pdfPath.startsWith("http") ? pdfPath : `${BACKEND_URL}/${pdfPath}`;
        setPdfUrl(fullUrl);
        setShowPdfModal(true);
    };

    const renderImageCell = (value, alt) => {
        if (!value || value === "N/A") return <span>N/A</span>;
        const url = value.startsWith("http") ? value : `${BACKEND_URL}${value}`;
        return <img src={url} alt={alt} style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }} />;
    };

    const handleExportToExcel = async () => {
        const rowsToExport = visibleRows;

        if (!rowsToExport.length) {
            alert("No rows to export.");
            return;
        }

        setLoading(true);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Wagon Dashboard");

        const headers = [
            "Wagon Number",
            "Wagon Group",
            "Wagon Type",
            "Inspector",
            "Date Completed",
            "Time Completed",
            "Time Started",
            "Gps Latitude",
            "Gps Longitude",
            "Lift Date",
            "Lift Lapsed",
            "Barrel Test Date",
            "Barrel Lapsed",
            "Brake Test Date",
            "Brake Lapsed",
            "Refurbish Value",
            "Missing Value",
            "Replace Value",
            "Labor Value",
            "Replacement Value",
            "Asset Value",
            "Upload Status",
            "Upload Date"
        ];

        worksheet.addRow(headers);

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: "thick" },
                left: { style: "thick" },
                bottom: { style: "thick" },
                right: { style: "thick" }
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        rowsToExport.forEach((row) => {
            worksheet.addRow([
                row.wagonNumber,
                row.wagonGroup,
                row.wagonType,
                row.inspectorName,
                row.dateAssessed,
                row.timeAssessed,
                row.startTimeInspect,
                row.gpsLatitude,
                row.gpsLongitude,
                row.liftDate,
                row.liftLapsed,
                row.barrelDate,
                row.barrelLapsed,
                row.brakeDate,
                row.brakeLapsed,
                row.refurbishValue,
                row.missingValue,
                row.replaceValue,
                row.totalLaborValue,
                row.replacementValue,
                row.assetValue,
                row.uploadStatus,
                row.uploadDate
            ]);
        });

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

        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellLength = cell.value ? cell.value.toString().length : 10;
                if (cellLength > maxLength) maxLength = cellLength;
            });
            column.width = maxLength + 5;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, `WagonDashboardUploaded_${new Date().toISOString().split("T")[0]}.xlsx`);

        setLoading(false);
    };

    const columns = useMemo(() => ([
        { field: "wagonNumber", headerName: "Wagon Number", width: 130 },
        { field: "wagonGroup", headerName: "Wagon Group", width: 130 },
        { field: "wagonType", headerName: "Wagon Type", width: 150 },
        { field: "inspectorName", headerName: "Inspector", width: 150 },
        { field: "dateAssessed", headerName: "Date Completed", width: 110 },
        { field: "timeAssessed", headerName: "Time Completed", width: 110 },
        { field: "startTimeInspect", headerName: "Time Started", width: 110 },
        { field: "gpsLatitude", headerName: "Gps Latitude", width: 130 },
        { field: "gpsLongitude", headerName: "Gps Longitude", width: 130 },
        { field: "bodyPhotos", headerName: "Body Photos", width: 150, renderCell: (params) => (<Button size="sm" onClick={() => handleOpenModal(params.value)}>View</Button>) },
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
        { field: "totalLaborValue", headerName: "Labor Value", width: 130 },
        { field: "replacementValue", headerName: "Replacement Value", width: 130 },
        { field: "assetValue", headerName: "Asset Value", width: 120 },
        { field: "assessmentQuote", headerName: "Assessment Quote", width: 180, renderCell: (params) => (params.value && params.value !== "N/A" ? (<Button size="sm" variant="outline-primary" onClick={() => handleOpenPdf(params.value)}>View PDF</Button>) : (<span>N/A</span>)) },
        { field: "assessmentCert", headerName: "Assessment Cert", width: 130, renderCell: (params) => (params.value && params.value !== "N/A" ? (<Button size="sm" variant="outline-primary" onClick={() => handleOpenPdf(params.value)}>View PDF</Button>) : (<span>N/A</span>)) },
        { field: "uploadStatus", headerName: "Upload Status", width: 130 },
        { field: "uploadDate", headerName: "Upload Date", width: 130 },
        { field: "wagonPhoto", headerName: "Wagon Photo", width: 150, renderCell: (params) => renderImageCell(params.value, "Wagon") },
        { field: "missingPhotos", headerName: "Missing Photos", width: 150, renderCell: (params) => (<Button size="sm" onClick={() => handleOpenModal(params.value)}>View</Button>) },
        { field: "replacePhotos", headerName: "Replace Photos", width: 150, renderCell: (params) => (<Button size="sm" onClick={() => handleOpenModal(params.value)}>View</Button>) },
        { field: "conditionScore", headerName: "Condition Score", width: 130 },
        { field: "operationalStatus", headerName: "Operational Status", width: 130 },
    ]), []);

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
                <Card.Header>Wagon Dashboard (Uploaded)</Card.Header>
                <Card.Body style={{ height: 600, width: "100%" }}>
                    <div className="d-flex justify-content-start mb-3">
                        <Button variant="success" size="sm" onClick={handleExportToExcel} style={{ marginRight: "10px" }}>
                            Export to Excel
                        </Button>
                    </div>
                    <div style={{ position: "relative" }} ref={gridContainerRef}>
                        <DataGrid
                            style={{ height: 530 }}
                            rows={visibleRows}
                            columns={columns}
                            getRowId={(row) => getRowUniqueId(row)}
                            paginationModel={{ pageSize, page }}
                            onPaginationModelChange={(model) => {
                                setPage(model.page);
                                setPageSize(model.pageSize);
                            }}
                            disableSelectionOnClick
                            showToolbar
                        />
                    </div>
                </Card.Body>
            </Card>

            {/* Photo Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Photos</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-wrap justify-content-center gap-2">
                    {modalPhotos.length > 0 ? (
                        modalPhotos.map((url, i) => {
                            const imageUrl = url.startsWith("http") ? url : `${BACKEND_URL}/${url}`;
                            return <img key={i} src={imageUrl} alt={`Photo ${i + 1}`} style={{ maxWidth: 200, maxHeight: 200, objectFit: "cover" }} />;
                        })
                    ) : (
                        <p>No Photos Available</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* PDF Modal */}
            <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Assessment Quote PDF</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: "80vh" }}>
                    {pdfUrl ? (
                        <iframe src={pdfUrl} title="Assessment Quote" style={{ width: "100%", height: "100%", border: "none" }} />
                    ) : (
                        <p>No PDF available</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPdfModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* No PDF Modal */}
            <Modal show={showNoPdf} onHide={() => setShowNoPdf(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>No PDF available</Modal.Title>
                </Modal.Header>
                <Modal.Body>There is no PDF available for this wagon.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNoPdf(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default WagonDashboardUploaded;