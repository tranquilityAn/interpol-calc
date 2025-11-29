import type { TabularFunction } from "../types/tabular";
import { TabularDataError } from "../types/errors";

// Пошук індексу елемента x[i], який найближчий до точки X
export function findNearestIndex(x: number[], X: number): number {
    if (x.length === 0) {
        throw new TabularDataError(
            "Cannot find nearest index in an empty array."
        );
    }

    let nearestIndex = 0;
    let minDist = Math.abs(x[0] - X);

    for (let i = 1; i < x.length; i++) {
        const dist = Math.abs(x[i] - X);
        if (dist < minDist) {
            minDist = dist;
            nearestIndex = i;
        }
    }

    return nearestIndex;
}

// Оцінка кроку сітки (якщо він приблизно постійний)
// Повертає h або null, якщо сітка занадто нерівномірна
export function getApproximateStep(
    x: number[],
    tolerance: number = 1e-6
): number | null {
    if (x.length < 2) return null;

    const steps: number[] = [];
    for (let i = 1; i < x.length; i++) {
        steps.push(x[i] - x[i - 1]);
    }

    const h = steps.reduce((sum, value) => sum + value, 0) / steps.length;

    for (const step of steps) {
        if (Math.abs(step - h) > tolerance) {
            return null; // сітка надто нерівномірна
        }
    }

    return h;
}

// Отримати індекси 5 вузлів навколо точки X (для диференціювання)
// Спроба зробити "максимально центральний" стенсил, не виходячи за межі масиву
export function get5PointStencilIndices(
    table: TabularFunction,
    X: number
): number[] {
    const { x } = table;

    if (x.length < 5) {
        throw new TabularDataError(
            "At least 5 points are required to build a 5-point stencil."
        );
    }

    const nearest = findNearestIndex(x, X);

    // початкова спроба зробити [nearest-2, nearest-1, nearest, nearest+1, nearest+2]
    let start = nearest - 2;

    // коригуємо, щоб не вийти за межі
    if (start < 0) {
        start = 0;
    }
    if (start + 4 >= x.length) {
        start = x.length - 5;
    }

    const indices: number[] = [];
    for (let i = 0; i < 5; i++) {
        indices.push(start + i);
    }

    return indices;
}
