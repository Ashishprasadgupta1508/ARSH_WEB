export const demoHealth = {
  status: "Operational",
  message: "Local demo data is ready.",
  healthy: true,
  version: "1.0.0-demo",
  timestamp: "2026-09-29T06:00:00Z",
  environment: "Local Demo",
};

export const demoRuns = [
  {
    blendRunId: "run-2026-09-29-0600-t2m",
    id: "run-2026-09-29-0600-t2m",
    variableCode: "T2M",
    validAt: "2026-09-29T12:00:00Z",
    createdAt: "2026-09-29T06:00:00Z",
    blendedValue: 31.4,
    canonicalUnit: "°C",
    spreadIndicator: 1.8,
    weightingStrategy: "WEIGHTED_SKILL",
    status: "COMPLETED",
    participatingModels: ["ECMWF", "GFS", "ICON", "JMA"],
  },
  {
    blendRunId: "run-2026-09-29-0000-t2m",
    id: "run-2026-09-29-0000-t2m",
    variableCode: "T2M",
    validAt: "2026-09-29T06:00:00Z",
    createdAt: "2026-09-29T00:00:00Z",
    blendedValue: 29.8,
    canonicalUnit: "°C",
    spreadIndicator: 2.1,
    weightingStrategy: "WEIGHTED_SKILL",
    status: "COMPLETED",
    participatingModels: ["ECMWF", "GFS", "ICON", "JMA"],
  },
  {
    blendRunId: "run-2026-09-29-0600-rain",
    id: "run-2026-09-29-0600-rain",
    variableCode: "RR",
    validAt: "2026-09-29T12:00:00Z",
    createdAt: "2026-09-29T06:00:00Z",
    blendedValue: 2.6,
    canonicalUnit: "mm",
    spreadIndicator: 1.2,
    weightingStrategy: "INVERSE_ERROR",
    status: "COMPLETED",
    participatingModels: ["ECMWF", "GFS", "ICON", "JMA"],
  },
  {
    blendRunId: "run-2026-09-29-0600-wind",
    id: "run-2026-09-29-0600-wind",
    variableCode: "WSPD",
    validAt: "2026-09-29T12:00:00Z",
    createdAt: "2026-09-29T06:00:00Z",
    blendedValue: 14.2,
    canonicalUnit: "km/h",
    spreadIndicator: 3.4,
    weightingStrategy: "WEIGHTED_SKILL",
    status: "COMPLETED",
    participatingModels: ["ECMWF", "GFS", "ICON", "JMA"],
  },
];

export const demoSkill = [
  { sourceCode: "OPEN_METEO_ECMWF", sourceName: "ECMWF", mae: 1.21, rmse: 1.83, bias: 0.12, correlation: 0.78 },
  { sourceCode: "OPEN_METEO_GFS", sourceName: "GFS", mae: 1.45, rmse: 2.12, bias: -0.18, correlation: 0.71 },
  { sourceCode: "OPEN_METEO_ICON", sourceName: "ICON", mae: 1.32, rmse: 1.96, bias: 0.05, correlation: 0.74 },
  { sourceCode: "OPEN_METEO_JMA", sourceName: "JMA", mae: 1.38, rmse: 2.05, bias: -0.1, correlation: 0.72 },
];

export const demoEvents = [
  { id: "event-001", eventType: "Heavy Rainfall", severity: "HIGH", regionCode: "IN-WB", regionName: "West Bengal", triggeredAt: "2026-09-29T05:30:00Z", validAt: "2026-09-29T12:00:00Z" },
  { id: "event-002", eventType: "High Temperature", severity: "MODERATE", regionCode: "IN-RJ", regionName: "Rajasthan", triggeredAt: "2026-09-29T04:15:00Z", validAt: "2026-09-29T15:00:00Z" },
  { id: "event-003", eventType: "Strong Wind", severity: "LOW", regionCode: "IN-GJ", regionName: "Gujarat", triggeredAt: "2026-09-29T03:00:00Z", validAt: "2026-09-29T18:00:00Z" },
];

const modelValues = [
  { sourceCode: "OPEN_METEO_ECMWF", valueOffset: 0.4, weight: 0.32 },
  { sourceCode: "OPEN_METEO_GFS", valueOffset: -0.8, weight: 0.24 },
  { sourceCode: "OPEN_METEO_ICON", valueOffset: 0.1, weight: 0.22 },
  { sourceCode: "OPEN_METEO_JMA", valueOffset: -0.3, weight: 0.22 },
];

export function getDemoRuns(variableCode: string) {
  const matchingRuns = demoRuns.filter((run) => run.variableCode === variableCode);
  return matchingRuns.length ? matchingRuns : demoRuns.filter((run) => run.variableCode === "T2M");
}

export function getDemoDetail(runId: string) {
  const run = demoRuns.find((item) => item.blendRunId === runId) ?? demoRuns[0];
  const value = run.blendedValue ?? 0;

  return {
    ...run,
    regionCode: "NORTH_INDIA",
    region: "North India",
    participatingModels: modelValues.map((model) => ({
      sourceCode: model.sourceCode,
      temperature: 31.4 + model.valueOffset,
      rainfall: 2.6 + model.valueOffset,
      wind: 14.2 + model.valueOffset,
    })),
    blendedForecast: {
      value: run.blendedValue,
      spreadIndicator: run.spreadIndicator,
      canonicalUnit: run.canonicalUnit,
    },
    weights: modelValues.map((model) => ({
      sourceCode: model.sourceCode,
      normalizedWeight: model.weight,
      weight: model.weight,
      rmseUsed: demoSkill.find((metric) => metric.sourceCode === model.sourceCode)?.rmse,
      sampleCount: 1248,
      fallbackLevel: "REGION_VARIABLE",
      contextUsed: "North India · 0-24h",
    })),
    modelContributions: modelValues.map((model) => ({
      sourceCode: model.sourceCode,
      model: model.sourceCode.replace("OPEN_METEO_", ""),
      value: value + model.valueOffset,
      forecastValue: value + model.valueOffset,
      contribution: (value + model.valueOffset) * model.weight,
    })),
    forecastValues: modelValues.map((model) => ({
      sourceCode: model.sourceCode,
      rawValue: value + model.valueOffset,
      value: value + model.valueOffset,
    })),
    models: modelValues,
  };
}

export const demoRegionWeights = Object.fromEntries(
  modelValues.map((model) => [
    model.sourceCode.replace("OPEN_METEO_", ""),
    {
      sourceCode: model.sourceCode,
      normalizedWeight: model.weight,
      rmseUsed: demoSkill.find((metric) => metric.sourceCode === model.sourceCode)?.rmse,
      sampleCount: 1248,
      fallbackLevel: "REGION_VARIABLE",
      contextUsed: "North India · 0-24h",
    },
  ]),
);