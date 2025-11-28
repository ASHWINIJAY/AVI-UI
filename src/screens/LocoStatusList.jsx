import React, { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "react-bootstrap";
import ExcelJS from "exceljs";
import Loader from "../components/Loader";
const LocoStatusList = () => {
  const [rows, setRows] = useState([]);

  // Search
  const [search, setSearch] = useState("");
const [loading, setLoading] = useState(false);
  // Column Filters (camelCase)
  const [filters, setFilters] = useState({
    locoNumber: "",
    locoType: "",
    locoModel: "",
    status: "",
  });

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try
    {
        setLoading(true);
    const res = await axios.get("Dashboard/GetLocoStatusList");

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

  // Get unique values for dropdown
  const uniqueValues = (field) =>
    [...new Set(rows.map((item) => item[field]))].filter(Boolean);

  // Combined Filters
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      );

      const matchesColumnFilters = Object.entries(filters).every(
        ([col, value]) => (value ? row[col] === value : true)
      );

      return matchesSearch && matchesColumnFilters;
    });
  }, [rows, search, filters]);

  // Export to Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Loco Status");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Loco Number", key: "locoNumber", width: 15 },
      { header: "Loco Type", key: "locoType", width: 15 },
      { header: "Loco Model", key: "locoModel", width: 15 },
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
    link.download = "Loco_Status.xlsx";
    link.click();
  };

  // DataGrid Columns
  const columns = [
    { field: "locoNumber", headerName: "Loco Number", width: 140 },
    { field: "locoType", headerName: "Loco Type", width: 130 },
    { field: "locoModel", headerName: "Loco Model", width: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            color: "#fff",
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
  
      {/* Search + Export */}
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button variant="success" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </div>

      {/* Dropdown Filters */}
      <div className="d-flex gap-3 mb-3">
        {/* Loco Number */}
        <select
          className="form-select"
          style={{ width: 150 }}
          value={filters.locoNumber}
          onChange={(e) =>
            setFilters({ ...filters, locoNumber: e.target.value })
          }
        >
          <option value="">All Loco Numbers</option>
          {uniqueValues("locoNumber").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* Loco Type */}
        <select
          className="form-select"
          style={{ width: 150 }}
          value={filters.locoType}
          onChange={(e) =>
            setFilters({ ...filters, locoType: e.target.value })
          }
        >
          <option value="">All Loco Types</option>
          {uniqueValues("locoType").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* Loco Model */}
        <select
          className="form-select"
          style={{ width: 150 }}
          value={filters.locoModel}
          onChange={(e) =>
            setFilters({ ...filters, locoModel: e.target.value })
          }
        >
          <option value="">All Models</option>
          {uniqueValues("locoModel").map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          className="form-select"
          style={{ width: 150 }}
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

      {/* DATAGRID */}
      <div
        style={{
          height: 500,
          width: "100%",
          background: "#fff",
          padding: 10,
          borderRadius: 8,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </div>
    </div>
    </>
  );
};

export default LocoStatusList;
