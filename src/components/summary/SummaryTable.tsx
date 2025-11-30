import React from "react";

import type { InterpolationMethodsSummary } from "../../types/interpolation";
import type { DifferentiationMethodsSummary } from "../../types/differentiation";

type TaskType = "interpolation" | "differentiation";

interface SummaryTableProps {
    task: TaskType;
    interpolationSummary: InterpolationMethodsSummary | null;
    differentiationSummary: DifferentiationMethodsSummary | null;
}

function formatNumber(value: number, digits: number = 16): string {
    if (!Number.isFinite(value)) {
        return "—";
    }
    return value.toFixed(digits);
}

export const SummaryTable: React.FC<SummaryTableProps> = ({
    task,
    interpolationSummary,
    differentiationSummary,
}) => {
    // ========== INTERPOLATION MODE ==========
    if (task === "interpolation") {
        if (!interpolationSummary || interpolationSummary.rows.length === 0) {
            return null;
        }

        const { rows, meanAbsDiff, maxAbsDiff } = interpolationSummary;

        return (
            <section className="summary-section">
                <h2 className="summary-title">
                    Summary Table (Interpolation Methods Comparison)
                </h2>

                <p className="summary-stats">
                    Mean Absolute Difference:{" "}
                    <strong>{formatNumber(meanAbsDiff)}</strong>
                    {" · "}
                    Maximum Absolute Difference:{" "}
                    <strong>{formatNumber(maxAbsDiff)}</strong>
                </p>

                <div className="summary-table-wrapper">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th>X</th>
                                <th>Lagrange F(X)</th>
                                <th>Newton F(X)</th>
                                <th>|Δ| = |L − N|</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <td>{formatNumber(row.X)}</td>
                                    <td>{formatNumber(row.lagrange)}</td>
                                    <td>{formatNumber(row.newton)}</td>
                                    <td>{formatNumber(row.absDiff)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }

    // ========== DIFFERENTIATION MODE ==========
    if (!differentiationSummary || differentiationSummary.rows.length === 0) {
        return null;
    }

    const { rows, meanAbsDiff, maxAbsDiff } = differentiationSummary;
    const hasStats = meanAbsDiff != null && maxAbsDiff != null;

    return (
        <section className="summary-section">
            <h2 className="summary-title">
                Summary Table (Differentiation Methods Comparison)
            </h2>

            {hasStats ? (
                <p className="summary-stats">
                    Mean Absolute Difference:{" "}
                    <strong>{formatNumber(meanAbsDiff!)}</strong>
                    {" · "}
                    Maximum Absolute Difference:{" "}
                    <strong>{formatNumber(maxAbsDiff!)}</strong>
                </p>
            ) : (
                <p className="summary-stats">
                    Statistics cannot be computed: at least one of the methods
                    did not produce valid derivative values for the given points
                    (e.g., the approximation method requires an almost uniform
                    grid).
                </p>
            )}

            <div className="summary-table-wrapper">
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>X</th>
                            <th>Interpolation (5 nodes) F′(X)</th>
                            <th>Approximation (5 nodes) F′(X)</th>
                            <th>|Δ| = |I − A|</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td>{formatNumber(row.X)}</td>
                                <td>
                                    {row.interpolation5 != null
                                        ? formatNumber(row.interpolation5)
                                        : "N/A"}
                                </td>
                                <td>
                                    {row.approximation5 != null
                                        ? formatNumber(row.approximation5)
                                        : "N/A"}
                                </td>
                                <td>
                                    {row.absDiff != null
                                        ? formatNumber(row.absDiff)
                                        : "N/A"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
