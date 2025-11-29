import type {
    TabularFunction,
    PointsToEvaluate,
    DerivativeResult,
} from "./tabular";

export type DifferentiationMethod = "interpolation5" | "approximation5";

export interface DifferentiationRequest {
    method: DifferentiationMethod;
    table: TabularFunction;
    X: PointsToEvaluate;
}

export interface DifferentiationSummary {
    method: DifferentiationMethod;
    input: {
        table: TabularFunction;
        X: PointsToEvaluate;
    };
    output: DerivativeResult;
}
