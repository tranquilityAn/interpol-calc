interface RunButtonProps {
    disabled: boolean;
    onClick: () => void;
}

export function RunButton({ disabled, onClick }: RunButtonProps) {
    return (
        <section>
            <h2>4. Run computation</h2>
            <button
                type="button"
                className="btn btn-primary"
                disabled={disabled}
                onClick={onClick}
            >
                Compute
            </button>
        </section>
    );
}
