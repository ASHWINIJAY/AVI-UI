import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"; //PLEASE ADJUST
import { Container, Card, Modal, Button, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function WagonDashboard() {
    const BACKEND_URL = "https://avi-app.co.za/AVIapi"; // <-- Adjust if different

    const [page, setPage] = useState(0); //PLEASE ADD
    const [pageSize, setPageSize] = useState(100); //PLEASE ADD 

    const [allRows, setAllRows] = useState([]); //PLEASE ADD
    const [loading, setLoading] = useState(true);
    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);

    //PLEASE ADD
    const [showNoPdf, setShowNoPdf] = useState(false);

    //PLEASE ADD
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showNoSelectModal, setShowNoSelectModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Preserve scroll position
    const scrollPosRef = useRef(0); //PLEASE ADD

    const gridContainerRef = useRef(null); //PLEASE ADD

    //PLEASE ADD
    const getRowUniqueId = (row) => `${row.wagonNumber ?? "NA"}-${row.inspectorId ?? "NA"}-${row.dateAssessed ?? "NA"}-${row.timeAssessed ?? "NA"}`;

    //PLEASE ADD AND ADJUST
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllWagonDashboard`);
            const data = await res.json();
            setAllRows(data);
        }
        catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
        finally {
            setLoading(false);
            handleRestoreScroll();
        }
    }, []);

    //PLEASE ADJUST
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    //PLEASE ADD
    // Visible rows: filter only at render time
    const visibleRows = useMemo(() => {
        return allRows.filter(r => r.uploadStatus !== "Uploaded");
    }, [allRows]);

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

    //PLEASE ADD
    const handleOpenModal = (photosValue) => {
        let photos = [];

        if (!photosValue || photosValue === "No Photos" || photosValue === "N/A") {
            photos = [];
        } else {
            try {
                if (typeof photosValue === "string") {
                    // Attempt JSON parse
                    if (photosValue.trim().startsWith("[")) {
                        photos = JSON.parse(photosValue);
                    } else {
                        // Handle comma-separated string
                        photos = photosValue.split(",").map(p => p.trim());
                    }
                } else if (Array.isArray(photosValue)) {
                    photos = photosValue;
                } else {
                    photos = [photosValue];
                }

                // Filter out invalid entries
                photos = photos.filter(p => p && p !== "No Photos" && p !== "N/A");
            } catch {
                // Fallback: wrap original value
                photos = [photosValue];
            }
        }

        setModalPhotos(photos);
        setShowModal(true);
    };

    const handleOpenPdf = (pdfPath) => {
        if (!pdfPath || pdfPath === "N/A" || pdfPath === "No File" || pdfPath === "Not Ready") { //PLEASE ADJUST
            setPdfUrl(null); //PLEASE ADD
            setShowPdfModal(false); //PLEASE ADD
            setShowNoPdf(true); //PLEASE ADD
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

    const handleExportToExcel = async () => {
        const rowsToExport = visibleRows; //PLEASE ADD

        //PLEASE ADD
        if (!rowsToExport.length) {
            alert("No rows to export.");
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

        // Make header row bold and add border
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

        //PLEASE ADJUST
        // Add data rows
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

        // Add borders to all cells
        worksheet.eachRow((row, rowNumber) => { //DO NOT REMOVE rowNumber
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

    

    //PLEASE ADD
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const c = new Set(prev);
            if (c.has(id)) c.delete(id);
            else c.add(id);
            return c;
        });
    };

    //PLEASE ADD
    const clearSelection = () => setSelectedIds(new Set());

    //PLEASE ADD
    const buildUploadPayload = () => {
        const selectedRows = allRows.filter(r => selectedIds.has(getRowUniqueId(r)));
        return selectedRows.map(r => ({
            wagonNumber: r.wagonNumber,
            bodyPhotos: r.bodyPhotos,
            liftPhoto: r.liftPhoto,
            barrelPhoto: r.barrelPhoto,
            brakePhoto: r.brakePhoto,
            assessmentQuote: r.assessmentQuote,
            wagonPhoto: r.wagonPhoto,
            missingPhotos: r.missingPhotos,
            replacePhotos: r.replacePhotos
        }));
    };

    //PLEASE ADD
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
            const resp = await fetch(`${BACKEND_URL}/api/Dashboard/uploadWagons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Server error: ${resp.status} - ${text}`);
            }

            const blob = await resp.blob();
            let filename = `WagonDashboardUpload_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
            const cd = resp.headers.get("content-disposition");
            if (cd) {
                const match = /filename\*=UTF-8''(.+)$/.exec(cd) || /filename="(.+)"/.exec(cd);
                if (match) filename = decodeURIComponent(match[1]);
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            await fetchData();
            clearSelection();

        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed: " + (err.message || "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    //PLEASE ADD AND ADJUST
    const columns = useMemo(() => ([
        //PLEASE ADD
        {
            field: "select",
            headerName: "",
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                const id = getRowUniqueId(params.row);
                const checked = selectedIds.has(id);
                return (
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(id)}
                        aria-label={`Select wagon ${params.row.wagonNumber}`}
                    />
                );
            }
        },
        { field: "wagonNumber", headerName: "Wagon Number", width: 130 },
        { field: "wagonGroup", headerName: "Wagon Group", width: 130 },
        { field: "wagonType", headerName: "Wagon Type", width: 150 },
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
    ]), [selectedIds]); //PLEASE ADD

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
                    <div className="d-flex justify-content-start mb-3">

                        {/*PLEASE ADJUST*/}
                        <Button variant="success" size="sm" onClick={handleExportToExcel} style={{marginRight: "10px"}}>
                            Export to Excel
                        </Button>

                        {/*PLEASE ADD*/}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                if (!selectedIds || selectedIds.size === 0) setShowNoSelectModal(true);
                                else setShowConfirmModal(true);
                            }}
                        >
                            Upload
                        </Button>

                        {/*PLEASE ADD*/}
                        <div style={{ marginLeft: 12, alignSelf: "center" }}>
                            {selectedIds.size > 0 ? `${selectedIds.size} selected` : ""}
                        </div>

                    </div>

                    {/*PLEASE ADD AND ADJUST*/}
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
                            rows={visibleRows} //PLEASE ADJUST
                            columns={columns}
                            paginationModel={{ pageSize, page }} //PLEASE ADD
                            onPaginationModelChange={(model) => { //PLEASE ADD
                                setPage(model.page);
                                setPageSize(model.pageSize);
                            }}
                            rowsPerPageOptions={[10, 25, 50]}
                            disableSelectionOnClick
                            getRowId={(row) => getRowUniqueId(row)} //PLEASE ADJUST
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

            {/*PLEASE ADD*/}
            <Modal show={showNoPdf} onHide={() => setShowNoPdf(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>No PDF available</Modal.Title>
                </Modal.Header>
                <Modal.Body>There is no PDF available for this wagon.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNoPdf(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/*PLEASE ADD*/}
            <Modal show={showNoSelectModal} onHide={() => setShowNoSelectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>No items selected</Modal.Title>
                </Modal.Header>
                <Modal.Body>Please select one or more items in the grid to upload.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNoSelectModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/*PLEASE ADD*/}
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
