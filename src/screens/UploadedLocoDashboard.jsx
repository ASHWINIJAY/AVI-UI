import React, { useEffect, useRef, useState, useCallback } from "react";
import { Container, Card, Modal, Button, Spinner, Form } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext"; 
import { FilterMatchMode } from "primereact/api"; 
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import '../Dash.css'; 

function UploadedLocoDashboard() {
    const BACKEND_URL = "http://41.87.206.94/AVIapi";
    const [userRole] = useState(localStorage.getItem("userRole"));
const token = localStorage.getItem("token");
    const [allRows, setAllRows] = useState([]);
    const [selectedRowIds, setSelectedRowIds] = useState(new Set());
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);

    const [globalFilterValue, setGlobalFilterValue] = useState("");

    const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 25,
    globalFilter:"",
    sortField: null,
    sortOrder: null,
    filters: {
        locoNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
        locoClass: { value: null, matchMode: FilterMatchMode.CONTAINS },
        locoModel: { value: null, matchMode: FilterMatchMode.CONTAINS },
        inspectorName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        city: { value: null, matchMode: FilterMatchMode.CONTAINS },
        uploadStatus: { value: null, matchMode: FilterMatchMode.CONTAINS },

        dateAssessed: { value: null, matchMode: FilterMatchMode.CONTAINS },
        timeAssessed: { value: null, matchMode: FilterMatchMode.CONTAINS },
        startTimeInspect: { value: null, matchMode: FilterMatchMode.CONTAINS },
        uploadDate: { value: null, matchMode: FilterMatchMode.CONTAINS },

        gpsLatitude: { value: null, matchMode: FilterMatchMode.CONTAINS },
        gpsLongitude: { value: null, matchMode: FilterMatchMode.CONTAINS },

        refurbishValue: { value: null, matchMode: FilterMatchMode.EQUALS },
        missingValue: { value: null, matchMode: FilterMatchMode.EQUALS },
        replaceValue: { value: null, matchMode: FilterMatchMode.EQUALS },
        totalLaborValue: { value: null, matchMode: FilterMatchMode.EQUALS },
        totalValue: { value: null, matchMode: FilterMatchMode.EQUALS },
        marketValue: { value: null, matchMode: FilterMatchMode.EQUALS },
        assetValue: { value: null, matchMode: FilterMatchMode.EQUALS },

        calScore: { value: null, matchMode: FilterMatchMode.EQUALS },
        calOperateStatus: { value: null, matchMode: FilterMatchMode.CONTAINS },
        calCondition: { value: null, matchMode: FilterMatchMode.CONTAINS }
    }
});


    const [score, setScore] = useState([]);

    const [showNoInput, setShowNoInput] = useState(false);

    const [recalculating, setRecalculating] = useState(false);

    const [showNoValues, setShowNoValues] = useState(false);

    const [showRecalSuccess, setShowRecalSuccess] = useState(false);

    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [showGeneratePdfModal, setShowGeneratePdfModal] = useState(false);
    const [generatePdfTarget, setGeneratePdfTarget] = useState(null);

    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showNoPdf, setShowNoPdf] = useState(false);

    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [showGenerateSuccessModal, setShowGenerateSuccessModal] = useState(false);

    const [showNoCondition, setShowNoCondition] = useState(false);

    const scrollPosRef = useRef(0);
    const gridContainerRef = useRef(null);
 const [showNoSelectModal, setShowNoSelectModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const isAdmin = userRole === "Super User";
    const isAssessorModerator = userRole === "Asset Monitor";
const [showManualConfirm, setShowManualConfirm] = useState(false);
const [showManualInputModal, setShowManualInputModal] = useState(false);
const [showGenerateAllConfirm, setShowGenerateAllConfirm] = useState(false);
const [showGenerateAllUpload, setShowGenerateAllUploadConfirm] = useState(false);

const [manualValues, setManualValues] = useState({
    scrapValue: "",
    refurbishValue: "",
    transferValue: ""
});

    const saveScroll = useCallback(() => {
        const viewport = gridContainerRef.current?.querySelector(".p-datatable-wrapper");
        if (viewport) {
            scrollPosRef.current = viewport.scrollTop;
        }
    }, []);

    const restoreScroll = useCallback(() => {
        setTimeout(() => {
            const viewport = gridContainerRef.current?.querySelector(".p-datatable-wrapper");
            if (viewport) {
                viewport.scrollTop = scrollPosRef.current;
            }
        }, 50);
    }, []);

    const fetchData = useCallback(async () => {
        setTableLoading(true);

        try {
            const res = await fetch(
                `${BACKEND_URL}/api/Dashboard/getUploadedLocosPaged`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(lazyParams)
                }
            );

            if (!res.ok) throw new Error("Failed to load data");

            const result = await res.json();

            const rowsWithId = result.data.map(row => ({
                ...row,
                conditionScore: row.conditionScore?.toString() ?? "",
                id:
                    row.id ??
                    `${row.locoNumber}-${row.inspectorId}-${row.dateAssessed}-${row.timeAssessed}`
            }));

            setAllRows(rowsWithId);
            setTotalRecords(result.totalRecords);
        }
        catch (err) {
            console.error(err);
            setAllRows([]);
            setTotalRecords(0);
        }
        finally {
            setLoading(false);
            setTableLoading(false);
            restoreScroll();
        }
    }, [lazyParams, restoreScroll]);

    const getScoreColor = useCallback((score) => {
        switch (String(score)) {
            case "1": return "danger";
            case "2": return "danger";
            case "3": return "warning";
            case "4": return "warning";
            case "5": return "info";
            case "6": return "info";
            case "7": return "primary";
            case "8": return "success";
            case "9": return "success";
            case "10": return "success";
            default: return "secondary";
        }
    }, []);

    const getBackgroundColor = (score) => {
        switch (String(score)) {
            case "1": return "#c71e18ff"
            case "2": return "#d9534f"; // red

            case "3": return "#f0da4eff";
            case "4": return "#c3c609ff"; // orange/yellow

            case "5": return "#5bc0de";
            case "6": return "#3d97b2ff"; // light blue

            case "7": return "#0275d8"; // blue

            case "8": return "#5cb85c";
            case "9": return "#378537ff";
            case "10": return "#197219ff"; // green

            default: return "#6c757d"; // grey
        }
    };

    const fetchScore = useCallback(async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/Dashboard/getScoreList`);
            const data = await res.json();

            const formatted = (data || []).map(s => ({
                ...s,
                label: ` - ${mapOperationalStatus(s.conditionScore)}`,
                value: s.conditionScore.toString(),
                color: getScoreColor(s.conditionScore)
            }));

            setScore(formatted);
        } catch (err) {
            console.error("Error fetching Score data:", err);
            setScore([]);
        }
    }, [BACKEND_URL, getScoreColor]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;

        fetchScore();
    }, [fetchScore]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setLazyParams(prev => ({
                ...prev,
                first: 0,
                globalFilter: globalFilterValue
            }));
        }, 400); // debounce delay

        return () => clearTimeout(handler);
    }, [globalFilterValue]);

    const handleOpenModal = (photosValue, e) => {
        e?.stopPropagation();
        let photos = [];
        if (!photosValue || photosValue === "No Photos" || photosValue === "N/A") photos = [];
        else {
            try {
                if (typeof photosValue === "string") {
                    photos = photosValue.trim().startsWith("[") ? JSON.parse(photosValue) : photosValue.split(",").map(p => p.trim());
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

    const renderImageCell = (rowData, field) => {
        const value = rowData[field];
        if (!value || value === "N/A") return <span>N/A</span>;
        const url = value.startsWith("http") ? value : `${BACKEND_URL}/${value}`;
        return <img src={url} alt={field} style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }} />;
    };

    const handleOpenPdf = (pdfPath, e) => {
        e?.stopPropagation();
        if (!pdfPath || ["N/A", "No File", "Not Ready"].includes(pdfPath)) {
            setPdfUrl(null);
            setShowPdfModal(false);
            setShowNoPdf(true);
            return;
        }
        setPdfUrl(pdfPath.startsWith("http") ? pdfPath : `${BACKEND_URL}/${pdfPath}`);
        setShowPdfModal(true);
    };

    const handleExportToExcel = async () => {
        const exportRows = await fetchAllForExport();

        if (!exportRows.length) {
            alert("No data to export");
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
            "City",
            "Refurbish Value",
            "Missing Value",
            "Replace Value",
            "Market Value",
            "Benchmarking Value",
            "Return to Service Cost",
            "Condition Score",
            "Operational Status",
            "Loco Status",
            "Upload Date", "Calculated Score", "Calculated Status", "Calculated Condition"
        ];
        worksheet.addRow(headers).font = { bold: true };

        exportRows.forEach(row => worksheet.addRow([
            row.locoNumber ?? row.locoNumber ?? "",
                row.locoClass ?? "",
                row.locoModel ?? "",
                row.inspectorName ?? row.inspector ?? "",
                row.dateAssessed ?? "",
                row.timeAssessed ?? "",
                row.startTimeInspect ?? "",
                row.gpsLatitude ?? "",
                row.gpsLongitude ?? "",
                row.city??"",
                row.refurbishValue ?? "",
                row.missingValue ?? "",
                row.replaceValue ?? "",
                row.assetValue ?? "",
                row.marketValue ?? "",
                row.totalValue ?? "",
                row.conditionScore ?? "",
                row.operationalStatus ?? "",
                row.uploadStatus ?? "",
                row.uploadDate ?? "", row.calScore, row.calOperateStatus, row.calCondition
        ]));

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), `LocoDashboardUpload_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const scoreTemplate = (option, props) => {
        if (!option) {
            return <span style={{ opacity: 0.6 }}>{props?.placeholder}</span>;
        }

        return (
            <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 10px",
            borderRadius: "8px",
            backgroundColor: getBackgroundColor(option.value),
            color: "white",
            fontWeight: "500"
        }}
        >
                <span>{option.value}</span>
                <span>{option.label}</span>

            </div>);
    };

    const onConditionScoreChange = (row, value) => {
        setAllRows(prev =>
            prev.map(r =>
                r.id === row.id ? { ...r, conditionScore: value } : r
            )
        );
    };

    const handleGeneratePdfClick = (row) => {
        setGeneratePdfTarget(row);
        setShowGeneratePdfModal(true);
    };
const fetchAllForExport = async () => {
    const res = await fetch(
        `${BACKEND_URL}/api/Dashboard/getUploadedLocosForExport`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                globalFilter: lazyParams.globalFilter
            })
        }
    );

    if (!res.ok) throw new Error("Export fetch failed");
    const json = await res.json();
    return json.data;
};

    const confirmGeneratePdfs = async () => {
        if (!generatePdfTarget) return;

        if (!generatePdfTarget?.conditionScore || generatePdfTarget.conditionScore === "") {
            setShowGeneratePdfModal(false); 
            setShowNoCondition(true); 
            return;
        }

        if (generatePdfTarget.totalLaborValue === "" || generatePdfTarget.liftValue === "") {
            setShowGeneratePdfModal(false);
            setShowNoValues(true);
            return;
        }

        let resp = await fetch(`${BACKEND_URL}/api/Dashboard/checkLocoInputs/${parseInt(generatePdfTarget.locoNumber)}`);
        const resMessage = await resp.json();
        if (resMessage.message === "No") {
            setShowGeneratePdfModal(false);
            //setShowNoInput(true);
            setShowManualConfirm(true); 
            return;
        }

        saveScroll();
        setShowGeneratePdfModal(false);
        setGeneratingPdf(true);

        const locoNumber = generatePdfTarget.locoNumber.toString();
        const userId = localStorage.getItem("userId");

        try {
            const endpoints = [
                { url: `${BACKEND_URL}/api/QuotePdf/GenerateAndSaveQuotePdfForLocos` },
                { url: `${BACKEND_URL}/api/CertPdf/GenerateAndSaveLocoCertPdf` },
                { url: `${BACKEND_URL}/api/QuotePdf/GenerateAndSaveSowPdfForLoco` }
            ];

            for (const ep of endpoints) {
                const res = await fetch(ep.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, locoNumber }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Failed at ${ep.url}: ${res.status} ${errText}`);
                }
                // wait a tick so UI updates; ensures strict ordering
                await new Promise(r => setTimeout(r, 250));
            }

            // success
            setShowGenerateSuccessModal(true);
            await fetchData();
        } catch (err) {
            console.error("Error generating PDFs:", err);
            alert("Error generating PDFs: " + (err.message || err));
        } finally {
            setGeneratingPdf(false);
            requestAnimationFrame(() => restoreScroll());
            setGeneratePdfTarget(null);
        }
    };

    const mapOperationalStatus = (score) => {
        switch (String(score)) {
            case "1": return "Scrap only";
            case "2": return "Non-operational, wreck repair";
            case "3": return "Non-operational, needs major overhaul";
            case "4": return "Partially operational or limited use";
            case "5": return "Operational but maintenance is needed";
            case "6": return "Operational but needs scheduled repair";
            case "7": return "Operational with minor issues";
            case "8":
            case "9":
            case "10": return "Fully operational";
            default: return "";
        }
    };

    const onConditionStatusInstantUpdate = (row, value) => {
        const newStatus = mapOperationalStatus(value);

        setAllRows(prev =>
            prev.map(r =>
                r.id === row.id
                    ? {
                        ...r,
                        conditionScore: value,
                        operationalStatus: newStatus
                    }
                    : r
            )
        );
    };

    const updateConditionScore = async (locoNumber, value) => {
        saveScroll();
        try {
            await fetch(`${BACKEND_URL}/api/Dashboard/updateLocoCondition`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    locoNumber: locoNumber.toString(),
                    conditionScore: String(value)
                })
            });
        } catch (err) {
            console.error("Failed to update condition score:", err);
            alert("Failed to save Condition Score");
        }
        finally {
            requestAnimationFrame(() => restoreScroll());
        }
    };
    const buildUploadPayload = () => {
        if (selectedRowIds.size === 0) return [];
        const selectedRows = allRows.filter(row => selectedRowIds.has(row.id));

        return selectedRows.map(r => ({
            locoNumber: r.locoNumber,
            bodyPhotos: r.bodyPhotos,
            liftPhoto: r.liftPhoto,
           
            assessmentQuote: r.assessmentQuote,
            assessmentCert: r.assessmentCert,
            assessmentSow: r.assessmentSow,
            locoPhoto: r.locoPhoto,
            missingPhotos: r.missingPhotos,
            replacePhotos: r.replacePhotos,
        }));
    };
const handleUploadConfirmed = async () => {
        const payload = buildUploadPayload();

        saveScroll();
        setShowConfirmModal(false);
        setTableLoading(true);

        try {
            const resp = await fetch(`${BACKEND_URL}/api/DashBoard/reUploadLocos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
            await resp.json();

            setShowSuccessModal(true);
            await fetchData();

            // Clear selection after upload
            setSelectedRowIds(new Set());
        } catch (err) {
            alert("Re-upload failed: " + err.message);
        } finally {
            setTableLoading(false);
            requestAnimationFrame(() => restoreScroll());
        }
    };
    const handlereGenerateAll = async () =>{
         try {
            setTableLoading(true);
            const endpoints = [
                { url: `${BACKEND_URL}/api/CertPdf/GenerateAndSaveCertPdfForAllLoco` },
                { url: `${BACKEND_URL}/api/QuotePdf/GenerateAndSaveSOWPdfForAllLoco` },
                { url: `${BACKEND_URL}/api/QuotePdf/ReGenerateAndSaveQuotePdfForAllLoco` }
            ];

            for (const ep of endpoints) {
                const res = await fetch(ep.url, {
                    method: "GET",
                    headers: {
            "Authorization": `Bearer ${token}`
        }
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Failed at ${ep.url}: ${res.status} ${errText}`);
                }
                // wait a tick so UI updates; ensures strict ordering
                await new Promise(r => setTimeout(r, 250));
            }
alert("All PDF's Successfully Generated");
            // success
            
        } catch (err) {
            console.error("Error generating PDFs:", err);
            alert("Error generating PDFs: " + (err.message || err));
        } finally {
            setTableLoading(false);
        }
    }
    const handlereUploadAll = async () => {       

        try {
            setTableLoading(true);
            const resp = await fetch(`${BACKEND_URL}/api/DashBoard/ReuploadAllLocos`, {
                method: "GET",
            });

            if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
            await resp.json();

          alert("Re-upload successfully completed");
           
        } catch (err) {
            alert("Re-upload failed: " + err.message);
        } finally {
          setTableLoading(false);
        }
    };
    const handlereCalculateAll = async () => {       

        try {
            setTableLoading(true);
            const resp = await fetch(`${BACKEND_URL}/api/DashBoard/RecalculateUploadLocoAll`, {
                method: "GET",
                
            });

            if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
            await resp.json();

          alert("Re-calculate successfully completed");
           
        } catch (err) {
            alert("Re-calculate failed: " + err.message);
        } finally {
          setTableLoading(false);
        }
    };
    const handleRecalculateClick = useCallback(async (row) => {
        if (!row?.locoNumber) return;

        const payload = { wagonNumber: row.locoNumber.toString() };

        saveScroll();
        setRecalculating(true);

        try {
            const response = await fetch(
                `${BACKEND_URL}/api/Dashboard/recalculateLocoValues`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                alert("Error: " + (errorData?.message ?? JSON.stringify(errorData)));
                return;
            }

            setShowRecalSuccess(true);
            await fetchData();
        } catch (err) {
            console.error("Error recalculating:", err);
            alert("Error recalculating: " + err.message);
        } finally {
            setRecalculating(false);
            requestAnimationFrame(() => restoreScroll());
        }
    }, [BACKEND_URL, fetchData, saveScroll, restoreScroll]);

    const onRecalculateClick = useCallback((row, e) => {
        e.stopPropagation();
        handleRecalculateClick(row);
    }, [handleRecalculateClick]);
const handleSaveManualValues = async () => {
    if (
        !manualValues.scrapValue ||
        !manualValues.refurbishValue ||
        !manualValues.transferValue
    ) {
        alert("Please enter all values");
        return;
    }

    try {
        await fetch(`${BACKEND_URL}/api/CertPDF/saveManualDcfValues`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                assetNumber: generatePdfTarget.locoNumber.toString(),
                scrapValue: manualValues.scrapValue,
                refurbishValue: manualValues.refurbishValue,
                transferValue: manualValues.transferValue
            })
        });

        setShowManualInputModal(false);

        // reset values
        setManualValues({
            scrapValue: "",
            refurbishValue: "",
            transferValue: ""
        });

        // Continue PDF generation
        confirmGeneratePdfs();

    } catch (err) {
        console.error(err);
        alert("Failed to save manual values");
    }
};

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <Spinner animation="border" />
        </Container>
    );

    return (
        <Container fluid>
            <Card className="mt-3 mb-3">
                <Card.Header>Loco Dashboard (Uploaded)</Card.Header>
                <Card.Body style={{ height: 680, width: "100%" }}>
                    <div className="d-flex justify-content-start mb-3">
                        <Button variant="success" size="sm" onClick={handleExportToExcel} className="me-2">Export to Excel</Button>
                   
                            <Button variant="primary" size="sm" className="me-2" onClick={() => selectedRowIds.size > 0 ? setShowConfirmModal(true) : setShowNoSelectModal(true)}>Re-upload</Button>
                        <Button variant="success" size="sm" onClick={handlereUploadAll} className="me-2">Re-Upload All Lines</Button>
                   <Button variant="success" size="sm" onClick={handlereCalculateAll} className="me-2">Re-Calculate All Lines</Button>
                   <Button
    variant="success"
    size="sm"
    className="me-2"
    onClick={() => setShowGenerateAllConfirm(true)}
>
    Re-Generate All PDF's
</Button>

                    </div>

                   <div className="d-flex justify-content-between align-items-center mb-3">
    <span className="p-input-icon-left">
        <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search Loco Number, Class, Inspector"
            style={{ width: "300px" }}
        />
    </span>

    <Button
        variant="success"
        size="sm"
        onClick={handleExportToExcel}
    >
        Export to Excel
    </Button>
</div>


                    <div style={{ position: "relative" }} ref={gridContainerRef}>

                        {(generatingPdf || recalculating || tableLoading) && (
    <div
        style={{
            position: "absolute",
            zIndex: 10,
            top: 0,
            left: 400,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.6)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "left",
            alignItems: "left",
            gap: "10px"
        }}
    >
        <Spinner animation="border" />
        <div
    style={{
        fontWeight: 500,
        fontSize: "14px",
        color: "#fda10dff" // Bootstrap primary blue
    }}
>
    Please wait…
</div>

    </div>
)}


<DataTable
    lazy
    value={allRows}
    paginator
    totalRecords={totalRecords}
    first={lazyParams.first}
    rows={lazyParams.rows}
    rowsPerPageOptions={[25, 50, 100, 200]}
    sortField={lazyParams.sortField}
    sortOrder={lazyParams.sortOrder}
    filters={lazyParams.filters}
    filterDisplay="menu"

    onPage={(e) => {
        saveScroll();
        setLazyParams(prev => ({
            ...prev,
            first: e.first,
            rows: e.rows
        }));
    }}

    onSort={(e) => {
        setLazyParams(prev => ({
            ...prev,
            sortField: e.sortField,
            sortOrder: e.sortOrder
        }));
    }}

    onFilter={(e) => {
        setLazyParams(prev => ({
            ...prev,
            filters: e.filters,
            first: 0
        }));
    }}

    className="p-datatable-sm p-datatable-striped"
    scrollable
    scrollHeight="510px"
    dataKey="id"

    selectionMode="checkbox"
    selection={allRows.filter(row => selectedRowIds.has(row.id))}
    onSelectionChange={(e) => {
        setSelectedRowIds(prev => {
            const next = new Set(prev);
            e.value.forEach(row => next.add(row.id));
            allRows.forEach(row => {
                if (!e.value.some(r => r.id === row.id)) next.delete(row.id);
            });
            return next;
        });
    }}
>

    <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />

    {/* ACTION COLUMNS - NO FILTER */}
    {(isAssessorModerator || isAdmin) && (
        <Column
            header="Recalculate Values"
            style={{ minWidth: 150 }}
            body={(row) => (
                <Button size="sm" onClick={(e) => onRecalculateClick(row, e)}>
                    Recalculate
                </Button>
            )}
        />
    )}

    {(isAssessorModerator || isAdmin) && (
        <Column
            header="Regenerate PDFs"
            style={{ minWidth: 150 }}
            body={(row) => (
                <Button
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleGeneratePdfClick(row);
                    }}
                >
                    Regenerate
                </Button>
            )}
        />
    )}

    {/* FILTERABLE DATA COLUMNS */}
    <Column field="locoNumber" header="Loco Number" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="locoClass" header="Loco Class" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="locoModel" header="Loco Model" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />
    <Column field="inspectorName" header="Inspector" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />

    <Column field="dateAssessed" header="Date Completed" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 110 }} />
    <Column field="timeAssessed" header="Time Completed" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 110 }} />
    <Column field="startTimeInspect" header="Time Started" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 110 }} />

    <Column field="gpsLatitude" header="Gps Latitude" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="gpsLongitude" header="Gps Longitude" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="city" header="City" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />

    {/* IMAGE / PDF COLUMNS (NO FILTER) */}
    <Column
        header="Body Photos"
        style={{ minWidth: 120 }}
        body={(row) => (
            <Button
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(row.bodyPhotos, e);
                }}
            >
                View
            </Button>
        )}
    />

    <Column
        header="Loco Photo"
        style={{ minWidth: 140 }}
        body={(row) => (
            <div onClick={(e) => e.stopPropagation()}>
                {renderImageCell(row, "locoPhoto")}
            </div>
        )}
    />

    <Column
        header="Assessment Quote"
        style={{ minWidth: 160 }}
        body={(row) =>
            row.assessmentQuote && row.assessmentQuote !== "N/A" ? (
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPdf(row.assessmentQuote, e);
                    }}
                >
                    View PDF
                </Button>
            ) : <span>N/A</span>
        }
    />

    <Column
        header="Assessment Cert"
        style={{ minWidth: 140 }}
        body={(row) =>
            row.assessmentCert && row.assessmentCert !== "N/A" ? (
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPdf(row.assessmentCert, e);
                    }}
                >
                    View PDF
                </Button>
            ) : <span>N/A</span>
        }
    />

    <Column
        header="Assessment SOW"
        style={{ minWidth: 140 }}
        body={(row) =>
            row.assessmentSow && row.assessmentSow !== "N/A" ? (
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPdf(row.assessmentSow, e);
                    }}
                >
                    View PDF
                </Button>
            ) : <span>N/A</span>
        }
    />

    {/* NUMERIC COLUMNS */}
    <Column field="refurbishValue" header="Refurbish Value" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="missingValue" header="Missing Value" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="replaceValue" header="Replace Value" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="totalLaborValue" header="Labor Value" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="totalValue" header="Return to Service Cost" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="marketValue" header="Benchmarking Value" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 140 }} />
    <Column field="assetValue" header="Market Value" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 120 }} />

    {/* STATUS & CALCULATED */}
    <Column field="uploadStatus" header="Loco Status" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
    <Column field="uploadDate" header="Upload Date" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
    {(isAssessorModerator || isAdmin) && (
                                <Column
                                    header="Condition Score"
                                    style={{ minWidth: 230 }}
                                    body={(row) => (
                                        <Dropdown
                                            value={row.conditionScore}
                                            options={score}
                                            optionLabel="label"
                                            optionValue="value"
                                            itemTemplate={scoreTemplate}
                                            valueTemplate={scoreTemplate}
                                            placeholder="Select Score"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                onConditionScoreChange(row, e.value);
                                                updateConditionScore(row.locoNumber, e.value);
                                                onConditionStatusInstantUpdate(row, e.value);
                                            }}
                                            className="w-100"
                                        />
                                    )}
                                />
                            )}
                            {(isAssessorModerator || isAdmin) && (
                                <Column
                                    header="Operational Status"
                                    field="operationalStatus"
                                    style={{ minWidth: 200 }}
                                    body={(row) => row?.operationalStatus ?? ""}
                                />
                            )}<Column field="calScore" header="Calculated Score" sortable filter filterMatchMode="equals" showFilterMenu style={{ minWidth: 140 }} />
    <Column field="calOperateStatus" header="Calculated Status" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />
    <Column field="calCondition" header="Calculated Condition" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />

</DataTable>



                    </div>
                </Card.Body>
            </Card>

            {/* Photos Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
                <Modal.Header closeButton><Modal.Title>Photos</Modal.Title></Modal.Header>
                <Modal.Body>
                    {modalPhotos.length ? (
                        <div className="d-flex flex-wrap gap-2">
                            {modalPhotos.map((url, idx) => (
                                <img key={idx} src={url.startsWith("http") ? url : `${BACKEND_URL}/${url}`} alt={`photo-${idx}`} style={{ maxWidth: 150, maxHeight: 150, objectFit: "cover" }} />
                            ))}
                        </div>
                    ) : (
                        <p>No photos available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* No Condition Modal */}
            <Modal show={showNoCondition} onHide={() => setShowNoCondition(false)}>
                <Modal.Header closeButton><Modal.Title>No Condition</Modal.Title></Modal.Header>
                <Modal.Body>Please select a Condition Score before generating PDFs.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoCondition(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* No Values Modal */}
            <Modal show={showNoValues} onHide={() => setShowNoValues(false)}>
                <Modal.Header closeButton><Modal.Title>Missing Values</Modal.Title></Modal.Header>
                <Modal.Body>Please racalculate missing values before doing this action.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoValues(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* Generate PDF Confirmation Modal */}
            <Modal show={showGeneratePdfModal} onHide={() => setShowGeneratePdfModal(false)}>
                <Modal.Header closeButton><Modal.Title>Generate PDFs</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to (re)generate the PDFs for Loco <b>{generatePdfTarget?.locoNumber}</b>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGeneratePdfModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={confirmGeneratePdfs}>Generate</Button>
                </Modal.Footer>
            </Modal>

            {/* No Inputs Modal */}
            <Modal show={showNoInput} onHide={() => setShowNoInput(false)}>
                <Modal.Header closeButton><Modal.Title>Missing Inputs</Modal.Title></Modal.Header>
                <Modal.Body>The inputs for this loco cannot be found. Therefore the PDFs cannot be generated. Please contact your administrator.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoInput(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* Generate success modal */}
            <Modal show={showGenerateSuccessModal} onHide={() => setShowGenerateSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>PDFs Generated</Modal.Title></Modal.Header>
                <Modal.Body>All PDFs have been successfully generated.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowGenerateSuccessModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showRecalSuccess} onHide={() => setShowRecalSuccess(false)}>
                <Modal.Header closeButton><Modal.Title>Values Recalculate</Modal.Title></Modal.Header>
                <Modal.Body>Missing values recalculated successfully.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowRecalSuccess(false)}>OK</Button>
                </Modal.Footer>
            </Modal>

            {/* PDF Viewer Modal */}
            <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="xl">
                <Modal.Header closeButton><Modal.Title>PDF Viewer</Modal.Title></Modal.Header>
                <Modal.Body>
                    {pdfUrl ? <iframe src={pdfUrl} style={{ width: "100%", height: "600px" }} title="PDF Viewer"></iframe> : <p>No PDF available.</p>}
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowPdfModal(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* No PDF Modal */}
            <Modal show={showNoPdf} onHide={() => setShowNoPdf(false)}>
                <Modal.Header closeButton><Modal.Title>No PDF</Modal.Title></Modal.Header>
                <Modal.Body>No PDF file is available for this loco.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoPdf(false)}>Close</Button></Modal.Footer>
            </Modal>
            <Modal show={showManualConfirm} onHide={() => setShowManualConfirm(false)}>
    <Modal.Header closeButton>
        <Modal.Title>No DCF Data</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        No DCF data captured for this Loco.
        <br />
        <b>Do you want to enter manually now and proceed?</b>
    </Modal.Body>
    <Modal.Footer>
        <Button
            variant="secondary"
            onClick={() => setShowManualConfirm(false)}
        >
            Cancel
        </Button>
        <Button
            variant="primary"
            onClick={() => {
                setShowManualConfirm(false);
                setShowManualInputModal(true);
            }}
        >
            OK
        </Button>
    </Modal.Footer>
</Modal>
<Modal show={showManualInputModal} onHide={() => setShowManualInputModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Enter DCF Values</Modal.Title>
    </Modal.Header>

    <Modal.Body>
        <Form>
            <Form.Group className="mb-2">
                <Form.Label>Scrap Value (Pre-Tax) </Form.Label>
                <Form.Control
                    type="number"
                    value={manualValues.scrapValue}
                    onChange={(e) =>
                        setManualValues({ ...manualValues, scrapValue: e.target.value })
                    }
                />
            </Form.Group>

            <Form.Group className="mb-2">
                <Form.Label>Refurbish Value (Pre-Tax) </Form.Label>
                <Form.Control
                    type="number"
                    value={manualValues.refurbishValue}
                    onChange={(e) =>
                        setManualValues({ ...manualValues, refurbishValue: e.target.value })
                    }
                />
            </Form.Group>

            <Form.Group className="mb-2">
                <Form.Label>Transfer Value (Pre-Tax) </Form.Label>
                <Form.Control
                    type="number"
                    value={manualValues.transferValue}
                    onChange={(e) =>
                        setManualValues({ ...manualValues, transferValue: e.target.value })
                    }
                />
            </Form.Group>
        </Form>
    </Modal.Body>

    <Modal.Footer>
        <Button
            variant="secondary"
            onClick={() => setShowManualInputModal(false)}
        >
            Cancel
        </Button>
        <Button
            variant="primary"
            onClick={handleSaveManualValues}
        >
            Save & Proceed
        </Button>
    </Modal.Footer>
</Modal>
<Modal
    show={showGenerateAllConfirm}
    onHide={() => setShowGenerateAllConfirm(false)}
    backdrop="static"
    centered
>
    <Modal.Header closeButton>
        <Modal.Title>Confirm Re-Generate</Modal.Title>
    </Modal.Header>

    <Modal.Body>
        <p>
            Are you sure you want to <b>Re-Generate all PDFs</b>?
        </p>
        <p className="text-danger mb-0">
            ⚠️ This process may take a long time to complete.
            <br />
            Your screen cannot be used until the process finishes.
        </p>
    </Modal.Body>

    <Modal.Footer>
        <Button
            variant="secondary"
            onClick={() => setShowGenerateAllConfirm(false)}
        >
            Cancel
        </Button>

        <Button
            variant="danger"
            onClick={() => {
                setShowGenerateAllConfirm(false);
                handlereGenerateAll();
            }}
        >
            Yes, Re-Generate All
        </Button>
    </Modal.Footer>
</Modal>

 {/* No Selection Modal */}
            <Modal show={showNoSelectModal} onHide={() => setShowNoSelectModal(false)}>
                <Modal.Header closeButton><Modal.Title>No Selection</Modal.Title></Modal.Header>
                <Modal.Body>Please select at least one row to perform this action.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoSelectModal(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* Upload Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirm Re-upload</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to re-upload the selected locos?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleUploadConfirmed}>Re-upload</Button>
                </Modal.Footer>
            </Modal>

            {/* Upload Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>Re-upload Successful</Modal.Title></Modal.Header>
                <Modal.Body>Locos have been successfully re-uploaded.</Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={() => setShowSuccessModal(false)}>OK</Button></Modal.Footer>
            </Modal>

        </Container>
    );
}

export default UploadedLocoDashboard;