import { useState } from "react";
import "./App.css";

import type {
    TabularFunction,
    PointsToEvaluate,
    InterpolationResult,
    DerivativeResult,
} from "./types/tabular";
import type { InterpolationMethod } from "./types/interpolation";
import type { DifferentiationMethod } from "./types/differentiation";
import type { AppError } from "./types/ui";

import { TabularDataError, MethodNotSupportedError } from "./types/errors";
import { interpolate } from "./modules/interpolation";
import { differentiate } from "./modules/differentiation";

import { PageLayout } from "./components/layout/PageLayout";
import { TaskSelector } from "./components/controls/TaskSelector";
import { MethodSelector } from "./components/controls/MethodSelector";
import { DataSection } from "./components/data/DataSection";
import { RunButton } from "./components/controls/RunButton";
import { ErrorList } from "./components/data/ErrorList";
import { ResultsTable } from "./components/data/ResultsTable";
import { CombinedChart } from "./components/charts/CombinedChart";

type TaskType = "interpolation" | "differentiation";

export default function App() {
    const [task, setTask] = useState<TaskType>("interpolation");
    const [method, setMethod] = useState<
        InterpolationMethod | DifferentiationMethod
    >("lagrange");

    const [table, setTable] = useState<TabularFunction | null>(null);
    const [X, setX] = useState<PointsToEvaluate | null>(null);

    const [interpolationResult, setInterpolationResult] =
        useState<InterpolationResult | null>(null);
    const [derivativeResult, setDerivativeResult] =
        useState<DerivativeResult | null>(null);

    const [errors, setErrors] = useState<AppError[]>([]);

    const makeError = (message: string): AppError => ({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
    });

    const handleTaskChange = (nextTask: TaskType) => {
        setTask(nextTask);

        // Reset method to a sensible default for each task
        if (nextTask === "interpolation") {
            setMethod("lagrange");
        } else {
            setMethod("interpolation5");
        }

        // Clear results when task changes
        setInterpolationResult(null);
        setDerivativeResult(null);
        setErrors([]);
    };

    const handleRun = () => {
        if (!table || !X) {
            setErrors([
                makeError("No data to compute. Please load a data file first."),
            ]);
            setInterpolationResult(null);
            setDerivativeResult(null);
            return;
        }

        if (X.length === 0) {
            setErrors([makeError("The list of evaluation points X is empty.")]);
            setInterpolationResult(null);
            setDerivativeResult(null);
            return;
        }

        try {
            setErrors([]);

            if (task === "interpolation") {
                const interpolationMethod = method as InterpolationMethod;
                const result = interpolate(interpolationMethod, table, X);
                setInterpolationResult(result);
                setDerivativeResult(null);
            } else {
                const differentiationMethod = method as DifferentiationMethod;
                const result = differentiate(differentiationMethod, table, X);
                setDerivativeResult(result);
                setInterpolationResult(null);
            }
        } catch (e) {
            console.error("Computation error:", e);
            let message = "Unknown error during computation.";

            if (
                e instanceof TabularDataError ||
                e instanceof MethodNotSupportedError
            ) {
                message = e.message;
            } else if (e instanceof Error && e.message) {
                message = e.message;
            }

            setErrors([makeError(message)]);
            setInterpolationResult(null);
            setDerivativeResult(null);
        }
    };

    const handleDataChange = (
        nextTable: TabularFunction | null,
        nextX: PointsToEvaluate | null
    ) => {
        setTable(nextTable);
        setX(nextX);
        setInterpolationResult(null);
        setDerivativeResult(null);
        setErrors([]);
    };

    const disabledRun = !table || !X || Boolean(errors.length);

    return (
        <PageLayout>
            <TaskSelector value={task} onChange={handleTaskChange} />

            <MethodSelector task={task} value={method} onChange={setMethod} />

            <DataSection
                onDataChange={handleDataChange}
                onErrorsChange={setErrors}
            />

            <RunButton disabled={disabledRun} onClick={handleRun} />

            <ErrorList errors={errors} />

            <ResultsTable
                task={task}
                interpolationResult={interpolationResult}
                derivativeResult={derivativeResult}
            />

            <CombinedChart
                task={task}
                table={table}
                X={X}
                interpolationResult={interpolationResult}
                derivativeResult={derivativeResult}
            />
        </PageLayout>
    );
}
