import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Container, Card, Modal, Button, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import ExcelJS from "exceljs"; // npm i exceljs
import { saveAs } from "file-saver"; // npm i file-saver

export default function UploadedLocoDashboard() {
    const BACKEND_URL = "http://41.87.206.94/AVIapi";
//const BACKEND_URL = "http://41.87.206.94/AVIapi";
     const [page, setPage] = useState(0); 
        const [pageSize, setPageSize] = useState(100);  
        const [allRows, setAllRows] = useState([]); 
        const [selectionModel, setSelectionModel] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showNoPdf, setShowNoPdf] = useState(false);

    // selection (stores backend id values)
     const selectedIds = useMemo(() => new Set(selectionModel), [selectionModel]);
    const [showNoSelectModal, setShowNoSelectModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [uploading, setUploading] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false); //PLEASE ADD
    // scroll preservation
  const scrollPosRef = useRef(0); 
  
      const gridContainerRef = useRef(null); 
const getRowUniqueId = (row) => `${row.locoNumber ?? "NA"}-${row.inspectorId ?? "NA"}-${row.dateAssessed ?? "NA"}-${row.timeAssessed ?? "NA"}`;

    // Fetch data from backend
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/Dashboard/getUploadedLocoDashboard`);
            if (!res.ok) {
                const t = await res.text();
                throw new Error(`Fetch failed ${res.status}: ${t}`);
            }
            const data = await res.json();
            // Ensure array
            setAllRows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setAllRows([]);
        } finally {
            setLoading(false);
            handleRestoreScroll();
        }
    }, [BACKEND_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // visibleRows shown in grid (exclude uploaded)
    const visibleRows = useMemo(() => {
        return allRows.filter(r => r.uploadStatus === "Uploaded");
    }, [allRows]);

    // Helpers for scroll
    const handleSaveScroll = () => {
        if (gridContainerRef.current) {
            const viewport = gridContainerRef.current.querySelector(".MuiDataGrid-virtualScroller");
            if (viewport) scrollPosRef.current = viewport.scrollTop;
        }
    };
    const handleRestoreScroll = () => {
        setTimeout(() => {
            if (gridContainerRef.current) {
                const viewport = gridContainerRef.current.querySelector(".MuiDataGrid-virtualScroller");
                if (viewport) viewport.scrollTop = scrollPosRef.current;
            }
        }, 50);
    };

    // Modal handlers
    const handleOpenModal = (photosValue) => {
        let photos = [];

        if (!photosValue || photosValue === "No Photos" || photosValue === "N/A") {
            photos = [];
        } else {
            try {
                let parsed = typeof photosValue === "string" ? JSON.parse(photosValue) : photosValue;
                if (!Array.isArray(parsed)) parsed = [parsed];
                photos = parsed.filter(p => p && p !== "No Photos" && p !== "N/A");
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

        // Prepend BACKEND_URL if needed
        const fullUrl = pdfPath.startsWith("http") ? pdfPath : `${BACKEND_URL}/${pdfPath}`;
        setPdfUrl(fullUrl);
        setShowPdfModal(true);
    };
    const renderImageCell = (value, alt) => {
        if (!value || value === "N/A") return <span>N/A</span>;
        const url = value.startsWith("http") ? value : `${BACKEND_URL}/${value}`;
        return <img src={url} alt={alt} style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }} />;
    };

    // Selection helpers (store backend id values)
  const clearSelection = () => setSelectionModel([]); //PLEASE ADJUST

    // Build payload for upload from selected backend ids
    const buildUploadPayload = () => {
        const selectedRows = allRows.filter(r => selectedIds.has(getRowUniqueId(r))); //PLEASE ADJUST
        return selectedRows.map(r => ({
            locoNumber: r.locoNumber ?? r.wagonNumber ?? null,
            bodyPhotos: r.bodyPhotos ?? null,
            assessmentQuote: r.assessmentQuote ?? null,
            locoPhoto: r.locoPhoto ?? null,
            missingPhotos: r.missingPhotos ?? null,
            replacePhotos: r.replacePhotos ?? null
        }));
    };

    const handleUploadConfirmed = async () => {
        const payload = buildUploadPayload();
        if (!payload || payload.length === 0) {
            setShowNoSelectModal(true);
            return;
        }

        handleSaveScroll();
        setShowConfirmModal(false);
        setUploading(true);

        try {
            const resp = await fetch(`${BACKEND_URL}/api/Dashboard/uploadLocos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Server error: ${resp.status} - ${text}`);
            }

            const result = await resp.json?.();
            console.log("Upload successful:", result);

            setShowSuccessModal(true); //PLEASE ADD

            // Refresh dashboard data and clear selection
            await fetchData();
            clearSelection();
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed: " + (err.message || "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    // Export ALL rows to Excel (you asked for "Export all rows")
    const handleExportToExcel = async () => {
        const rowsToExport = allRows; // <-- Export ALL rows

        if (!rowsToExport || rowsToExport.length === 0) {
            alert("No data to export.");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Loco Dashboard");

        const headers = [
            "Loco Number",
            "Loco Class",
            "Loco Model",
            "Inspector",
            "Date",
            "Time Completed",
            "Time Started",
            "Gps Latitude",
            "Gps Longitude",
            "Refurbish Value",
            "Missing Value",
            "Replace Value",
            "Asset Value",
            "Market Value",
            "Total Value",
            "Condition Score",
            "Operational Status",
            "Upload Status",
            "Upload Date"
        ];

        worksheet.addRow(headers);

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
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE8E8E8" }
            };
        });

        rowsToExport.forEach((row) => {
            worksheet.addRow([
                row.locoNumber ?? row.wagonNumber ?? "",
                row.locoClass ?? "",
                row.locoModel ?? "",
                row.inspectorName ?? row.inspector ?? "",
                row.dateAssessed ?? "",
                row.timeAssessed ?? "",
                row.startTimeInspect ?? "",
                row.gpsLatitude ?? "",
                row.gpsLongitude ?? "",
                row.refurbishValue ?? "",
                row.missingValue ?? "",
                row.replaceValue ?? "",
                row.assetValue ?? "",
                row.marketValue ?? "",
                row.totalValue ?? "",
                row.conditionScore ?? "",
                row.operationalStatus ?? "",
                row.uploadStatus ?? "",
                row.uploadDate ?? ""
            ]);
        });

        worksheet.eachRow((r) => {
            r.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
                cell.alignment = { vertical: "middle", horizontal: "center" };
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
        saveAs(blob, `LocoDashboard_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const columns = useMemo(() => ([       
        { field: "locoNumber", headerName: "Loco Number", width: 130 },
        { field: "locoClass", headerName: "Loco Class", width: 130 },
        { field: "locoModel", headerName: "Loco Model", width: 150 },
        { field: "inspectorName", headerName: "Inspector", width: 150 },
        { field: "dateAssessed", headerName: "Date Completed", width: 110 },
        { field: "timeAssessed", headerName: "Time Completed", width: 110 },
        { field: "startTimeInspect", headerName: "Time Started", width: 110 },
        { field: "gpsLatitude", headerName: "Gps Latitude", width: 130 },
        { field: "gpsLongitude", headerName: "Gps Longitude", width: 130 },
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
        { field: "totalLaborValue", headerName: "Labor Value", width: 130 },
        { field: "totalValue", headerName: "Total Value", width: 130 },
        { field: "marketValue", headerName: "Market Value", width: 130 },
        { field: "assetValue", headerName: "Asset Value", width: 120 },
        
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
         {
                    field: "assessmentCert",
                    headerName: "Assessment Cert",
                    width: 130,
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
                {
                    field: "assessmentSow",
                    headerName: "Assessment SOW",
                    width: 130,
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
        { field: "uploadStatus", headerName: "Loco Status", width: 130 },
        { field: "uploadDate", headerName: "Upload Date", width: 130 },
         { field: "conditionScore", headerName: "Condition Score", width: 130 },
        { field: "operationalStatus", headerName: "Operational Status", width: 130 },
    ]), [selectionModel]);

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
                    <div className="d-flex justify-content-start mb-3">
                        <Button variant="success" size="sm" onClick={handleExportToExcel} style={{ marginRight: "10px" }}>
                            Export to Excel (All Rows)
                        </Button>

                        

                        <div style={{ marginLeft: 12, alignSelf: "center" }}>
                            {selectedIds.size > 0 ? `${selectedIds.size} selected` : ""}
                        </div>
                    </div>

                    <div style={{ position: "relative" }} ref={gridContainerRef}>
                        {uploading && (
                            <div style={{
                                position: "absolute",
                                zIndex: 10,
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(255,255,255,0.6)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Spinner animation="border" />
                            </div>
                        )}

                       
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
                                                   disableRowSelectionOnClick
                                                   selectionModel={selectionModel} //PLEASE ADD
                                                   onRowClick={(params) => {
                                                       const id = getRowUniqueId(params.row);
                                                       setSelectionModel(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                                                   }}
                                                   sx={{
                                                       "& .Mui-selected": { backgroundColor: "rgba(0, 123, 255, 0.2)", "&:hover": { backgroundColor: "rgba(0, 123, 255, 0.25)" } },
                                                       cursor: "pointer"
                                                   }}
                                                   showToolbar //PLEASE ADD
                                               />
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Photos</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-wrap justify-content-center gap-2">
                    {modalPhotos.length > 0 ? (
                        modalPhotos.map((url, i) => {
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

            <Modal show={showNoPdf} onHide={() => setShowNoPdf(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>No PDF available</Modal.Title>
                </Modal.Header>
                <Modal.Body>There is no PDF available for this loco.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNoPdf(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
 <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    The selected wagon dashboard items have been successfully uploaded.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowSuccessModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showNoSelectModal} onHide={() => setShowNoSelectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>No items selected</Modal.Title>
                </Modal.Header>
                <Modal.Body>Please select one or more items in the grid to upload.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNoSelectModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Upload</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to upload the selected item(s)?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>No</Button>
                    <Button variant="primary" onClick={handleUploadConfirmed}>Yes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
