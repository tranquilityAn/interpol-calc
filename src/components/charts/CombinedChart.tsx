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

export function CombinedChart({
    task,
    table,
    X,
    interpolationResult,
    derivativeResult,
}: CombinedChartProps) {
    const hasTable = !!table?.x.length && !!table?.f.length;
    const hasX = !!X?.length;
    const hasInterp = task === "interpolation" && !!interpolationResult;
    const hasDeriv = task === "differentiation" && !!derivativeResult;

    if (!hasTable) {
        return (
            <section>
                <h2>Results (graph)</h2>
                <p>No base tabulated data.</p>
            </section>
        );
    }

    if (!hasX || (!hasInterp && !hasDeriv)) {
        return (
            <section>
                <h2>Results (graph)</h2>
                <p>No computed values to visualize.</p>
            </section>
        );
    }

    interface ChartPoint {
        x: number;
        result?: number;
    }

    // Build separate datasets for the two series
    const originalData = table!.x.map((x, i) => ({
        x,
        original: table!.f[i],
    }));

    let resultData: ChartPoint[] = [];

    if (hasInterp && interpolationResult) {
        resultData = interpolationResult.X.map((x, i) => ({
            x,
            result: interpolationResult.F[i],
        }));
    } else if (hasDeriv && derivativeResult) {
        resultData = derivativeResult.X.map((x, i) => ({
            x,
            result: derivativeResult.Fd[i],
        }));
    }

    const resultLabel =
        task === "interpolation" ? "Interpolated F(X)" : "Derivative F'(X)";

    return (
        <section>
            <h2>Results (graph)</h2>
            <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                    <LineChart
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="4 4" />

                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={["auto", "auto"]}
                            label={{
                                value: "x",
                                position: "insideBottom",
                                offset: -5,
                            }}
                        />
                        <YAxis />

                        <Tooltip />
                        <Legend />

                        {/* ORIGINAL FUNCTION */}
                        <Line
                            name="Tabulated f(x)"
                            data={originalData}
                            type="monotone"
                            dataKey="original"
                            stroke="#4361ee"
                            strokeWidth={2}
                            strokeDasharray="0"
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />

                        {/* RESULT FUNCTION */}
                        <Line
                            name={resultLabel}
                            data={resultData}
                            type="monotone"
                            dataKey="result"
                            stroke={task === "interpolation" ? "#e63946" : "#2a9d8f"}
                            strokeWidth={2}
                            strokeDasharray={"10 4 2 4"}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
