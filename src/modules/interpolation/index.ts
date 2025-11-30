import type {
    TabularFunction,
    PointsToEvaluate,
    InterpolationResult,
} from "../../types/tabular";
import type { InterpolationMethod } from "../../types/interpolation";
import { MethodNotSupportedError } from "../../types/errors";

import { interpolateLagrange, interpolateLagrangeRaw } from "./lagrange";
import { interpolateNewton, interpolateNewtonRaw } from "./newton";

/**
 * High-level interpolation function.
 *
 * Input:
 *   method: 'lagrange' | 'newton'
 *   table:  { x: number[]; f: number[] }
 *   X:      number[]
 *
 * Output:
 *   { X, F } where F[k] = P(X[k]) for the chosen method
 */
export function interpolate(
    method: InterpolationMethod,
    table: TabularFunction,
    X: PointsToEvaluate
): InterpolationResult {
    switch (method) {
        case "lagrange":
            return interpolateLagrange(table, X);
        case "newton":
            return interpolateNewton(table, X);
        default:
            throw new MethodNotSupportedError(
                `Interpolation method "${String(method)}" is not supported.`
            );
    }
}

/**
 * Convenience wrapper that matches the "task-style" signature:
 *
 *   x: given arguments (nodes)
 *   f: given function values
 *   X: arguments where we want to compute F
 *
 * Returns:
 *   F: computed function values in points X
 */
export function interpolateRaw(
    method: InterpolationMethod,
    x: number[],
    f: number[],
    X: number[]
): number[] {
    switch (method) {
        case "lagrange":
            return interpolateLagrangeRaw(x, f, X);
        case "newton":
            return interpolateNewtonRaw(x, f, X);
        default:
            throw new MethodNotSupportedError(
                `Interpolation method "${String(method)}" is not supported.`
            );
    }
}

export {
    interpolateLagrange,
    interpolateLagrangeRaw,
    interpolateNewton,
    interpolateNewtonRaw,
};
export { buildInterpolationMethodsSummary } from "./methodsSummary";
