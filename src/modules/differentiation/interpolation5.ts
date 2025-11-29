import type {
    TabularFunction,
    PointsToEvaluate,
    DerivativeResult,
} from "../../types/tabular";
import {
    validateTabular,
    validatePointsToEvaluate,
    validateMinPointsForMethod,
} from "../validation";
import { get5PointStencilIndices } from "../tabularUtils";

/**
 * Computes the derivative of the Lagrange interpolation polynomial
 * at a single point Xk, using all given nodes (x, f).
 *
 * This is a generic implementation for n points (we will use n = 5).
 *
 * L(x) = sum_{i=0}^{n-1} f_i * L_i(x)
 * L'(x) = sum_{i=0}^{n-1} f_i * L_i'(x)
 *
 * where
 * L_i(x) = product_{j != i} (x - x_j) / (x_i - x_j)
 *
 * and derivative is computed via:
 * L_i'(x) = sum_{m != i} [ (1 / (x_i - x_m)) *
 *                          product_{j != i, j != m} (x - x_j) / (x_i - x_j) ]
 */
export function computeLagrangeDerivativeAtPoint(
    x: number[],
    f: number[],
    Xk: number
): number {
    const n = x.length;
    let derivative = 0;

    for (let i = 0; i < n; i++) {
        let LiPrimeAtXk = 0;

        // Sum over m != i (from product rule)
        for (let m = 0; m < n; m++) {
            if (m === i) continue;

            // Start with factor 1 / (x_i - x_m)
            let term = 1 / (x[i] - x[m]);

            // Multiply by all remaining factors (Xk - x_j) / (x_i - x_j),
            // excluding j = i and j = m
            for (let j = 0; j < n; j++) {
                if (j === i || j === m) continue;
                term *= (Xk - x[j]) / (x[i] - x[j]);
            }

            LiPrimeAtXk += term;
        }

        derivative += f[i] * LiPrimeAtXk;
    }

    return derivative;
}

/**
 * Differentiation of a tabular function using interpolation
 * on 5 nodes (Task 3).
 *
 * Idea:
 *   - for each Xk we choose 5 nodes (a "stencil") around Xk
 *   - build local Lagrange polynomial on these 5 points
 *   - compute its derivative at Xk
 *
 * Input:
 *   table: { x: number[]; f: number[] }    -- tabular data
 *   X:     number[]                        -- points where derivative is needed
 *
 * Output:
 *   { X, Fd } where Fd[k] = derivative at X[k]
 */
export function differentiateByInterpolation5(
    table: TabularFunction,
    X: PointsToEvaluate
): DerivativeResult {
    // 1. Validate input data
    validateTabular(table, { minPoints: 5 });
    validateMinPointsForMethod(table, 5, "interpolation5");

    // Для методу через інтерполяцію логічно вимагати,
    // щоб точки X були в межах табличних даних:
    validatePointsToEvaluate(table, X, {
        requireInRange: true,
    });

    const { x, f } = table;
    const Fd: number[] = [];

    // 2. For each Xk, build a 5-point stencil and compute derivative
    for (const Xk of X) {
        const indices = get5PointStencilIndices(table, Xk);

        const xLocal = indices.map((i) => x[i]);
        const fLocal = indices.map((i) => f[i]);

        const dValue = computeLagrangeDerivativeAtPoint(xLocal, fLocal, Xk);
        Fd.push(dValue);
    }

    return { X, Fd };
}

/**
 * Convenience wrapper matching the task-style signature:
 *
 *   x: given arguments (nodes)
 *   f: given function values
 *   X: arguments where we want to compute derivative
 *
 * Returns:
 *   F: computed derivative values in points X
 *
 * (Here we return just an array of derivative values, as in the task.)
 */
export function differentiateByInterpolation5Raw(
    x: number[],
    f: number[],
    X: number[]
): number[] {
    const table: TabularFunction = { x, f };
    const result = differentiateByInterpolation5(table, X);
    // Task calls it F, у нас це Fd (derivative values)
    return result.Fd;
}
