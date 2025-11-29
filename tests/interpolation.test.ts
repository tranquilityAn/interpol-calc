// tests/interpolation.test.ts

import { describe, it, expect } from "vitest";
import { interpolateRaw } from "../src/modules/interpolation";

// f(x) = x^2 + 2x + 3
function quadratic(x: number): number {
    return x * x + 2 * x + 3;
}

// f(x) = sin(x)
function sinFunc(x: number): number {
    return Math.sin(x);
}

describe("Interpolation: Lagrange & Newton", () => {
    it("reproduces quadratic polynomial exactly (Lagrange vs Newton)", () => {
        // 3 nodes -> polynomial of degree <= 2 should be exact
        const x = [-1, 0, 2];
        const f = x.map(quadratic);

        const X = [-1, -0.5, 0, 0.5, 1, 2];

        const F_lagrange = interpolateRaw("lagrange", x, f, X);
        const F_newton = interpolateRaw("newton", x, f, X);

        const tol = 1e-12;

        X.forEach((Xk, i) => {
            const exact = quadratic(Xk);

            // Both methods should give the exact polynomial value
            expect(Math.abs(F_lagrange[i] - exact)).toBeLessThan(tol);
            expect(Math.abs(F_newton[i] - exact)).toBeLessThan(tol);

            // And they should be equal to each other
            expect(Math.abs(F_lagrange[i] - F_newton[i])).toBeLessThan(tol);
        });
    });

    it("approximates sin(x) with reasonable accuracy (Lagrange)", () => {
        // Take several nodes on [0, pi/2]
        const x: number[] = [];
        const f: number[] = [];
        const n = 7;
        const a = 0;
        const b = Math.PI / 2;

        for (let i = 0; i < n; i++) {
            const xi = a + (b - a) * (i / (n - 1));
            x.push(xi);
            f.push(sinFunc(xi));
        }

        // Interpolation points between nodes
        const X = [0.1, 0.2, 0.4, 0.7, 1.0];

        const F_lagrange = interpolateRaw("lagrange", x, f, X);
        const tol = 1e-4;

        X.forEach((Xk, i) => {
            const exact = sinFunc(Xk);
            const err = Math.abs(F_lagrange[i] - exact);
            expect(err).toBeLessThan(tol);
        });
    });

    it("approximates sin(x) with reasonable accuracy (Newton)", () => {
        const x: number[] = [];
        const f: number[] = [];
        const n = 7;
        const a = 0;
        const b = Math.PI / 2;

        for (let i = 0; i < n; i++) {
            const xi = a + (b - a) * (i / (n - 1));
            x.push(xi);
            f.push(sinFunc(xi));
        }

        const X = [0.1, 0.2, 0.4, 0.7, 1.0];

        const F_newton = interpolateRaw("newton", x, f, X);
        const tol = 1e-4;

        X.forEach((Xk, i) => {
            const exact = sinFunc(Xk);
            const err = Math.abs(F_newton[i] - exact);
            expect(err).toBeLessThan(tol);
        });
    });
});
