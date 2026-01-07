import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import axios from "../api/axios";

export default function CockpitGlobalSettings() {
    const [isEnabled, setIsEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // -----------------------------
    // Load global cockpit status
    // -----------------------------
    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        setLoading(true);
        try {
            const res = await axios.get("cockpit-allocation/enable-cockpit");
            setIsEnabled(res.data.isEnabled);
        } catch {
            setMessage({ type: "danger", text: "Failed to load cockpit status" });
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // Toggle handler
    // -----------------------------
    const toggleCockpit = async (checked) => {
        setIsEnabled(checked);
        setMessage(null);

        try {
            await axios.post("cockpit-allocation/enable-cockpit", {
                isEnabled: checked
            });

            setMessage({
                type: "success",
                text: `Cockpit Features successfully ${checked ? "ENABLED" : "DISABLED"}`
            });
        } catch {
            setIsEnabled(!checked); // rollback
            setMessage({
                type: "danger",
                text: "Failed to update cockpit status"
            });
        }
    };

    return (
        <Card className="p-4 shadow-sm" style={{ maxWidth: 500 }}>
            <h5 className="mb-3">⚙️ Cockpit Global Settings</h5>

            {loading && (
                <div className="mb-3">
                    <Spinner size="sm" /> Loading status...
                </div>
            )}

            {message && (
                <Alert variant={message.type} className="py-2">
                    {message.text}
                </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Enable Cockpit</strong>
                    <div className="text-muted small">
                        Applies to entire system
                    </div>
                </div>

                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="cockpitGlobalSwitch"
                        checked={isEnabled}
                        onChange={(e) => toggleCockpit(e.target.checked)}
                    />
                    <label
                        className="form-check-label"
                        htmlFor="cockpitGlobalSwitch"
                    >
                        {isEnabled ? "Enabled" : "Disabled"}
                    </label>
                </div>
            </div>
        </Card>
    );
}
