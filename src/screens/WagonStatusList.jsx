import React, { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "react-bootstrap";
import ExcelJS from "exceljs";
import Loader from "../components/Loader";
const WagonStatusList = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
const [loading, setLoading] = useState(false);
  // Column Filters
  const [filters, setFilters] = useState({
    wagonNumber: "",
    wagonGroup: "",
    wagonType: "",
    status: "",
  });
const [phase, setPhase] = useState(
  localStorage.getItem("phase") || "1"
);
  useEffect(() => {
    loadData();
  }, [phase]);

  const loadData = async () => {
    try
    {
        setLoading(true);
    const res = await axios.get(
      "Dashboard/GetWagonStatusList",
      {
        params: { phase }   // ✅ send phase
      }
    );

    const data = res.data.map((item, index) => ({
      id: index + 1,
      ...item,
    }));
    setRows(data);
    }
    catch
    {

    }
    finally
    {
        setLoading(false);
    }
  };

  // Unique values for dropdown
  const uniqueValues = (field) =>
    [...new Set(rows.map((item) => item[field]))].filter(Boolean);

  // 🔍 FILTER logic (Search + Column Filters)
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Search text filter
      const matchesSearch = Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(search.toLowerCase())
      );

      // Column filters
      const matchesColumnFilters = Object.entries(filters).every(
        ([col, value]) => (value ? row[col] === value : true)
      );

      return matchesSearch && matchesColumnFilters;
    });
  }, [rows, search, filters]);

  // 📤 EXPORT TO EXCEL
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Wagon Status");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Wagon Number", key: "wagonNumber", width: 15 },
      { header: "Wagon Group", key: "wagonGroup", width: 15 },
      { header: "Wagon Type", key: "wagonType", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    filteredRows.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "Wagon_Status.xlsx";
    link.click();
  };

  // GRID columns
  const columns = [
    { field: "wagonNumber", headerName: "Wagon Number", width: 150 },
    { field: "wagonGroup", headerName: "Wagon Group", width: 150 },
    { field: "wagonType", headerName: "Wagon Type", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            color: "white",
            backgroundColor:
              params.value === "Incomplete" ? "#f39c12" : "#27ae60",
          }}
        >
          {params.value}
        </span>
      ),
    },
  ];

  return (
    <>
      {loading && <Loader fullscreen />}
    <div className="container mt-4">

      {/* Search & Export Buttons */}
     <div className="d-flex justify-content-between align-items-center mb-3">

  <div className="d-flex align-items-center gap-3">

    {/* 🔹 Phase Dropdown */}
    <div>
      <label className="me-2 fw-bold">Phase:</label>
      <select
        className="form-select d-inline-block"
        style={{ width: 200 }}
        value={phase}
        onChange={(e) => {
          setPhase(e.target.value);
          localStorage.setItem("phase", e.target.value);
        }}
      >
        <option value="1">Phase 1(Orginal Data)</option>
        <option value="2">Phase 2(TFR Data)</option>
        
      </select>
    </div>

    {/* 🔹 Search */}
    <input
      type="text"
      placeholder="Search..."
      className="form-control"
      style={{ width: 250 }}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

  </div>

  <Button variant="success" onClick={exportToExcel}>
    Export to Excel
  </Button>
</div>

      {/* Column Filters */}
      <div className="d-flex gap-3 mb-3">
        {/* Wagon Number Filter */}
        <select
          className="form-select"
          style={{ width: 180 }}
          value={filters.wagonNumber}
          onChange={(e) =>
            setFilters({ ...filters, wagonNumber: e.target.value })
          }
        >
          <option value="">All Wagon Numbers</option>
          {uniqueValues("wagonNumber").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* Wagon Group Filter */}
        <select
          className="form-select"
          style={{ width: 180 }}
          value={filters.wagonGroup}
          onChange={(e) =>
            setFilters({ ...filters, wagonGroup: e.target.value })
          }
        >
          <option value="">All Wagon Groups</option>
          {uniqueValues("wagonGroup").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* Wagon Type Filter */}
        <select
          className="form-select"
          style={{ width: 180 }}
          value={filters.wagonType}
          onChange={(e) =>
            setFilters({ ...filters, wagonType: e.target.value })
          }
        >
          <option value="">All Wagon Types</option>
          {uniqueValues("wagonType").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="form-select"
          style={{ width: 180 }}
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">All Status</option>
          {uniqueValues("status").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      <div
        style={{
          height: 500,
          width: "100%",
          background: "#fff",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          disableRowSelectionOnClick
        />
      </div>
    </div>
    </>
  );
};

export default WagonStatusList;
