export type HealthStatus = {
  status?: string;
  message?: string;
  healthy?: boolean;
  version?: string;
  timestamp?: string;
  environment?: string;
  services?: Record<string, unknown>;
};

export type Forecast = {
  id?: string;
  model?: string;
  region?: string;
  variable?: string;
  validTime?: string;
  value?: number;
  unit?: string;
  values?: Array<Record<string, number | string>>;
  timestamp?: string;
};

export type Model = {
  name: string;
  provider?: string;
  color?: string;
  confidence?: number;
  temperature?: number;
  rainfall?: number;
  wind?: number;
  error?: number;
};

export type SkillMetric = {
  model?: string;
  name?: string;
  mae?: number;
  rmse?: number;
  bias?: number;
  correlation?: number;
  skillScore?: number;
  score?: number;
};

export type ModelSkill = {
  model?: string;
  provider?: string;
  score?: number;
  mae?: number;
  rmse?: number;
  bias?: number;
  correlation?: number;
};

export type Weight = {
  model?: string;
  name?: string;
  weight?: number;
  value?: number;
  strategy?: string;
  change?: number;
};

export type BlendRun = {
  id?: string;
  status?: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  modelCount?: number;
  confidence?: number;
  region?: string;
};

export type BlendRunDetail = BlendRun & {
  weights?: Weight[];
  models?: string[];
  forecast?: Forecast;
  summary?: Record<string, unknown>;
};

export type ExtremeWeatherEvent = {
  id?: string;
  type?: string;
  severity?: string;
  region?: string;
  forecastTime?: string;
  confidence?: number;
  status?: string;
  description?: string;
};

export type WorkflowResult = {
  status?: string;
  message?: string;
  stage?: string;
  startedAt?: string;
  completedAt?: string;
  traceId?: string;
  data?: Record<string, unknown>;
};

export type SearchResult = {
  id?: string;
  label: string;
  href: string;
  kind?: string;
};
