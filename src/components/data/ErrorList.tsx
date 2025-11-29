import type { AppError } from "../../types/ui";

interface ErrorListProps {
    errors: AppError[];
}

export function ErrorList({ errors }: ErrorListProps) {
    if (!errors.length) return null;

    return (
        <section>
            <h2>Errors</h2>
            <ul className="error-list">
                {errors.map((err) => (
                    <li key={err.id} className="error-item">
                        {err.message}
                    </li>
                ))}
            </ul>
        </section>
    );
}
