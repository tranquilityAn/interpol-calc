import type {
    TabularFunction,
    PointsToEvaluate,
    InterpolationResult,
} from "./tabular";

export type InterpolationMethod = "lagrange" | "newton";

// конфіг для виклику інтерполятора
export interface InterpolationRequest {
    method: InterpolationMethod;
    table: TabularFunction;
    X: PointsToEvaluate;
}

export interface InterpolationSummary {
    method: InterpolationMethod;
    input: {
        table: TabularFunction;
        X: PointsToEvaluate;
    };
    output: InterpolationResult;
}

// Один рядок зведеної таблиці: значення двох методів + різниця
export interface InterpolationComparisonRow {
    X: number; // точка, в якій порівнюємо
    lagrange: number; // значення, отримане методом Лагранжа
    newton: number; // значення, отримане методом Ньютона
    absDiff: number; // |lagrange - newton|
}

// Загальне summary по всіх точках
export interface InterpolationMethodsSummary {
    rows: InterpolationComparisonRow[]; // зведена таблиця по всіх X
    meanAbsDiff: number; // середня абсолютна різниця
    maxAbsDiff: number; // максимальна абсолютна різниця
}
