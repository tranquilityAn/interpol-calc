import type {
    TabularFunction,
    PointsToEvaluate,
    DerivativeResult,
} from "../../types/tabular";
import type { DifferentiationMethod } from "../../types/differentiation";
import { MethodNotSupportedError } from "../../types/errors";

import {
    differentiateByInterpolation5,
    differentiateByInterpolation5Raw,
} from "./interpolation5";

import {
    differentiateByApproximation5,
    differentiateByApproximation5Raw,
} from "./approximation5";

/**
 * High-level differentiation function.
 *
 * Input:
 *   method: 'interpolation5' | 'approximation5'
 *   table:  { x: number[]; f: number[] }
 *   X:      number[]    // points where derivative is needed
 *
 * Output:
 *   { X, Fd } where Fd[k] = f'(X[k]) for the chosen method
 */
export function differentiate(
    method: DifferentiationMethod,
    table: TabularFunction,
    X: PointsToEvaluate
): DerivativeResult {
    switch (method) {
        case "interpolation5":
            return differentiateByInterpolation5(table, X);
        case "approximation5":
            return differentiateByApproximation5(table, X);
        default:
            // Теоретично TS не дасть сюди дійти, але на всяк випадок
            throw new MethodNotSupportedError(
                `Differentiation method "${String(method)}" is not supported.`
            );
    }
}

/**
 * Convenience wrapper that matches the "task-style" signature:
 *
 *   x: given arguments (nodes)
 *   f: given function values
 *   X: arguments where we want to compute derivative
 *
 * Returns:
 *   F: computed derivative values in points X
 *
 * (В умові Task 3/4 це F, у нас внутрішня назва — Fd.)
 */
export function differentiateRaw(
    method: DifferentiationMethod,
    x: number[],
    f: number[],
    X: number[]
): number[] {
    switch (method) {
        case "interpolation5":
            return differentiateByInterpolation5Raw(x, f, X);
        case "approximation5":
            return differentiateByApproximation5Raw(x, f, X);
        default:
            throw new MethodNotSupportedError(
                `Differentiation method "${String(method)}" is not supported.`
            );
    }
}

export {
    differentiateByInterpolation5,
    differentiateByInterpolation5Raw,
    differentiateByApproximation5,
    differentiateByApproximation5Raw,
};
export { buildDifferentiationMethodsSummary } from "./methodsSummary";
