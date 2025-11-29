import { type ChangeEvent, useState } from "react";
import type { TabularFunction, PointsToEvaluate } from "../../types/tabular";
import type { AppError } from "../../types/ui";

import { parseTabularFile } from "../../modules/fileParsing";
import { TabularDataError } from "../../types/errors";
import {
    validateTabular,
    validatePointsToEvaluate,
} from "../../modules/validation";

interface DataSectionProps {
    onDataChange: (
        table: TabularFunction | null,
        X: PointsToEvaluate | null
    ) => void;
    onErrorsChange: (errors: AppError[]) => void;
}

type InputMode = "file" | "manual";

export function DataSection({
    onDataChange,
    onErrorsChange,
}: DataSectionProps) {
    const [mode, setMode] = useState<InputMode>("file");
    const [fileName, setFileName] = useState<string | null>(null);

    // Manual input state
    const [manualX, setManualX] = useState("");
    const [manualF, setManualF] = useState("");
    const [manualEvalX, setManualEvalX] = useState("");

    const pushError = (message: string) => {
        const error: AppError = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            message,
        };
        onErrorsChange([error]);
    };

    const clearErrors = () => {
        onErrorsChange([]);
    };

    const clearData = () => {
        onDataChange(null, null);
    };

    const handleModeChange = (nextMode: InputMode) => {
        setMode(nextMode);
        clearErrors();
        clearData();
        // We don't reset manual inputs / filename, user might want to switch back
    };

    // ---------- FILE MODE ----------

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setFileName(file.name);
        clearErrors();

        const reader = new FileReader();

        reader.onload = () => {
            const content = reader.result;
            if (typeof content !== "string") {
                pushError("Failed to read file content as text.");
                clearData();
                return;
            }

            try {
                // 1. Parse file into table + X
                const parsed = parseTabularFile(content);
                const { table, X } = parsed;

                // 2. Validate base tabular data (x, f)
                validateTabular(table);

                // 3. Validate evaluation points X
                validatePointsToEvaluate(table, X, {
                    requireInRange: false,
                });

                onDataChange(table, X);
                clearErrors();
            } catch (error) {
                console.error("Error while parsing/validating file:", error);
                clearData();

                if (error instanceof TabularDataError) {
                    pushError(error.message);
                } else if (error instanceof Error) {
                    pushError(
                        error.message ||
                            "Unknown error while processing the file."
                    );
                } else {
                    pushError("Unknown error while processing the file.");
                }
            }
        };

        reader.onerror = () => {
            console.error("FileReader error", reader.error);
            clearData();
            pushError("Failed to read file.");
        };

        reader.readAsText(file);
    };

    const handleClearFile = () => {
        setFileName(null);
        clearData();
        clearErrors();
    };

    // ---------- MANUAL MODE ----------

    const parseManualArray = (input: string, label: string): number[] => {
        const trimmed = input.trim();
        if (!trimmed) {
            throw new TabularDataError(`${label} is empty.`);
        }

        const tokens = trimmed.split(/\s+/).filter(Boolean);
        if (!tokens.length) {
            throw new TabularDataError(`${label} is empty.`);
        }

        const values: number[] = [];
        for (const token of tokens) {
            const normalized = token.replace(",", ".");
            const value = Number(normalized);
            if (Number.isNaN(value)) {
                throw new TabularDataError(
                    `Cannot parse value "${token}" in ${label}. Use numbers with "." or "," as decimal separator.`
                );
            }
            values.push(value);
        }

        return values;
    };

    const handleApplyManual = () => {
        clearErrors();

        try {
            const xValues = parseManualArray(manualX, "X row");
            const fValues = parseManualArray(manualF, "F row");

            if (xValues.length !== fValues.length) {
                throw new TabularDataError(
                    `X and F must have the same length. Got X length = ${xValues.length}, F length = ${fValues.length}.`
                );
            }

            const table: TabularFunction = { x: xValues, f: fValues };

            // Validate tabular data
            validateTabular(table);

            // Evaluation points X may be empty → then we'll fail later on "Compute"
            let evalPoints: PointsToEvaluate = [];
            if (manualEvalX.trim()) {
                evalPoints = parseManualArray(
                    manualEvalX,
                    "Evaluation points X"
                );
            }

            validatePointsToEvaluate(table, evalPoints, {
                requireInRange: false,
            });

            onDataChange(table, evalPoints);
        } catch (error) {
            console.error(
                "Error while parsing/validating manual input:",
                error
            );
            clearData();

            if (error instanceof TabularDataError) {
                pushError(error.message);
            } else if (error instanceof Error) {
                pushError(
                    error.message || "Unknown error while processing the input."
                );
            } else {
                pushError("Unknown error while processing the input.");
            }
        }
    };

    const handleClearManual = () => {
        setManualX("");
        setManualF("");
        setManualEvalX("");
        clearData();
        clearErrors();
    };

    // ---------- RENDER ----------

    return (
        <section>
            <h2>3. Input data</h2>

            {/* Mode switch */}
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                }}
            >
                <button
                    type="button"
                    className={mode === "file" ? "btn btn-primary" : "btn"}
                    onClick={() => handleModeChange("file")}
                >
                    Load from file
                </button>
                <button
                    type="button"
                    className={mode === "manual" ? "btn btn-primary" : "btn"}
                    onClick={() => handleModeChange("manual")}
                >
                    Enter manually
                </button>
            </div>

            {mode === "file" && (
                <>
                    <p>
                        Upload a text file with tabulated data in the following
                        format (spaces or tabs between values):
                    </p>
                    <pre className="example-block">
                        x 0,43 0,48 0,55 0,62 0,70 0,75{"\n"}f 1,63597 1,73234
                        1,87686 2,03345 2,22846 2,35973{"\n"}X 0,702 0,645 0,608
                        0,512 0,736 0,750
                    </pre>
                    <ul>
                        <li>
                            The first token in a row must be <code>x</code>,{" "}
                            <code>f</code> or <code>X</code>.
                        </li>
                        <li>
                            Decimal separator can be <code>.</code> or{" "}
                            <code>,</code>.
                        </li>
                        <li>
                            Rows <code>x</code> and <code>f</code> are required.
                            Row <code>X</code> is optional.
                        </li>
                    </ul>

                    <div
                        style={{
                            marginTop: "0.75rem",
                            display: "flex",
                            gap: "0.75rem",
                        }}
                    >
                        <input
                            type="file"
                            accept=".txt,.dat,.csv,.tsv"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            className="btn"
                            onClick={handleClearFile}
                        >
                            Clear
                        </button>
                    </div>

                    {fileName && (
                        <p style={{ marginTop: "0.5rem" }}>
                            Loaded file: <strong>{fileName}</strong>
                        </p>
                    )}
                </>
            )}

            {mode === "manual" && (
                <>
                    <p>
                        Enter values as space-separated numbers. Decimal
                        separator can be <code>.</code> or <code>,</code>.
                    </p>

                    <div style={{ marginTop: "0.75rem" }}>
                        <label>
                            <strong>X nodes (x):</strong>
                        </label>
                        <textarea
                            rows={2}
                            style={{ width: "100%", marginTop: "0.25rem" }}
                            placeholder="e.g. 0.43 0.48 0.55 0.62 0.70 0.75"
                            value={manualX}
                            onChange={(e) => setManualX(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: "0.75rem" }}>
                        <label>
                            <strong>Function values (f):</strong>
                        </label>
                        <textarea
                            rows={2}
                            style={{ width: "100%", marginTop: "0.25rem" }}
                            placeholder="e.g. 1.63597 1.73234 1.87686 2.03345 2.22846 2.35973"
                            value={manualF}
                            onChange={(e) => setManualF(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: "0.75rem" }}>
                        <label>
                            <strong>Evaluation points (X):</strong>{" "}
                            <span style={{ color: "#666", fontSize: "0.9rem" }}>
                                (optional, but required before computation)
                            </span>
                        </label>
                        <textarea
                            rows={2}
                            style={{ width: "100%", marginTop: "0.25rem" }}
                            placeholder="e.g. 0.702 0.645 0.608 0.512 0.736 0.750"
                            value={manualEvalX}
                            onChange={(e) => setManualEvalX(e.target.value)}
                        />
                    </div>

                    <div
                        style={{
                            marginTop: "0.75rem",
                            display: "flex",
                            gap: "0.75rem",
                            justifyContent: "flex-start",
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleApplyManual}
                        >
                            Apply manual data
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={handleClearManual}
                        >
                            Clear
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
