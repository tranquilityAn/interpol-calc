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
import { getApproximateStep, findNearestIndex } from "../tabularUtils";
import { TabularDataError } from "../../types/errors";

/**
 * Computes the first derivative using 5-point finite difference formulas
 * at a given node index i, assuming (almost) uniform grid with step h.
 *
 * Uses:
 *   - forward 5-point formula near the left boundary
 *   - backward 5-point formula near the right boundary
 *   - central 5-point formula in the interior
 *
 * All formulas are O(h^4) accurate for uniform grid.
 */
export function finiteDifference5AtIndex(
    f: number[],
    i: number,
    h: number
): number {
    const n = f.length;

    if (n < 5) {
        throw new TabularDataError(
            "At least 5 points are required to apply 5-point finite difference formulas."
        );
    }

    // Forward 5-point formula at x0
    // f'(x0) ≈ (-25 f0 + 48 f1 - 36 f2 + 16 f3 - 3 f4) / (12 h)
    if (i === 0) {
        return (
            (-25 * f[0] + 48 * f[1] - 36 * f[2] + 16 * f[3] - 3 * f[4]) /
            (12 * h)
        );
    }

    // Forward-like formula at x1 (shifted stencil)
    // f'(x1) ≈ (-3 f0 - 10 f1 + 18 f2 - 6 f3 + f4) / (12 h)
    if (i === 1) {
        return (-3 * f[0] - 10 * f[1] + 18 * f[2] - 6 * f[3] + f[4]) / (12 * h);
    }

    // Backward-like formula at x_{n-2}
    // f'(x_{n-2}) ≈ (3 f_{n-1} + 10 f_{n-2} - 18 f_{n-3} + 6 f_{n-4} - f_{n-5}) / (12 h)
    if (i === n - 2) {
        return (
            (3 * f[n - 1] +
                10 * f[n - 2] -
                18 * f[n - 3] +
                6 * f[n - 4] -
                f[n - 5]) /
            (12 * h)
        );
    }

    // Backward 5-point formula at x_{n-1}
    // f'(x_{n-1}) ≈ (25 f_{n-1} - 48 f_{n-2} + 36 f_{n-3} - 16 f_{n-4} + 3 f_{n-5}) / (12 h)
    if (i === n - 1) {
        return (
            (25 * f[n - 1] -
                48 * f[n - 2] +
                36 * f[n - 3] -
                16 * f[n - 4] +
                3 * f[n - 5]) /
            (12 * h)
        );
    }

    // Central 5-point formula in the interior:
    // f'(x_i) ≈ (f_{i-2} - 8 f_{i-1} + 8 f_{i+1} - f_{i+2}) / (12 h)
    return (f[i - 2] - 8 * f[i - 1] + 8 * f[i + 1] - f[i + 2]) / (12 * h);
}

/**
 * Differentiation of a tabular function using 5-point finite difference
 * approximation (Task 4).
 *
 * IMPORTANT:
 *   This method assumes an (almost) uniform grid in x
 *   and is designed to compute derivative at the tabular nodes.
 *
 * For each Xk:
 *   - we find the nearest node x[i]
 *   - require Xk ≈ x[i] (within small tolerance)
 *   - apply the appropriate 5-point formula at index i
 */
export function differentiateByApproximation5(
    table: TabularFunction,
    X: PointsToEvaluate
): DerivativeResult {
    // 1. Validate tabular data
    validateTabular(table, { minPoints: 5 });
    validateMinPointsForMethod(table, 5, "approximation5");

    const { x, f } = table;

    // 2. Check that grid is (almost) uniform and get step h
    const h = getApproximateStep(x, 1e-6);
    if (h === null || !Number.isFinite(h) || Math.abs(h) === 0) {
        throw new TabularDataError(
            "Approximation method requires an almost uniform grid in x."
        );
    }

    // 3. Validate X: must be finite numbers.
    //    Here we additionally require that each Xk coincides with some x[i] (within tolerance).
    validatePointsToEvaluate(table, X, {
        requireInRange: true,
    });

    const Fd: number[] = [];
    const nodeTolerance = Math.abs(h) * 1e-3; // допускаємо невеличку похибку

    for (const Xk of X) {
        const idx = findNearestIndex(x, Xk);
        const distance = Math.abs(Xk - x[idx]);

        if (distance > nodeTolerance) {
            throw new TabularDataError(
                `Approximation method supports only points X that are close to tabular nodes. ` +
                    `Point X = ${Xk} is not close enough to any node (nearest node x[${idx}] = ${x[idx]}).`
            );
        }

        const dValue = finiteDifference5AtIndex(f, idx, h);
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
 */
export function differentiateByApproximation5Raw(
    x: number[],
    f: number[],
    X: number[]
): number[] {
    const table: TabularFunction = { x, f };
    const result = differentiateByApproximation5(table, X);
    // В умові Task 4 це називається F, у нас — Fd (derivative values)
    return result.Fd;
}
