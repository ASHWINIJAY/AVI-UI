import React, { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import axios from "../api/axios";

export default function CockpitAllocationByRefNo() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // -----------------------------
    // Filters (row filters only)
    // -----------------------------
    const [filters, setFilters] = useState({
        refNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        assetType: { value: null, matchMode: FilterMatchMode.EQUALS },
        teamNames: { value: null, matchMode: FilterMatchMode.CONTAINS },
        assetNumbers: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    // -----------------------------
    // Load ALL allocations
    // -----------------------------
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await axios.get("cockpit-allocation/grouped");
            setData(res.data);
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // Delete by RefNo
    // -----------------------------
    const deleteByRefNo = async (refNo) => {
        if (!window.confirm(`Delete allocation ${refNo}?`)) return;

        await axios.get(`cockpit-allocation/by-refno/${refNo}`);
        loadData();
    };

    // -----------------------------
    // Column templates
    // -----------------------------
    const snoTemplate = (row, options) => options.rowIndex + 1;

    const actionTemplate = (row) => (
        <Button
            size="sm"
            variant="danger"
            onClick={() => deleteByRefNo(row.refNo)}
        >
            Delete
        </Button>
    );

    return (
        <Card className="p-3 shadow-sm">
            <h5 className="mb-3">📋 Cockpit Allocation List</h5>

            <DataTable
                value={data}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 25, 50]}
                responsiveLayout="scroll"
                filters={filters}
                filterDisplay="row"
                onFilter={(e) => setFilters(e.filters)}
                emptyMessage="No allocations found"
            >
                <Column
                    header="S.No"
                    body={snoTemplate}
                    style={{ width: 70 }}
                />

                <Column
                    field="refNo"
                    header="Ref No"
                    filter
                    filterPlaceholder="Ref No"
                />

                <Column
                    field="assetType"
                    header="Asset Type"
                    filter
                    showFilterMenu={false}
                    filterElement={(options) => (
                        <Dropdown
                            value={options.value}
                            options={[
                                { label: "Wagon", value: "Wagon" },
                                { label: "Loco", value: "Loco" }
                            ]}
                            onChange={(e) =>
                                options.filterApplyCallback(e.value)
                            }
                            placeholder="Select"
                            className="p-column-filter"
                        />
                    )}
                />

                <Column
                    field="teamNames"
                    header="Teams Name"
                    filter
                    filterPlaceholder="Teams"
                />

                <Column
                    field="assetNumbers"
                    header="List Of Assets"
                    filter
                    filterPlaceholder="Assets"
                />

                <Column
                    header="Action"
                    body={actionTemplate}
                    style={{ width: 120 }}
                />
            </DataTable>
        </Card>
    );
}
