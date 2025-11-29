export class TabularDataError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TabularDataError";
    }
}

// Опціонально: помилка для методів/конфігурацій
export class MethodNotSupportedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MethodNotSupportedError";
    }
}
