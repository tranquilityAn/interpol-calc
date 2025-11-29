import type {
    TabularFunction,
    PointsToEvaluate,
    InterpolationResult,
} from "./tabular";

export type InterpolationMethod = "lagrange" | "newton";

// конфіг для виклику інтерполятора 
export interface InterpolationRequest {
    method: InterpolationMethod;
    table: TabularFunction;
    X: PointsToEvaluate;
}

export interface InterpolationSummary {
    method: InterpolationMethod;
    input: {
        table: TabularFunction;
        X: PointsToEvaluate;
    };
    output: InterpolationResult;
}
