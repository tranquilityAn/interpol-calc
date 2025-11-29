// tests/differentiation.test.ts

import { describe, it, expect } from "vitest";
import { differentiateRaw } from "../src/modules/differentiation";

// f(x) = x^4 - 2x^3 + x - 1
function poly(x: number): number {
    return x ** 4 - 2 * x ** 3 + x - 1;
}

// f'(x) = 4x^3 - 6x^2 + 1
function polyDeriv(x: number): number {
    return 4 * x ** 3 - 6 * x ** 2 + 1;
}

// f(x) = sin(x), f'(x) = cos(x)
function sinFunc(x: number): number {
    return Math.sin(x);
}
function sinDeriv(x: number): number {
    return Math.cos(x);
}

describe("Differentiation by interpolation on 5 nodes (Task 3)", () => {
    it("gives (almost) exact derivative for a 4th degree polynomial", () => {
        // 5 nodes, polynomial degree <= 4
        const x = [-2, -1, 0, 1, 2];
        const f = x.map(poly);

        // Internal points (not at the very edges)
        const X = [-1.5, -0.5, 0.5, 1.5];

        const Fd = differentiateRaw("interpolation5", x, f, X);

        const tol = 1e-10;

        X.forEach((Xk, i) => {
            const exact = polyDeriv(Xk);
            const err = Math.abs(Fd[i] - exact);
            expect(err).toBeLessThan(tol);
        });
    });
});

describe("Differentiation by 5-point finite differences (Task 4)", () => {
    it("gives near-exact derivative for a 4th degree polynomial on uniform grid", () => {
        const x: number[] = [];
        const f: number[] = [];
        const n = 9;
        const h = 0.5;

        for (let i = 0; i < n; i++) {
            const xi = -2 + i * h;
            x.push(xi);
            f.push(poly(xi));
        }

        // Method is designed to work at the nodes
        const X = [...x];

        const Fd = differentiateRaw("approximation5", x, f, X);

        const tol = 1e-6;

        X.forEach((Xk, i) => {
            const exact = polyDeriv(Xk);
            const err = Math.abs(Fd[i] - exact);
            expect(err).toBeLessThan(tol);
        });
    });

    it("approximates derivative of sin(x) with reasonable accuracy on [0, pi/2]", () => {
        const x: number[] = [];
        const f: number[] = [];
        const n = 21;
        const h = Math.PI / 2 / (n - 1);

        for (let i = 0; i < n; i++) {
            const xi = i * h;
            x.push(xi);
            f.push(sinFunc(xi));
        }

        const X = [...x];

        const Fd = differentiateRaw("approximation5", x, f, X);

        const tol = 1e-3;

        X.forEach((Xk, i) => {
            const exact = sinDeriv(Xk);
            const err = Math.abs(Fd[i] - exact);
            expect(err).toBeLessThan(tol);
        });
    });
});
