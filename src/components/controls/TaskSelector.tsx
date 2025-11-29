type TaskType = "interpolation" | "differentiation";

interface TaskSelectorProps {
    value: TaskType;
    onChange: (value: TaskType) => void;
}

export function TaskSelector({ value, onChange }: TaskSelectorProps) {
    return (
        <section>
            <h2>1. Choose a task</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                    type="button"
                    onClick={() => onChange("interpolation")}
                    className={
                        value === "interpolation" ? "btn btn-primary" : "btn"
                    }
                >
                    Interpolation
                </button>
                <button
                    type="button"
                    onClick={() => onChange("differentiation")}
                    className={
                        value === "differentiation" ? "btn btn-primary" : "btn"
                    }
                >
                    Differentiation
                </button>
            </div>
        </section>
    );
}
