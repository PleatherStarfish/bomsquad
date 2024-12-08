import React, { useState } from "react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import ResistorCalculatorExplanation from "../components/components/ResistorCalculatorExplanation";
import { MathJax } from "better-react-mathjax";

type FormValues = {
  supplyVoltage: string;
  forwardVoltage: string;
  forwardCurrent: string;
  currentUnit: string;
};

const ResistorCalculator: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>();
  const [result, setResult] = useState<{
    resistorValue: number;
    powerRating: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Using useWatch to observe the form fields
  const supplyVoltage = useWatch({ control, name: "supplyVoltage" });
  const forwardVoltage = useWatch({ control, name: "forwardVoltage" });
  const forwardCurrent = useWatch({ control, name: "forwardCurrent" });
  const currentUnit = useWatch({ control, name: "currentUnit" });

  const convertCurrentToAmps = (current: number, unit: string): number => {
    switch (unit) {
      case "mA":
        return current / 1000; // Convert milliamps to amps
      case "µA":
        return current / 1_000_000; // Convert microamps to amps
      case "A":
        return current; // Already in amps
      default:
        return 0; // Invalid unit, return 0
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const supplyVoltage = parseFloat(data.supplyVoltage);
    const forwardVoltage = parseFloat(data.forwardVoltage);
    const forwardCurrent = convertCurrentToAmps(
      parseFloat(data.forwardCurrent),
      data.currentUnit
    );

    if (supplyVoltage <= forwardVoltage) {
      setError(
        `The supply voltage (${supplyVoltage}V) is too low for the LED's forward voltage (${forwardVoltage}V). The forward voltage is the minimum voltage needed to turn on the LED. Try increasing the supply voltage so it’s higher than the forward voltage, or use an LED with a lower forward voltage.`
      );
      setResult(null);
      return;
    }

    if (forwardCurrent > 0) {
      const resistorValue = (supplyVoltage - forwardVoltage) / forwardCurrent;
      const powerRating = (supplyVoltage - forwardVoltage) * forwardCurrent;
      setResult({ powerRating, resistorValue });
      setError(null);
    } else {
      setError("Forward current must be greater than 0.");
      setResult(null);
    }
  };

  return (
    <div>
      <div className="grid max-w-5xl grid-cols-1 gap-8 p-6 mx-auto mt-10 bg-white border rounded-lg md:grid-cols-2">
        <h1 className="col-span-1 mb-6 text-2xl font-semibold text-center font-display md:col-span-2">
          LED Resistor Calculator
        </h1>

        {/* Right Column: Form Inputs */}
        <div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block font-medium text-gray-700">
                Supply Voltage (<MathJax inline>{"\\( V_{supply} \\)"}</MathJax>):
              </label>
              <input
                step="0.01"
                type="number"
                {...register("supplyVoltage", {
                  min: {
                    message: "Must be greater than or equal to 0",
                    value: 0,
                  },
                  required: "Supply voltage is required",
                })}
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.supplyVoltage && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.supplyVoltage.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700">
                LED Forward Voltage (<MathJax inline>{"\\( V_f \\)"}</MathJax>):
              </label>
              <input
                step="0.01"
                type="number"
                {...register("forwardVoltage", {
                  min: {
                    message: "Must be greater than or equal to 0",
                    value: 0,
                  },
                  required: "Forward voltage is required",
                })}
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.forwardVoltage && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.forwardVoltage.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700">
                LED Forward Current (<MathJax inline>{"\\( I_f \\)"}</MathJax>):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  step="0.01"
                  type="number"
                  {...register("forwardCurrent", {
                    min: {
                      message: "Must be greater than or equal to 0.01",
                      value: 0.01,
                    },
                    required: "Forward current is required",
                  })}
                  className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  {...register("currentUnit", {
                    required: "Select a current unit",
                  })}
                  className="mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="mA"
                >
                  <option value="A">A</option>
                  <option value="mA">mA</option>
                  <option value="µA">µA</option>
                </select>
              </div>
              {errors.forwardCurrent && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.forwardCurrent.message}
                </p>
              )}
              {errors.currentUnit && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.currentUnit.message}
                </p>
              )}
            </div>

            <button
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:ring focus:ring-blue-300"
              type="submit"
            >
              Calculate Resistor
            </button>
          </form>

          {error && (
            <div className="p-4 mt-6 bg-red-100 rounded-lg">
              <p className="text-red-500 whitespace-pre-line">{error}</p>
            </div>
          )}
        </div>

        {/* Left Column: Results and Live Preview */}
        <div className="space-y-6">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold">Results</h2>
            {result ? (
              <div className="text-gray-700">
                <p>
                  Recommended Resistor Value:{" "}
                  <strong>{result.resistorValue.toFixed(2)} Ω</strong>
                </p>
                <p>
                  Power Rating:{" "}
                  <strong>{result.powerRating.toFixed(3)} W</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Choose a resistor with a slightly higher wattage rating, e.g.,
                  ¼ W or ½ W.
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                Enter valid inputs to see the results.
              </p>
            )}
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold">Live Preview</h2>
            <p className="text-gray-700">
              Supply Voltage: {supplyVoltage || "N/A"} V <br />
              Forward Voltage: {forwardVoltage || "N/A"} V <br />
              Forward Current: {forwardCurrent || "N/A"} {currentUnit || "A"}
            </p>
          </div>
        </div>
      </div>

      <ResistorCalculatorExplanation />
    </div>
  );
};

export default ResistorCalculator;
