import type { TabularFunction, PointsToEvaluate } from "../../types/tabular";
import type {
    DifferentiationComparisonRow,
    DifferentiationMethodsSummary,
} from "../../types/differentiation";

import { differentiateByInterpolation5 } from "./interpolation5";
import { differentiateByApproximation5 } from "./approximation5";

/**
 * Будує зведену таблицю для порівняння методів диференціювання:
 * - метод інтерполяції (5 вузлів)
 * - метод апроксимації (5 вузлів)
 *
 * Функція намагається обчислити обома методами та коректно
 * обробляє ситуації, коли один з методів неможливо застосувати
 * (наприклад, нерівномірна сітка для методу апроксимації).
 */
export function buildDifferentiationMethodsSummary(
    table: TabularFunction,
    X: PointsToEvaluate
): DifferentiationMethodsSummary {
    let interpolationResult: ReturnType<
        typeof differentiateByInterpolation5
    > | null = null;
    let approximationResult: ReturnType<
        typeof differentiateByApproximation5
    > | null = null;

    // Перший метод: інтерполяція на 5 вузлах
    try {
        interpolationResult = differentiateByInterpolation5(table, X);
    } catch {
        interpolationResult = null;
    }

    // Другий метод: апроксимація на 5 вузлах
    try {
        approximationResult = differentiateByApproximation5(table, X);
    } catch {
        approximationResult = null;
    }

    const rows: DifferentiationComparisonRow[] = [];

    let sumAbsDiff = 0;
    let maxAbsDiff = 0;
    let countForStats = 0;

    for (let i = 0; i < X.length; i++) {
        const xValue = X[i];

        const vInterp =
            interpolationResult && interpolationResult.Fd[i] != null
                ? interpolationResult.Fd[i]
                : null;

        const vApprox =
            approximationResult && approximationResult.Fd[i] != null
                ? approximationResult.Fd[i]
                : null;

        let absDiff: number | null = null;

        if (vInterp != null && vApprox != null) {
            absDiff = Math.abs(vInterp - vApprox);
            sumAbsDiff += absDiff;
            if (absDiff > maxAbsDiff) {
                maxAbsDiff = absDiff;
            }
            countForStats++;
        }

        rows.push({
            X: xValue,
            interpolation5: vInterp,
            approximation5: vApprox,
            absDiff,
        });
    }

    const meanAbsDiff = countForStats > 0 ? sumAbsDiff / countForStats : null;

    const hasStats = countForStats > 0;

    return {
        rows,
        meanAbsDiff: hasStats ? meanAbsDiff : null,
        maxAbsDiff: hasStats ? maxAbsDiff : null,
    };
}
