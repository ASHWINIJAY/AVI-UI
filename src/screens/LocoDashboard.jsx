// Ensure PrimeReact is installed: npm install primereact primeicons
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Container, Card, Modal, Button, Spinner, Form } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from 'primereact/dropdown';
import ExcelJS from "exceljs";
import { InputText } from "primereact/inputtext"; //PLEASE ADD (FILTERING)
import { FilterMatchMode } from "primereact/api";
import { saveAs } from "file-saver";
import '../Dash.css'; // assume your existing css; you can add the small .selected-row rule if needed

export default function LocoDashboard() {
     const BACKEND_URL = "http://41.87.206.94/AVIapi"; 
    //const BACKEND_URL = "http://41.87.206.94/AVIapi"; // Adjust if different http://41.87.206.94/AVIapi
  
    const [userRole] = useState(localStorage.getItem("userRole"));
const [score, setScore] = useState([]);
    const [allRows, setAllRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]); // array of row objects
    const [loading, setLoading] = useState(true);
const token = localStorage.getItem("token");
    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);
const [showNoInput, setShowNoInput] = useState(false); //PLEASE ADD (NEW)

    const [showGeneratePdfModal, setShowGeneratePdfModal] = useState(false);
    const [generatePdfTarget, setGeneratePdfTarget] = useState(null);
const [recalculating, setRecalculating] = useState(false);
const [showGenerateAllConfirm, setShowGenerateAllConfirm] = useState(false);
const [showGenerateAllUpload, setShowGenerateAllUploadConfirm] = useState(false);
    const [showNoValues, setShowNoValues] = useState(false);

    const [showRecalSuccess, setShowRecalSuccess] = useState(false);
    const [showTickConfirmModal, setShowTickConfirmModal] = useState(false);
    const [tickTargetRow, setTickTargetRow] = useState(null);

    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showNoPdf, setShowNoPdf] = useState(false);
    const [showNoSelectModal, setShowNoSelectModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
 const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        locoNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
  locoClass: { value: null, matchMode: FilterMatchMode.CONTAINS },
  locoModel: { value: null, matchMode: FilterMatchMode.CONTAINS },
  inspectorName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  city: { value: null, matchMode: FilterMatchMode.CONTAINS },

  uploadStatus: { value: null, matchMode: FilterMatchMode.CONTAINS },
  operationalStatus: { value: null, matchMode: FilterMatchMode.CONTAINS },

  calOperateStatus: { value: null, matchMode: FilterMatchMode.CONTAINS },
  calCondition: { value: null, matchMode: FilterMatchMode.CONTAINS },

  /* ===== DATE / TIME (TEXT MATCH) ===== */
  dateAssessed: { value: null, matchMode: FilterMatchMode.CONTAINS },
  timeAssessed: { value: null, matchMode: FilterMatchMode.CONTAINS },
  startTimeInspect: { value: null, matchMode: FilterMatchMode.CONTAINS },

  uploadDate: { value: null, matchMode: FilterMatchMode.CONTAINS },

  /* ===== LOCATION ===== */
  gpsLatitude: { value: null, matchMode: FilterMatchMode.CONTAINS },
  gpsLongitude: { value: null, matchMode: FilterMatchMode.CONTAINS },

  /* ===== NUMERIC FIELDS ===== */
  refurbishValue: { value: null, matchMode: FilterMatchMode.EQUALS },
  missingValue: { value: null, matchMode: FilterMatchMode.EQUALS },
  replaceValue: { value: null, matchMode: FilterMatchMode.EQUALS },
  totalLaborValue: { value: null, matchMode: FilterMatchMode.EQUALS },

  totalValue: { value: null, matchMode: FilterMatchMode.EQUALS },
  marketValue: { value: null, matchMode: FilterMatchMode.EQUALS },
  assetValue: { value: null, matchMode: FilterMatchMode.EQUALS },

  calScore: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
const STATUS = {
    INSPECTION_DONE: "Inspection Complete",
    READY_FOR_ASSESSMENT: "ReadyForAssessment",
    ASSESSED_READY_FOR_UPLOAD: "AssessedReadyForUpload"
};

const [statusFilter, setStatusFilter] = useState(STATUS.INSPECTION_DONE);

const statusOptions = [
    { label: "Inspection Complete", value: STATUS.INSPECTION_DONE },
    { label: "Assessed Ready For Upload", value: STATUS.ASSESSED_READY_FOR_UPLOAD }
];

    //PLEASE ADD (FILTERING)
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    // PDF generation state
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [showGenerateSuccessModal, setShowGenerateSuccessModal] = useState(false);
    const [showTickSuccessModal, setShowTickSuccessModal] = useState(false);

    // Pagination/scroll persistence
    const [dtFirst, setDtFirst] = useState(0);
    const [dtRows, setDtRows] = useState(100);
    const scrollPosRef = useRef(0);
    const gridContainerRef = useRef(null);

    // ADMIN view state: default "Inspection Complete"
    const isAdmin = userRole === "Super User";
    //const [adminView, setAdminView] = useState("Inspection Complete"); // "Inspection Complete" | "Assessor Ticked"
const [adminMode, setAdminMode] = useState("Asset Monitor"); 
    const isAssessor = userRole === "Assessor";
    const isAssessorMonitor = userRole === "Asset Monitor";
const effectiveRole = isAdmin
    ? adminMode
    : isAssessor
        ? "Assessor"
        : "Asset Monitor";
    const getRowUniqueId = (row) =>
        row.id ?? `${row.locoNumber ?? "NA"}-${row.inspectorId ?? "NA"}-${row.dateAssessed ?? "NA"}-${row.timeAssessed ?? "NA"}`;

    const saveScroll = () => {
        const viewport = gridContainerRef.current?.querySelector(".p-datatable-wrapper");
        if (viewport) scrollPosRef.current = viewport.scrollTop;
    };

    const restoreScroll = () => {
        setTimeout(() => {
            const viewport = gridContainerRef.current?.querySelector(".p-datatable-wrapper");
            if (viewport) viewport.scrollTop = scrollPosRef.current;
        }, 50);
    };
    //PLEASE ADD (NEW)
    const fetchScore = async () => {
    try {
        let res = await fetch(`${BACKEND_URL}/api/Dashboard/getScoreList`);
        const data = await res.json();

        // 🔥 Enhance each item: add label with score + condition
        const formatted = (data || []).map(s => ({
            ...s,
            label: ` - ${s.condition}`,
            value: s.conditionScore,
            color: getScoreColor(s.conditionScore)
        }));

        setScore(formatted);
    }
    catch (err) {
        console.error("Error fetching Score data:", err);
        setScore([]);
    }
};
  const handlereGenerateAll = async () =>{
         try {
            setUploading(true);
            const endpoints = [
                { url: `${BACKEND_URL}/api/CertPdf/GenerateAndSaveCertPdfForAllLocoNU` },
                { url: `${BACKEND_URL}/api/QuotePdf/GenerateAndSaveSOWPdfForAllLocoNU` },
                { url: `${BACKEND_URL}/api/QuotePdf/ReGenerateAndSaveQuotePdfForAllLocoNU` }
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
            setUploading(false);
        }
    }
    const handlereUploadAll = async () => {       

        try {
            setUploading(true);
            const resp = await fetch(`${BACKEND_URL}/api/DashBoard/ReuploadAllLocosNU`, {
                method: "GET",
            });

            if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
            await resp.json();

          alert("Re-upload successfully completed");
           
        } catch (err) {
            alert("Re-upload failed: " + err.message);
        } finally {
          setUploading(false);
        }
    };
    const handlereCalculateAll = async () => {       

        try {
            setUploading(true);
            const resp = await fetch(`${BACKEND_URL}/api/DashBoard/RecalculateUploadLocoAllNU`, {
                method: "GET",
                
            });

            if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
            await resp.json();

          alert("Re-calculate successfully completed");
           
        } catch (err) {
            alert("Re-calculate failed: " + err.message);
        } finally {
          setUploading(false);
        }
    };
const getScoreColor = (score) => {
    switch (String(score)) {
        case "1": return "danger";       // red
        case "2": return "danger";
        case "3": return "warning";      // orange/yellow
        case "4": return "warning";
        case "5": return "info";         // blueish
        case "6": return "info";
        case "7": return "primary";      // blue
        case "8": return "success";      // green
        case "9": return "success";
        case "10": return "success";
        default: return "secondary";
    }
};
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

const scoreTemplate = (option, props) => {

    // 🔥 When no option selected → show placeholder text
    if (!option) {
        return <span style={{ opacity: 0.6 }}>{props?.placeholder}</span>;
    }

    return (
        <div
            style={{
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
        </div>
    );
};





    const onConditionScoreChange = (row, value) => {
    setAllRows(prev =>
        prev.map(r =>
            r.id === row.id ? { ...r, conditionScore: value } : r
        )
    );
};
    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
          try {
            let res;
            if (userRole === "Assessor") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllLocoDashboard`);
            } else if (userRole === "Asset Monitor") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllLocoDashboard`);
            } else if (userRole === "Super User" && effectiveRole === "Inspection Complete") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllLocoDashboard`);
            } else if (userRole === "Super User" && effectiveRole === "Assessor Ticked") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllLocoDashboard`);
            }
            if (userRole === "Super User" && effectiveRole === "Assessor") {
    res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllLocoDashboard`);
}
else if (
    userRole === "Super User" &&
    effectiveRole === "Asset Monitor"
) {
    res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllLocoDashboard`);
}
            
            const data = await res.json();
            setAllRows(data || []);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setAllRows([]);
        } finally {
            setLoading(false);
            // restore scroll after render
            requestAnimationFrame(() => restoreScroll());
        }
    }, [userRole, , effectiveRole]);

     useEffect(() => {
           fetchScore();
           fetchData();
            if (isAssessorMonitor || (isAdmin && effectiveRole === "Asset Monitor")) {
           setStatusFilter("Inspection Complete");
       } else {
           setStatusFilter(null);
       }
           //PLEASE DO NOT REMOVE
           // eslint-disable-next-line react-hooks/exhaustive-deps
       }, [userRole, effectiveRole]);

    // Visible rows according to your existing filter rules — NOT changed
  const visibleRows = useMemo(() => {
      let rows = allRows;
  
      // Role-based visibility
      if (effectiveRole === "Assessor") {
          rows = rows.filter(
              r => r.uploadStatus === STATUS.READY_FOR_ASSESSMENT
          );
      }
  
      if (effectiveRole === "Asset Monitor") {
          rows = rows.filter(
              r =>
                  r.uploadStatus === STATUS.INSPECTION_DONE ||
                  r.uploadStatus === STATUS.ASSESSED_READY_FOR_UPLOAD
          );
      }
  
      // Status dropdown filter (final)
      if (statusFilter) {
          rows = rows.filter(
              r => r.uploadStatus === statusFilter
          );
      }
  
      return rows;
  }, [allRows, effectiveRole, statusFilter]);
    const rowsWithId = useMemo(() => visibleRows.map(row => ({ ...row, id: getRowUniqueId(row) })), [visibleRows]);

    //PLEASE ADD (NEW)
    const prevSelectedRef = useRef(selectedRows);

    const mapOperationalStatus = (score) => {
    switch (String(score)) {
        case "1":  return "Scrap only";
        case "2":  return "Non-operational, wreck repair";
        case "3":  return "Non-operational, needs major overhaul";
        case "4":  return "Partially operational or limited use";
        case "5":  return "Operational but maintenance is needed";
        case "6":  return "Operational but needs scheduled repair";
        case "7":  return "Operational with minor issues";
        case "8":
        case "9":
        case "10": return "Fully operational";
        default:   return "";
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
    useEffect(() => {
        const validIds = new Set(rowsWithId.map(r => r.id));
        const newSelected = prevSelectedRef.current.filter(s => validIds.has(s.id));

        // only update if actually different
        if (newSelected.length !== prevSelectedRef.current.length ||
            newSelected.some((r, i) => r.id !== prevSelectedRef.current[i]?.id)) {
            setSelectedRows(newSelected);
            prevSelectedRef.current = newSelected;
        }

        const total = rowsWithId.length;
        const maxFirst = total > 0 ? Math.floor((Math.max(0, total - 1)) / dtRows) * dtRows : 0;
        setDtFirst(prev => (prev > maxFirst ? maxFirst : prev));
    }, [rowsWithId, dtRows]); // removed selectedRows from dependency


    // Helper to check "all three PDFs exist" logic
    const okPdf = (v) => !!v && v !== "N/A" && v !== "No File" && v !== "Not Ready" && v !== "NotReady";
     const hasAllPdfs = (row) => {
    // 🔐 Only allowed in final status
    if (row?.uploadStatus !== STATUS.ASSESSED_READY_FOR_UPLOAD) {
        return false;
    }

    return (
        okPdf(row?.assessmentQuote) &&
        okPdf(row?.assessmentCert) &&
        okPdf(row?.assessmentSow)
    );
};
    // Photos modal
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

    // OPEN PDF view
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

    //PLEASE ADD (NEW)
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
             //await fetchData();
        } catch (err) {
            console.error("Failed to update condition score:", err);
            alert("Failed to save Condition Score");
        }
        finally {
            requestAnimationFrame(() => restoreScroll());
        }
    };
const handleRecalculateClick = async (row) => {
        if (!row?.locoNumber) return;

        const payload = { wagonNumber: row.locoNumber.toString() };
        saveScroll();
        setRecalculating(true)
        try {
            const response = await fetch(`${BACKEND_URL}/api/Dashboard/recalculateLocoValues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                alert("Error: " + (errorData?.message ?? JSON.stringify(errorData)));
                return;
            }
        
            setShowRecalSuccess(true);
            await fetchData();
            // don't clear selection automatically; leave that behaviour as before
        } catch (err) {
            console.error("Error recalculating:", err);
            alert("Error recalculating: " + err.message);
        } finally {
            setRecalculating(false);
            requestAnimationFrame(() => restoreScroll());
        }
    }
    // Export to excel (unchanged)
    const handleExportToExcel = async () => {
        if (!rowsWithId.length) { alert("No rows to export."); return; }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Loco Dashboard");

        const headers = [
            "Loco Number", "Loco Class", "Loco Model", "Inspector", "Date Completed", "Time Completed",
            "Time Started", "Gps Latitude", "Gps Longitude","City", "Refurbish Value", "Missing Value",
            "Replace Value", "Total Labor Value", "Return to Service Cost", "Benchmarking Value", "Market Value", "Loco Status", "Upload Date","ConditionScore", "OperationalStatus", "Calculated Score", "Calculated Status", "Calculated Condition"
        ];
        worksheet.addRow(headers).font = { bold: true };

        rowsWithId.forEach(row => worksheet.addRow([
            row.locoNumber, row.locoClass, row.locoModel, row.inspectorName, row.dateAssessed, row.timeAssessed,
            row.startTimeInspect, row.gpsLatitude, row.gpsLongitude,row.city, row.refurbishValue, row.missingValue, row.replaceValue,row.totalLaborValue,
             row.totalValue, row.marketValue, row.assetValue, row.uploadStatus, row.uploadDate,row.conditionScore, row.operationalStatus, row.calScore, row.calOperateStatus, row.calCondition
        ]));

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), `LocoDashboard_${new Date().toISOString().split("T")[0]}.xlsx`);
    };
const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters.global.value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const clearSelection = () => { setSelectedRows([]); };

    const buildUploadPayload = () => {
        if (!selectedRows.length) return [];
        return selectedRows.map(r => ({
            locoNumber: r.locoNumber,
            bodyPhotos: r.bodyPhotos,
            locoPhoto: r.locoPhoto,
            
            assessmentQuote: r.assessmentQuote,
            assessmentCert: r.assessmentCert,
            assessmentSow: r.assessmentSow,
            missingPhotos: r.missingPhotos,
            replacePhotos: r.replacePhotos,
        }));
    };

    // Upload (only use when Asset Monitor – UI shows button only for that role)
    const handleUploadConfirmed = async () => {
        const payload = buildUploadPayload();
        if (!payload.length) { setShowNoSelectModal(true); return; }

        saveScroll();
        setShowConfirmModal(false);
        setUploading(true);
        try {
            const resp = await fetch(`${BACKEND_URL}/api/Dashboard/uploadLocos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
            await resp.json();
            setShowSuccessModal(true);
            await fetchData();
            clearSelection();
        } catch (err) { alert("Upload failed: " + err.message); }
        finally { setUploading(false); requestAnimationFrame(() => restoreScroll()); }
    };

    // Confirm tick (assessor tick)
  // Confirm tick (assessor tick)
    const confirmTickWagon = async () => {
    if (!tickTargetRow) return;

    saveScroll();

    try {
        let url = "";
        let payload = {
            wagonNumber: Number(tickTargetRow.locoNumber)
        };

        // 🚦 STATUS-BASED API ROUTING
        if (
            effectiveRole === "Asset Monitor" &&
            tickTargetRow.uploadStatus === STATUS.INSPECTION_DONE
        ) {
            // InspectionDone → ReadyForAssessment
            url = `${BACKEND_URL}/api/Dashboard/markReadyForAssessmentLoco`;
        }
        else if (
            effectiveRole === "Assessor" &&
            tickTargetRow.uploadStatus === STATUS.READY_FOR_ASSESSMENT
        ) {
            // ReadyForAssessment → AssessedReadyForUpload
            url = `${BACKEND_URL}/api/Dashboard/markAssessedReadyForUploadLoco`;
        }
        else {
            alert("Invalid status transition");
            return;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }

        setShowTickConfirmModal(false);
        setTickTargetRow(null);
        setShowTickSuccessModal(true);

        await fetchData();
    }
    catch (err) {
        console.error("Tick failed:", err);
        alert("Failed to update status");
    }
    finally {
        requestAnimationFrame(() => restoreScroll());
    }
};

    // Generate PDFs: sequential, with overlay spinner, preserves scroll and pagination
    const handleGeneratePdfClick = (row) => {
        setGeneratePdfTarget(row);
        setShowGeneratePdfModal(true);
    };

    const confirmGeneratePdfs = async () => {
        if (!generatePdfTarget) return;
        // Save scroll & pagination
        if (!generatePdfTarget?.conditionScore || generatePdfTarget.conditionScore === "") {
        alert("Please select a Condition Score before generating PDFs.");
        return;  // stop PDF generation
    }
    let resp = await fetch(`${BACKEND_URL}/api/Dashboard/checkLocoInputs/${parseInt(generatePdfTarget.locoNumber)}`);
        const resMessage = await resp.json();
        if (resMessage.message === "No") {
            setShowGeneratePdfModal(false);
            setShowNoInput(true);
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

    // Row class to show selected highlight only when checkbox is selected
    const rowClassName = (rowData) => {
        return selectedRows.some(r => r.id === rowData.id) ? 'p-highlight selected-row' : '';
    };

 // Header select-all checkbox template (only visible for non-assesor roles)
    const renderHeaderSelectAll = () => {
        // compute selectable rows (those with all PDFs)
        const selectable = rowsWithId.filter(r => hasAllPdfs(r));
        const selectableIds = new Set(selectable.map(r => r.id));
        const allSelected = selectable.length > 0 && selectable.every(r => selectedRows.some(s => s.id === r.id));
        const someSelected = selectable.some(r => selectedRows.some(s => s.id === r.id)) && !allSelected;

        const toggleAll = (checked) => {
            if (checked) {
                // add all selectable rows (avoid duplicates)
                const newSelected = [...selectedRows];
                for (const r of selectable) {
                    if (!newSelected.some(s => s.id === r.id)) newSelected.push(r);
                }
                setSelectedRows(newSelected);
            } else {
                // remove all selectable rows
                setSelectedRows(prev => prev.filter(s => !selectableIds.has(s.id)));
            }
        };

        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    ref={el => {
                        if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                    style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                />
            </div>
        );
    };

    // Single-row checkbox template (bigger checkbox, disabled when not all PDFs exist)
    const canTick = (row) => {
    // Asset Monitor → InspectionDone → ReadyForAssessment
    if (
        effectiveRole === "Asset Monitor" &&
        row.uploadStatus === STATUS.INSPECTION_DONE
    ) {
        return true;
    }

    // Assessor → ReadyForAssessment → AssessedReadyForUpload
    if (
        effectiveRole === "Assessor" &&
        row.uploadStatus === STATUS.READY_FOR_ASSESSMENT
    ) {
        return true;
    }

    return false;
};


const isUploadSelectable = (row) => {
    return (
        effectiveRole === "Asset Monitor" &&
        row.uploadStatus === STATUS.ASSESSED_READY_FOR_UPLOAD &&
        hasAllPdfs(row)
    );
};

const canUpload =
    effectiveRole === "Asset Monitor" &&
    selectedRows.length > 0 &&
    selectedRows.every(
        r => r.uploadStatus === STATUS.ASSESSED_READY_FOR_UPLOAD
    );


    // Single-row checkbox template (bigger checkbox, disabled when not all PDFs exist)
const renderRowCheckbox = (row) => {
    const isChecked = selectedRows.some(r => r.id === row.id);
    const tickAllowed = canTick(row);
    const uploadAllowed = isUploadSelectable(row);

    const onChange = (e) => {
        e.stopPropagation();

        // ✅ STATUS TRANSITION (InspectionDone → ReadyForAssessment)
        if (
            effectiveRole === "Asset Monitor" &&
            row.uploadStatus === STATUS.INSPECTION_DONE
        ) {
            setTickTargetRow(row);
            setShowTickConfirmModal(true);
            return;
        }

        // ✅ STATUS TRANSITION (ReadyForAssessment → AssessedReadyForUpload)
        if (
            effectiveRole === "Assessor" &&
            row.uploadStatus === STATUS.READY_FOR_ASSESSMENT
        ) {
            setTickTargetRow(row);
            setShowTickConfirmModal(true);
            return;
        }

        // ✅ UPLOAD SELECTION ONLY
        if (uploadAllowed) {
            if (e.target.checked) {
                setSelectedRows(prev =>
                    prev.some(r => r.id === row.id)
                        ? prev
                        : [...prev, row]
                );
                setShowConfirmModal(true);
            } else {
                setSelectedRows(prev =>
                    prev.filter(r => r.id !== row.id)
                );
            }
        }
    };

    return (
        <div
            style={{ display: "flex", justifyContent: "center" }}
            onClick={(ev) => ev.stopPropagation()}
        >
            <input
                type="checkbox"
                checked={isChecked}
                disabled={!tickAllowed && !uploadAllowed}
                onChange={onChange}
                style={{
                    transform: "scale(1.35)",
                    cursor:
                        tickAllowed || uploadAllowed
                            ? "pointer"
                            : "not-allowed"
                }}
            />
        </div>
    );
};

    // Prevent row clicks from selecting (selection is only via checkbox)
    const onRowClick = (e) => {
        // do nothing — user explicitly wanted selection only via checkboxes
        e.originalEvent?.stopPropagation?.();
    };

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <Spinner animation="border" />
        </Container>
    );

    return (
        <Container fluid>
            <Card className="mt-3 mb-3">
                <Card.Header>Loco Dashboard</Card.Header>
                <Card.Body style={{ height: 640, width: "100%" }}>
                      <div className="d-flex justify-content-start mb-3">
                                            <Button variant="success" size="sm" onClick={handleExportToExcel} className="me-2">Export to Excel</Button>
                                            {(isAssessorMonitor || (isAdmin && effectiveRole === "Assessor Ticked")) && (
                                                <Button
                        variant="primary"
                        size="sm"
                        disabled={!canUpload}
                        onClick={() =>
                            selectedRows.length
                                ? setShowConfirmModal(true)
                                : setShowNoSelectModal(true)
                        }
                    >
                        Upload
                    </Button>
                       )}
                       <Button variant="success" size="sm" onClick={handlereUploadAll} className="me-2">Upload All Lines</Button>
                                          <Button variant="success" size="sm" onClick={handlereCalculateAll} className="me-2">Re-Calculate All Lines</Button>
                                          <Button
                           variant="success"
                           size="sm"
                           className="me-2"
                           onClick={() => setShowGenerateAllConfirm(true)}
                       >
                           Re-Generate All PDF's
                       </Button>
                       <br></br>
                                           {isAdmin && (
                                          <div className="d-flex align-items-center mb-2">
                        <span className="me-2 fw-bold">Role:</span>  
                        <Form.Select
                            size="sm"
                            value={adminMode}
                            onChange={(e) => {
                                setAdminMode(e.target.value);
                                setSelectedRows([]);
                                setDtFirst(0);
                                setStatusFilter(STATUS.INSPECTION_DONE);
                            }}
                            style={{ width: 220, marginLeft: 8 }}
                        >
                            <option value="Asset Monitor">Asset Monitor Role</option>
                            <option value="Assessor">Assessor Role</option>
                        </Form.Select>
                        </div>
                    )}
                    {(isAssessorMonitor || (effectiveRole === "Asset Monitor")) && (
                        <div className="d-flex align-items-center mb-2">
                        <span className="me-2 fw-bold">Status:</span>
                        <Dropdown
                            value={statusFilter}
                            options={statusOptions}
                            onChange={(e) => {
                                setStatusFilter(e.value);
                                setSelectedRows([]);
                                setDtFirst(0);
                            }}
                            style={{ width: 300 }}
                        />
                    </div>
                    
                    )}
                    
                                            <div style={{ marginLeft: 12, alignSelf: "center" }}>{selectedRows.length ? `${selectedRows.length} selected` : ""}</div>
                                               
                                        </div>
 <div className="d-flex justify-content-start mb-2">
                        <span className="p-input-icon-left">
                            <InputText
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                placeholder="Search Loco Number, Group, Inspector"
                                style={{ width: "500px" }}
                            />
                        </span>
                    </div>
                    <div style={{ position: "relative" }} ref={gridContainerRef}>
                        {/* overlay spinners */}
                        {(uploading || generatingPdf) && (
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
                                                    value={rowsWithId}
                                                    paginator
                                                    first={dtFirst}
                                                    rows={dtRows}
                                                    rowsPerPageOptions={[25, 50, 100, 200]}
                                                    onPage={(e) => {
                                                        setDtFirst(e.first);
                                                        setDtRows(e.rows);
                                                        saveScroll();
                                                    }}
                                                    className="p-datatable-sm p-datatable-striped"
                                                    scrollable
                                                    scrollHeight="510px"
                                                    dataKey="id"
                                                    rowClassName={rowClassName}
                                                    onRowClick={onRowClick}
                                                    filters={filters} 
                                                    filterDisplay="menu"
                            globalFilterFields={["locoNumber", "locoModel", "inspectorName"]} 
                                                >
                            {/* Checkbox column (custom checkbox) */}
<Column
    selectionMode={null}     // 🔥 IMPORTANT FIX: disables PrimeReact auto checkbox
    header={isAssessor || isAdmin ? "" : renderHeaderSelectAll()}
    headerStyle={{ width: '3rem' }}
    body={(row) => renderRowCheckbox(row)}
    style={{ width: '3rem' }}
/>
{(effectiveRole === "Asset Monitor") && statusFilter === STATUS.INSPECTION_DONE && (
    <Column
        header="Recalculate Values"
        body={(row) => {
            const isInsCompleted =
                row.uploadStatus === STATUS.INSPECTION_DONE;

            // ✅ Assessor → always allowed
            // ✅ Admin → only when inspection is completed
            if (effectiveRole === "Asset Monitor"  && isInsCompleted) {
                return (
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRecalculateClick(row);
                        }}
                    >
                        Recalculate
                    </Button>
                );
            }

            return null; // hide button
        }}
        style={{ minWidth: 150 }}
    />
)}

                            {/* Generate PDFs column — only visible to Assessors */}
                                                    {effectiveRole === "Asset Monitor" && (
                               <Column
                                   header="Generate PDFs"
                                   body={(row) => {
                                       const isReadyForAssessment =
                                           row.uploadStatus === STATUS.ASSESSED_READY_FOR_UPLOAD;
                           
                                       const alreadyGenerated = hasAllPdfs(row);
                           
                                       const disabled =
                                           !isReadyForAssessment || alreadyGenerated;
                           
                                       return (
                                           <Button
                                               size="sm"
                                               disabled={disabled}
                                               onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleGeneratePdfClick(row);
                                               }}
                                           >
                                               Generate
                                           </Button>
                                       );
                                   }}
                                   style={{ minWidth: 150 }}
                               />
                           )}
                            {/* All other columns are kept intact */}
                            {/* === Loco Details === */}
<Column field="locoNumber" header="Loco Number" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 180 }} />
<Column field="locoClass" header="Loco Class" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
<Column field="locoModel" header="Loco Model" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />
<Column field="inspectorName" header="Inspector" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />

{/* === Date & Time === */}
<Column field="dateAssessed" header="Date Completed" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 110 }} />
<Column field="timeAssessed" header="Time Completed" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 110 }} />
<Column field="startTimeInspect" header="Time Started" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 110 }} />

{/* === Location === */}
<Column field="gpsLatitude" header="GPS Latitude" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
<Column field="gpsLongitude" header="GPS Longitude" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
<Column field="city" header="City" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />

{/* === Media / Actions (NO FILTER) === */}
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

{/* === Value Columns (Right Aligned) === */}
<Column field="refurbishValue" header="Refurbish Value" sortable filter filterMatchMode="contains" showFilterMenu bodyClassName="text-right" style={{ minWidth: 120 }} />
<Column field="missingValue" header="Missing Value" sortable filter filterMatchMode="contains" showFilterMenu bodyClassName="text-right" style={{ minWidth: 120 }} />
<Column field="replaceValue" header="Replace Value" sortable filter filterMatchMode="contains" showFilterMenu bodyClassName="text-right" style={{ minWidth: 120 }} />
<Column field="totalLaborValue" header="Labor Value" sortable filter filterMatchMode="contains" showFilterMenu bodyClassName="text-right" style={{ minWidth: 120 }} />
<Column field="totalValue" header="Return to Service Cost" sortable filter filterMatchMode="contains" showFilterMenu bodyClassName="text-right" style={{ minWidth: 120 }} />
<Column field="marketValue" header="Benchmarking Value" sortable filter filterMatchMode="contains" showFilterMenu bodyClassName="text-right" style={{ minWidth: 140 }} />
<Column field="assetValue" header="Market Value" sortable filter filterMatchMode="contains" showFilterMenu bodyClassName="text-right" style={{ minWidth: 120 }} />

{/* === PDF Columns (NO FILTER) === */}
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
        ) : (
            <span>N/A</span>
        )
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
        ) : (
            <span>N/A</span>
        )
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
        ) : (
            <span>N/A</span>
        )
    }
/>

{/* === Status & Upload === */}
<Column field="uploadStatus" header="Loco Status" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />
<Column field="uploadDate" header="Upload Date" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 120 }} />

{/* === Missing / Replace Photos === */}
<Column
    header="Missing Photos"
    style={{ minWidth: 140 }}
    body={(row) => (
        <Button
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                handleOpenModal(row.missingPhotos, e);
            }}
        >
            View
        </Button>
    )}
/>

<Column
    header="Replace Photos"
    style={{ minWidth: 140 }}
    body={(row) => (
        <Button
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                handleOpenModal(row.replacePhotos, e);
            }}
        >
            View
        </Button>
    )}
/>

{/* === Condition Score (Editable Dropdown – NO FILTER) === */}
<Column
    header="Condition Score"
    style={{ minWidth: 140 }}
    body={(row) => (
        <Dropdown
            value={row.conditionScore}
            options={score}
            optionLabel="label"
            optionValue="value"
            itemTemplate={scoreTemplate}
            valueTemplate={scoreTemplate}
            placeholder="Select Score"
            disabled={effectiveRole === "Assessor"}
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

{/* === Calculated Fields === */}
<Column field="operationalStatus" header="Operational Status" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />
<Column field="calScore" header="Calculated Score" sortable filter filterMatchMode="contains" showFilterMenu style={{ minWidth: 140 }} />
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
<Modal show={showNoInput} onHide={() => setShowNoInput(false)}>
                <Modal.Header closeButton><Modal.Title>Missing Inputs</Modal.Title></Modal.Header>
                <Modal.Body>The inputs for this loco cannot be found. Therefore the PDFs cannot be generated. Please contact your administrator.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoInput(false)}>Close</Button></Modal.Footer>
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
<Modal show={showRecalSuccess} onHide={() => setShowRecalSuccess(false)}>
                <Modal.Header closeButton><Modal.Title>Values Recalculate</Modal.Title></Modal.Header>
                <Modal.Body>Missing values recalculated successfully.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowRecalSuccess(false)}>OK</Button>
                </Modal.Footer>
            </Modal>
            {/* Generate success modal */}
            <Modal show={showGenerateSuccessModal} onHide={() => setShowGenerateSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>PDFs Generated</Modal.Title></Modal.Header>
                <Modal.Body>All PDFs have been successfully generated.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowGenerateSuccessModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>

            {/* Tick Confirmation Modal */}
            <Modal show={showTickConfirmModal} onHide={() => setShowTickConfirmModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirm Tick</Modal.Title></Modal.Header>
                               <Modal.Body>
                   {tickTargetRow?.uploadStatus === STATUS.INSPECTION_DONE && (
                       <>
                           Are you sure you want to tick Loco{" "}
                           <b>{tickTargetRow?.locoNumber}</b> for{" "}
                           <b>Ready For Assessment</b>?
                       </>
                   )}
               
                   {tickTargetRow?.uploadStatus === STATUS.READY_FOR_ASSESSMENT && (
                       <>
                           Are you sure you want to tick Loco{" "}
                           <b>{tickTargetRow?.locoNumber}</b> for{" "}
                           <b>Assessed Ready For Upload</b>?
                       </>
                   )}
               </Modal.Body> <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTickConfirmModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={confirmTickWagon}>Confirm</Button>
                </Modal.Footer>
            </Modal>

            {/* Tick success modal */}
            <Modal show={showTickSuccessModal} onHide={() => setShowTickSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>Tick Successful</Modal.Title></Modal.Header>
                <Modal.Body>Loco was successfully ticked.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowTickSuccessModal(false)}>OK</Button>
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
                <Modal.Body>No PDF file is available for this selection.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoPdf(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* No Selection Modal */}
            <Modal show={showNoSelectModal} onHide={() => setShowNoSelectModal(false)}>
                <Modal.Header closeButton><Modal.Title>No Selection</Modal.Title></Modal.Header>
                <Modal.Body>Please select at least one row to perform this action.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoSelectModal(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* Upload Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirm Upload</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to upload the selected locos?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleUploadConfirmed}>Upload</Button>
                </Modal.Footer>
            </Modal>

            {/* Upload Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>Upload Successful</Modal.Title></Modal.Header>
                <Modal.Body>Locos have been successfully uploaded.</Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={() => setShowSuccessModal(false)}>OK</Button></Modal.Footer>
            </Modal>
        </Container>
    );
}