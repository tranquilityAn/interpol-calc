import type {
    TabularFunction,
    PointsToEvaluate,
    InterpolationResult,
} from "../../types/tabular";
import { validateTabular, validatePointsToEvaluate } from "../validation";

/**
 * Computes the value of the Lagrange interpolation polynomial
 * at a single point Xk, based on tabular data (x, f).
 *
 * P(Xk) = sum_{i=0}^{n-1} f_i * L_i(Xk),
 * where
 * L_i(X) = product_{j != i} (X - x_j) / (x_i - x_j)
 */
export function interpolateLagrangeAtPoint(
    x: number[],
    f: number[],
    Xk: number
): number {
    const n = x.length;
    let value = 0;

    for (let i = 0; i < n; i++) {
        let Li = 1;

        for (let j = 0; j < n; j++) {
            if (j === i) continue;
            Li *= (Xk - x[j]) / (x[i] - x[j]);
        }

        value += f[i] * Li;
    }

    return value;
}

/**
 * Lagrange interpolation for a set of points X.
 *
 * Input:
 *   table: { x: number[]; f: number[] }  -- tabular data
 *   X: number[]                          -- points to evaluate
 *
 * Output:
 *   { X, F } where F[k] = P(X[k])        -- interpolated values
 */
export function interpolateLagrange(
    table: TabularFunction,
    X: PointsToEvaluate
): InterpolationResult {
    // 1. Validate input data
    validateTabular(table); // checks x/f length, monotonic x, etc.
    validatePointsToEvaluate(table, X, {
        requireInRange: false, // можна дозволити екстраполяцію
    });

    const { x, f } = table;
    const F: number[] = [];

    // 2. Compute interpolation for each Xk
    for (const Xk of X) {
        const value = interpolateLagrangeAtPoint(x, f, Xk);
        F.push(value);
    }

    // 3. Return result in a consistent structure
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
export function interpolateLagrangeRaw(
    x: number[],
    f: number[],
    X: number[]
): number[] {
    const table: TabularFunction = { x, f };
    const result = interpolateLagrange(table, X);
    return result.F;
}
