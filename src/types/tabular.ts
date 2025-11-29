// Базовий тип "масив чисел" — для x, f, X тощо
export type NumericArray = number[];

// Масив вузлів x
export type XArray = NumericArray;

// Масив значень f(x)
export type FArray = NumericArray;

// Таблична функція: набір вузлів і значень
export interface TabularFunction {
    x: XArray; // nodes
    f: FArray; // values at nodes
}

// Точки, в яких будемо рахувати значення або похідні
export type PointsToEvaluate = NumericArray;

// Результат інтерполяції: значення функції в точках X
export interface InterpolationResult {
    X: PointsToEvaluate;
    F: NumericArray; // interpolated values
}

// Результат диференціювання: значення похідної в точках X
export interface DerivativeResult {
    X: PointsToEvaluate;
    Fd: NumericArray; // derivative values
}
