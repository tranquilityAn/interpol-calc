import type { InterpolationMethod } from "../../types/interpolation";
import type { DifferentiationMethod } from "../../types/differentiation";

type TaskType = "interpolation" | "differentiation";
type AnyMethod = InterpolationMethod | DifferentiationMethod;

interface MethodSelectorProps {
    task: TaskType;
    value: AnyMethod;
    onChange: (value: AnyMethod) => void;
}

export function MethodSelector({ task, value, onChange }: MethodSelectorProps) {
    return (
        <section>
            <h2>2. Choose a method</h2>

            {task === "interpolation" && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        type="button"
                        onClick={() => onChange("lagrange")}
                        className={
                            value === "lagrange" ? "btn btn-primary" : "btn"
                        }
                    >
                        Lagrange polynomial
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange("newton")}
                        className={
                            value === "newton" ? "btn btn-primary" : "btn"
                        }
                    >
                        Newton polynomial
                    </button>
                </div>
            )}

            {task === "differentiation" && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        type="button"
                        onClick={() => onChange("interpolation5")}
                        className={
                            value === "interpolation5"
                                ? "btn btn-primary"
                                : "btn"
                        }
                    >
                        Interpolation (5 nodes)
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange("approximation5")}
                        className={
                            value === "approximation5"
                                ? "btn btn-primary"
                                : "btn"
                        }
                    >
                        Approximation (5 nodes)
                    </button>
                </div>
            )}
        </section>
    );
}
