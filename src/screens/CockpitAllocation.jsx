import React, { useEffect, useState } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import axios from "../api/axios";



export default function CockpitAllocation() {
    const [loading, setLoading] = useState(false);

    const [assetTypes, setAssetTypes] = useState([]);
    const [teams, setTeams] = useState([]);
    const [assets, setAssets] = useState([]);

    const [selectedAssetType, setSelectedAssetType] = useState(null);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [selectedAssets, setSelectedAssets] = useState([]);

    /* 🔹 Initial Load */
    useEffect(() => {
        loadAssetTypes();
        loadTeams();
    }, []);

    const loadAssetTypes = async () => {
        const res = await axios.get(`cockpit-allocation/asset-types`);
        setAssetTypes(res.data);
    };

    const loadTeams = async () => {
        const res = await axios.get(`cockpit-allocation/teams`);
        setTeams(res.data);
    };

    /* 🔹 Load assets when asset type changes */
    const onAssetTypeChange = async (e) => {
        const type = e.value;
        setSelectedAssetType(type);
        setSelectedAssets([]);

        if (!type) return;

        const res = await axios.get(
            `cockpit-allocation/assets?assetType=${type}`
        );
        setAssets(res.data);
    };

    /* 🔹 Save allocation */
    const saveAllocation = async () => {
        if (!selectedAssetType || selectedTeams.length === 0 || selectedAssets.length === 0) {
            alert("Please select Asset Type, Teams and Assets");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`cockpit-allocation`, {
                assetType: selectedAssetType,
                teamIds: selectedTeams.map(t => t.id),
                assetIds: selectedAssets.map(a => a.id)
            });

            alert("Allocation saved successfully");
            setSelectedTeams([]);
            setSelectedAssets([]);
        } catch (err) {
            alert("Failed to save allocation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-3 shadow-sm">
            <h5 className="mb-3">🚦 Cockpit Allocation</h5>

            {/* Asset Type */}
            <div className="mb-3">
                <label className="form-label fw-bold">Asset Type *</label>
                <Dropdown
                    value={selectedAssetType}
                    options={assetTypes}
                    optionLabel="name"
                    optionValue="name"
                    placeholder="Select Asset Type"
                    className="w-100"
                    onChange={onAssetTypeChange}
                />
            </div>

            {/* Teams */}
            <div className="mb-3">
                <label className="form-label fw-bold">Teams *</label>
                <MultiSelect
    value={selectedTeams}
    options={teams}
    optionLabel="teamName"
    placeholder="Select Teams"
    display="chip"
    className="w-100"
    onChange={(e) => setSelectedTeams(e.value)}
/>

            </div>

            {/* Assets */}
            <div className="mb-3">
                <label className="form-label fw-bold">
                    {selectedAssetType ? `${selectedAssetType} List *` : "Assets *"}
                </label>
                <MultiSelect
    value={selectedAssets}
    options={assets}
    optionLabel="assetNumber"
    placeholder="Select Assets"
    filter
    filterDelay={300}
    display="chip"
    className="w-100"
    scrollHeight="300px"
    virtualScrollerOptions={{ itemSize: 36 }}
    maxSelectedLabels={3}
    onChange={(e) => setSelectedAssets(e.value)}
/>


            </div>

            {/* Save */}
            <div className="text-end">
                <Button
                    variant="primary"
                    disabled={loading}
                    onClick={saveAllocation}
                >
                    {loading ? <Spinner size="sm" /> : "Save Allocation"}
                </Button>
            </div>
        </Card>
    );
}
