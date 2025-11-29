import type { TabularFunction, PointsToEvaluate } from "../types/tabular";
import { TabularDataError } from "../types/errors";

// Допоміжна функція: перевірка, що масив строго зростає
export function isStrictlyIncreasing(arr: number[]): boolean {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] <= arr[i - 1]) {
            return false;
        }
    }
    return true;
}

// Перевірка базових властивостей табличної функції
export function validateTabular(
    table: TabularFunction,
    options?: {
        minPoints?: number; // мінімальна кількість вузлів (за замовчуванням 2)
    }
): void {
    const { x, f } = table;
    const minPoints = options?.minPoints ?? 2;

    if (!Array.isArray(x) || !Array.isArray(f)) {
        throw new TabularDataError("Tabular data must contain arrays x and f.");
    }

    if (x.length !== f.length) {
        throw new TabularDataError("Arrays x and f must have the same length.");
    }

    if (x.length < minPoints) {
        throw new TabularDataError(
            `Tabular data must contain at least ${minPoints} points.`
        );
    }

    if (!isStrictlyIncreasing(x)) {
        throw new TabularDataError("Array x must be strictly increasing.");
    }

    // Перевірка на NaN / Infinity для надійності
    for (let i = 0; i < x.length; i++) {
        if (!Number.isFinite(x[i]) || !Number.isFinite(f[i])) {
            throw new TabularDataError(
                "Tabular data contains invalid numeric values."
            );
        }
    }
}

// Перевірка, що точки X "розумні" (не порожні, без NaN, опціонально: в діапазоні)
export function validatePointsToEvaluate(
    table: TabularFunction,
    X: PointsToEvaluate,
    options?: {
        requireInRange?: boolean; // чи мають X бути в [min(x), max(x)]
    }
): void {
    if (!Array.isArray(X) || X.length === 0) {
        throw new TabularDataError(
            "Points to evaluate (X) must be a non-empty array."
        );
    }

    for (const value of X) {
        if (!Number.isFinite(value)) {
            throw new TabularDataError(
                "Points to evaluate (X) contain invalid numeric values."
            );
        }
    }

    if (options?.requireInRange) {
        const minX = table.x[0];
        const maxX = table.x[table.x.length - 1];

        for (const value of X) {
            if (value < minX || value > maxX) {
                throw new TabularDataError(
                    `Point X = ${value} is outside of the tabular data range [${minX}, ${maxX}].`
                );
            }
        }
    }
}

// Спеціальна перевірка для методів, що вимагають >= N вузлів (наприклад, 5)
export function validateMinPointsForMethod(
    table: TabularFunction,
    requiredPoints: number,
    methodName: string
): void {
    if (table.x.length < requiredPoints) {
        throw new TabularDataError(
            `Method "${methodName}" requires at least ${requiredPoints} points in the table.`
        );
    }
}
