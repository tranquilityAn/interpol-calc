import type {
    TabularFunction,
    PointsToEvaluate,
    DerivativeResult,
} from "./tabular";

export type DifferentiationMethod = "interpolation5" | "approximation5";

export interface DifferentiationRequest {
    method: DifferentiationMethod;
    table: TabularFunction;
    X: PointsToEvaluate;
}

export interface DifferentiationSummary {
    method: DifferentiationMethod;
    input: {
        table: TabularFunction;
        X: PointsToEvaluate;
    };
    output: DerivativeResult;
}

// Один рядок зведеної таблиці: похідні двома методами + різниця
export interface DifferentiationComparisonRow {
    X: number; // точка, в якій порівнюємо
    interpolation5: number | null; // значення похідної методом інтерполяції (5 вузлів)
    approximation5: number | null; // значення похідної методом апроксимації (5 вузлів)
    absDiff: number | null; // |interpolation5 - approximation5|, або null, якщо одного з методів нема
}

// Загальне summary по всіх точках
export interface DifferentiationMethodsSummary {
    rows: DifferentiationComparisonRow[]; // зведена таблиця по всіх X
    meanAbsDiff: number | null; // середня різниця там, де обидва методи дали результат
    maxAbsDiff: number | null; // максимальна різниця там, де обидва методи дали результат
}
