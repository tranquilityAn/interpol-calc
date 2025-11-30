import type { TabularFunction, PointsToEvaluate } from "../../types/tabular";
import type {
    InterpolationComparisonRow,
    InterpolationMethodsSummary,
} from "../../types/interpolation";

import { interpolateLagrange } from "./lagrange";
import { interpolateNewton } from "./newton";

/**
 * Будує зведену таблицю для порівняння методів інтерполяції:
 * Лагранжа та Ньютона для заданої табличної функції та набору точок X.
 */
export function buildInterpolationMethodsSummary(
    table: TabularFunction,
    X: PointsToEvaluate
): InterpolationMethodsSummary {
    // Обчислюємо значення обома методами
    const lagrangeResult = interpolateLagrange(table, X);
    const newtonResult = interpolateNewton(table, X);

    const rows: InterpolationComparisonRow[] = [];
    let sumAbsDiff = 0;
    let maxAbsDiff = 0;

    for (let i = 0; i < X.length; i++) {
        const xValue = X[i];
        const vL = lagrangeResult.F[i];
        const vN = newtonResult.F[i];

        const absDiff = Math.abs(vL - vN);

        sumAbsDiff += absDiff;
        if (absDiff > maxAbsDiff) {
            maxAbsDiff = absDiff;
        }

        rows.push({
            X: xValue,
            lagrange: vL,
            newton: vN,
            absDiff,
        });
    }

    const meanAbsDiff = X.length > 0 ? sumAbsDiff / X.length : 0;

    return {
        rows,
        meanAbsDiff,
        maxAbsDiff,
    };
}
