import type {
    InterpolationResult,
    DerivativeResult,
} from "../../types/tabular";

type TaskType = "interpolation" | "differentiation";

interface ResultsTableProps {
    task: TaskType;
    interpolationResult: InterpolationResult | null;
    derivativeResult: DerivativeResult | null;
}

export function ResultsTable({
    task,
    interpolationResult,
    derivativeResult,
}: ResultsTableProps) {
    const hasInterpolation = task === "interpolation" && interpolationResult;
    const hasDerivative = task === "differentiation" && derivativeResult;

    return (
        <section>
            <h2>Results (table)</h2>

            {!hasInterpolation && !hasDerivative && (
                <p>No results computed yet.</p>
            )}

            {hasInterpolation && interpolationResult && (
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>X</th>
                            <th>F(X)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interpolationResult.X.map((x, i) => (
                            <tr key={i}>
                                <td>{x}</td>
                                <td>{interpolationResult.F[i]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {hasDerivative && derivativeResult && (
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>X</th>
                            <th>F&apos;(X)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {derivativeResult.X.map((x, i) => (
                            <tr key={i}>
                                <td>{x}</td>
                                <td>{derivativeResult.Fd[i]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
