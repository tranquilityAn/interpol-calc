import type { TabularFunction, PointsToEvaluate } from "../types/tabular";
import { TabularDataError } from "../types/errors";

// Те, що повертає парсер
export interface ParsedTabularFile {
    table: TabularFunction;
    X: PointsToEvaluate;
}

/**
 * Парсинг одного числового токена.
 * Підтримує як крапку, так і кому як десятковий роздільник.
 *
 * "0.43" -> 0.43
 * "0,43" -> 0.43
 */
export function parseNumberToken(token: string): number {
    const trimmed = token.trim();
    if (!trimmed) {
        throw new TabularDataError("Empty numeric token.");
    }

    // Замінюємо кому на крапку, щоб "0,43" коректно парсилось.
    const normalized = trimmed.replace(",", ".");

    const value = Number(normalized);
    if (!Number.isFinite(value)) {
        throw new TabularDataError(`Cannot parse numeric value "${token}".`);
    }

    return value;
}

/**
 * Визначає тип рядка за міткою:
 *   "x", "x:"   -> 'x'
 *   "f", "f:", "f(x)" -> 'f'
 *   "X", "X:"   -> 'X'
 */
function detectRowLabel(rawLabel: string): "x" | "f" | "X" {
    const label = rawLabel.trim();

    // Видаляємо все, крім літер, щоб "x:" або "f(x)" теж спрацювали
    const lettersOnly = label.replace(/[^A-Za-z]/g, "");

    if (lettersOnly === "x") {
        return "x";
    }

    if (lettersOnly === "X") {
        return "X";
    }

    // Дозволяємо f, F, f(x) і т.п.
    if (lettersOnly === "f" || lettersOnly === "fx" || lettersOnly === "Fx") {
        return "f";
    }

    throw new TabularDataError(
        `Unknown row label "${rawLabel}". Expected x, f or X.`
    );
}

/**
 * Парсить рядок формату:
 *   x 0,43 0,48 0,52 ...
 *   f 1,63597 1,76827 ...
 *   X 0,702 0,741 ...
 *
 * Перший токен — мітка (x / f / X), решта — числа.
 */
export function parseLabeledRow(line: string): {
    label: "x" | "f" | "X";
    values: number[];
} {
    const trimmed = line.trim();
    if (!trimmed) {
        throw new TabularDataError("Cannot parse an empty line.");
    }

    // ВАЖЛИВО: ділимо тільки по пробілах/табах,
    // не по комах — щоб "0,43" залишалось цілісним.
    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 2) {
        throw new TabularDataError(
            `Line "${line}" must contain a label and at least one numeric value.`
        );
    }

    const [rawLabel, ...rawValues] = tokens;
    const label = detectRowLabel(rawLabel);

    const values = rawValues.map(parseNumberToken);

    if (values.length === 0) {
        throw new TabularDataError(
            `Line "${line}" must contain at least one numeric value after the label.`
        );
    }

    return { label, values };
}

/**
 * Головна функція парсингу текстового файлу.
 *
 * Очікуваний формат (у довільному порядку, але без дублювання):
 *
 *   x 0,43 0,48 0,52 0,57 0,62 0,67 0,72
 *   f 1,63597 1,76827 ...
 *   X 0,702 0,741 0,782 0,812
 *
 * - Рядки з іншими мітками → помилка.
 * - x та f — обов'язкові.
 * - X може бути відсутнім → тоді X = [].
 */
export function parseTabularFile(content: string): ParsedTabularFile {
    if (typeof content !== "string") {
        throw new TabularDataError("File content must be a string.");
    }

    const lines = content.split(/\r?\n/);

    let xValues: number[] | null = null;
    let fValues: number[] | null = null;
    let XValues: number[] | null = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        // Пропускаємо порожні рядки
        if (!line) continue;

        const { label, values } = parseLabeledRow(line);

        switch (label) {
            case "x":
                if (xValues !== null) {
                    throw new TabularDataError("Duplicate x row in file.");
                }
                xValues = values;
                break;

            case "f":
                if (fValues !== null) {
                    throw new TabularDataError("Duplicate f row in file.");
                }
                fValues = values;
                break;

            case "X":
                if (XValues !== null) {
                    throw new TabularDataError("Duplicate X row in file.");
                }
                XValues = values;
                break;

            default:
                break;
        }
    }

    if (xValues === null || fValues === null) {
        throw new TabularDataError("File must contain both x and f rows.");
    }

    // Якщо X нема — робимо пустий масив (можна буде задати X з GUI)
    if (XValues === null) {
        XValues = [];
    }

    const table: TabularFunction = {
        x: xValues,
        f: fValues,
    };

    return {
        table,
        X: XValues,
    };
}
