// modules/interpolation/newton.ts

import type {
    TabularFunction,
    PointsToEvaluate,
    InterpolationResult,
} from "../../types/tabular";
import { validateTabular, validatePointsToEvaluate } from "../validation";

/**
 * Builds Newton interpolation coefficients using divided differences.
 *
 * Input:
 *   x: nodes
 *   f: function values at nodes
 *
 * Output:
 *   coef: coefficients of Newton polynomial
 *         coef[0] = f[x0]
 *         coef[1] = f[x0, x1]
 *         ...
 *         coef[n-1] = f[x0, x1, ..., x_{n-1}]
 */
export function buildNewtonCoefficients(x: number[], f: number[]): number[] {
    const n = x.length;
    // Work on a copy to avoid modifying original f
    const coef = [...f];

    // In-place computation of divided differences
    for (let j = 1; j < n; j++) {
        for (let i = n - 1; i >= j; i--) {
            coef[i] = (coef[i] - coef[i - 1]) / (x[i] - x[i - j]);
        }
    }

    return coef;
}

/**
 * Evaluates Newton interpolation polynomial at a single point Xk.
 *
 * P(Xk) = coef[0]
 *       + coef[1] * (Xk - x0)
 *       + coef[2] * (Xk - x0)(Xk - x1)
 *       + ...
 *
 * Efficient evaluation via nested multiplication (Horner-like scheme).
 */
export function evaluateNewtonAtPoint(
    x: number[],
    coef: number[],
    Xk: number
): number {
    const n = x.length;

    // Start from highest-order coefficient and go down (nested multiplication)
    let result = coef[n - 1];

    for (let i = n - 2; i >= 0; i--) {
        result = result * (Xk - x[i]) + coef[i];
    }

    return result;
}

/**
 * Newton interpolation for a set of points X.
 *
 * Input:
 *   table: { x: number[]; f: number[] }  -- tabular data
 *   X: number[]                          -- points to evaluate
 *
 * Output:
 *   { X, F } where F[k] = P(X[k])        -- interpolated values
 */
export function interpolateNewton(
    table: TabularFunction,
    X: PointsToEvaluate
): InterpolationResult {
    // 1. Validate input
    validateTabular(table);
    validatePointsToEvaluate(table, X, {
        requireInRange: false, // можна дозволити екстраполяцію
    });

    const { x, f } = table;

    // 2. Build coefficients of Newton polynomial once
    const coef = buildNewtonCoefficients(x, f);

    // 3. Evaluate polynomial at all points X
    const F: number[] = [];
    for (const Xk of X) {
        const value = evaluateNewtonAtPoint(x, coef, Xk);
        F.push(value);
    }

    return { X, F };
}

/**
 * Convenience wrapper matching the task signature:
 *
 *   x: given arguments (nodes)
 *   f: given function values
 *   X: arguments where we want to compute F
 *
 * Returns:
 *   F: computed function values in points X
 */
export function interpolateNewtonRaw(
    x: number[],
    f: number[],
    X: number[]
): number[] {
    const table: TabularFunction = { x, f };
    const result = interpolateNewton(table, X);
    return result.F;
}
