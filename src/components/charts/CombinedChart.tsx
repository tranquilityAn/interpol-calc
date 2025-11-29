// import type {
//     TabularFunction,
//     PointsToEvaluate,
//     InterpolationResult,
//     DerivativeResult,
// } from "../../types/tabular";

// type TaskType = "interpolation" | "differentiation";

// interface CombinedChartProps {
//     task: TaskType;
//     table: TabularFunction | null;
//     X: PointsToEvaluate | null;
//     interpolationResult: InterpolationResult | null;
//     derivativeResult: DerivativeResult | null;
// }

// export function CombinedChart({
//     task,
//     table,
//     X,
//     interpolationResult,
//     derivativeResult,
// }: CombinedChartProps) {
//     const hasData =
//         !!table && !!X && (!!interpolationResult || !!derivativeResult);

//     return (
//         <section>
//             <h2>Results (graph)</h2>
//             {!hasData && <p>Not enough data to build a chart.</p>}
//             {hasData && (
//                 <div className="chart-placeholder">
//                     <p>
//                         A chart of the original tabulated function and the
//                         computed result for the selected task ({task}) will be
//                         displayed here.
//                     </p>
//                 </div>
//             )}
//         </section>
//     );
// }
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import type {
    TabularFunction,
    PointsToEvaluate,
    InterpolationResult,
    DerivativeResult,
} from "../../types/tabular";

type TaskType = "interpolation" | "differentiation";

interface CombinedChartProps {
    task: TaskType;
    table: TabularFunction | null;
    X: PointsToEvaluate | null;
    interpolationResult: InterpolationResult | null;
    derivativeResult: DerivativeResult | null;
}

interface ChartPoint {
    x: number;
    original?: number;
    result?: number;
}

export function CombinedChart({
    task,
    table,
    X,
    interpolationResult,
    derivativeResult,
}: CombinedChartProps) {
    const hasBaseData = !!table && !!table.x.length && !!table.f.length;
    const hasEvalPoints = !!X && X.length > 0;
    const hasInterpolation = task === "interpolation" && !!interpolationResult;
    const hasDerivative = task === "differentiation" && !!derivativeResult;

    if (!hasBaseData) {
        return (
            <section>
                <h2>Results (graph)</h2>
                <p>No base tabular data to display a chart.</p>
            </section>
        );
    }

    if (!hasEvalPoints || (!hasInterpolation && !hasDerivative)) {
        return (
            <section>
                <h2>Results (graph)</h2>
                <p>
                    Not enough computed data to display a chart. Load data and
                    run computation first.
                </p>
            </section>
        );
    }

    // Build a combined dataset for Recharts:
    // - original tabular function: x vs f
    // - result: X vs F or F'
    const dataMap = new Map<number, ChartPoint>();

    // 1) Original tabular points
    table!.x.forEach((xVal, i) => {
        const yVal = table!.f[i];
        const existing = dataMap.get(xVal) || { x: xVal };
        existing.original = yVal;
        dataMap.set(xVal, existing);
    });

    // 2) Result points (interpolation or derivative)
    if (hasInterpolation && interpolationResult) {
        interpolationResult.X.forEach((xVal, i) => {
            const yVal = interpolationResult.F[i];
            const existing = dataMap.get(xVal) || { x: xVal };
            existing.result = yVal;
            dataMap.set(xVal, existing);
        });
    } else if (hasDerivative && derivativeResult) {
        derivativeResult.X.forEach((xVal, i) => {
            const yVal = derivativeResult.Fd[i];
            const existing = dataMap.get(xVal) || { x: xVal };
            existing.result = yVal;
            dataMap.set(xVal, existing);
        });
    }

    const chartData = Array.from(dataMap.values()).sort((a, b) => a.x - b.x);

    const resultLabel =
        task === "interpolation" ? "Interpolated F(X)" : "Derivative F'(X)";

    return (
        <section>
            <h2>Results (graph)</h2>
            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="x"
                            label={{
                                value: "x",
                                position: "insideBottom",
                                offset: -5,
                            }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />

                        {/* Original tabulated function */}
                        <Line
                            type="monotone"
                            dataKey="original"
                            name="Tabulated f(x)"
                            dot={{ r: 3 }}
                            strokeWidth={2}
                        />

                        {/* Result: interpolated or derivative */}
                        <Line
                            type="monotone"
                            dataKey="result"
                            name={resultLabel}
                            dot={{ r: 3 }}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
