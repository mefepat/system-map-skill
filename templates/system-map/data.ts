export type SystemCategory =
  | "AGENTS"
  | "SURFACES"
  | "CORE_SUBSYSTEMS"
  | "STORE_DATA"
  | "EXTERNAL_DEPLOY";

export type NodeStatus = "active" | "planned" | "deprecated";

export interface SystemNodeData extends Record<string, unknown> {
  id: string;
  category: SystemCategory;
  title: string;
  subtitle?: string;
  description: string;
  tags?: string[];
  status?: NodeStatus;
  healthUrl?: string;
  healthStatus?: "online" | "degraded" | "offline";
}

export type EdgeKind = "auth" | "data" | "ai" | "http" | "deploy";

export interface SystemEdgeData extends Record<string, unknown> {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
}

export const CATEGORY_LABELS: Record<SystemCategory, string> = {
  AGENTS: "Agents",
  SURFACES: "Surfaces",
  CORE_SUBSYSTEMS: "Core Subsystems",
  STORE_DATA: "Store + Data",
  EXTERNAL_DEPLOY: "External & Deploy",
};

// Default generic example data. Agents replacing this will build their project's real inventory here.
export const SYSTEM_NODES: SystemNodeData[] = [
  {
    id: "agent-support-copilot",
    category: "AGENTS",
    title: "Support Copilot",
    subtitle: "GPT-4o powered",
    description: "Answers customer tickets, drafts replies, escalates to a human when unsure.",
    tags: ["gpt-4o", "tickets"],
  },
  {
    id: "agent-onboarding-assistant",
    category: "AGENTS",
    title: "Onboarding Assistant",
    subtitle: "in-app guide",
    description: "Walks new users through first-time setup and surfaces relevant docs.",
    tags: ["activation"],
  },
  {
    id: "agent-code-review-bot",
    category: "AGENTS",
    title: "Code Review Bot",
    subtitle: "CI integration",
    description: "Leaves automated review comments on pull requests before a human looks.",
    tags: ["ci", "pr"],
  },
  {
    id: "agent-sales-assistant",
    category: "AGENTS",
    title: "Sales Assistant",
    subtitle: "not yet built",
    description: "Planned: drafts personalized outbound emails from CRM signals.",
    tags: ["planned"],
    status: "planned",
  },
  {
    id: "surface-marketing-site",
    category: "SURFACES",
    title: "Marketing Site",
    subtitle: "acme.cloud",
    description: "Public-facing site — pricing, docs, blog. Optimized for conversion.",
    tags: ["public"],
  },
  {
    id: "surface-web-app",
    category: "SURFACES",
    title: "Web App",
    subtitle: "app.acme.cloud",
    description: "The main product — where paying customers spend their day.",
    tags: ["core"],
  },
  {
    id: "surface-mobile-app",
    category: "SURFACES",
    title: "Mobile App",
    subtitle: "iOS + Android",
    description: "Companion client for on-the-go access to the same account.",
    tags: ["ios", "android"],
  },
  {
    id: "surface-admin-console",
    category: "SURFACES",
    title: "Admin Console",
    subtitle: "internal only",
    description: "Internal tool for support and ops to manage customer accounts.",
    tags: ["internal"],
  },
  {
    id: "surface-public-api",
    category: "SURFACES",
    title: "Public API",
    subtitle: "REST + webhooks",
    description: "Lets customers integrate Acme Cloud into their own systems.",
    tags: ["rest", "webhooks"],
  },
  {
    id: "core-auth-service",
    category: "CORE_SUBSYSTEMS",
    title: "Auth Service",
    subtitle: "sessions + JWT",
    description: "Issues and verifies sessions across web, mobile, and the public API.",
    tags: ["jwt"],
  },
  {
    id: "core-billing-engine",
    category: "CORE_SUBSYSTEMS",
    title: "Billing Engine",
    subtitle: "usage-based",
    description: "Calculates usage, generates invoices, syncs plan state to Stripe.",
    tags: ["billing"],
  },
  {
    id: "core-notification-queue",
    category: "CORE_SUBSYSTEMS",
    title: "Notification Queue",
    subtitle: "async worker",
    description: "Fans out email, push, and SMS notifications without blocking requests.",
    tags: ["async"],
  },
  {
    id: "core-permission-layer",
    category: "CORE_SUBSYSTEMS",
    title: "Permission Layer",
    subtitle: "RBAC",
    description: "Central role/permission checks shared by every surface and the API.",
    tags: ["rbac"],
  },
  {
    id: "core-search-indexer",
    category: "CORE_SUBSYSTEMS",
    title: "Search Indexer",
    subtitle: "background job",
    description: "Keeps the in-app search index in sync with the primary database.",
    tags: ["background"],
  },
  {
    id: "core-rate-limiter",
    category: "CORE_SUBSYSTEMS",
    title: "Rate Limiter",
    subtitle: "API middleware",
    description: "Throttles abusive traffic on the public API using a sliding window.",
    tags: ["middleware"],
  },
  {
    id: "store-postgres",
    category: "STORE_DATA",
    title: "Postgres",
    subtitle: "primary database",
    description: "System of record for accounts, billing, and product data.",
    tags: ["sql"],
  },
  {
    id: "store-redis",
    category: "STORE_DATA",
    title: "Redis Cache",
    subtitle: "hot data + sessions",
    description: "Sub-millisecond reads for session lookups and rate-limit counters.",
    tags: ["cache"],
  },
  {
    id: "store-s3",
    category: "STORE_DATA",
    title: "S3 Object Storage",
    subtitle: "files + media",
    description: "Stores uploaded files, exports, and generated reports.",
    tags: ["storage"],
  },
  {
    id: "store-analytics-warehouse",
    category: "STORE_DATA",
    title: "Analytics Warehouse",
    subtitle: "BigQuery",
    description: "Batch-replicated data for product analytics and internal dashboards.",
    tags: ["olap"],
  },
  {
    id: "store-vector-store",
    category: "STORE_DATA",
    title: "Vector Store",
    subtitle: "not yet built",
    description: "Planned: embeddings store powering semantic search across documents.",
    tags: ["planned"],
    status: "planned",
  },
  {
    id: "ext-stripe",
    category: "EXTERNAL_DEPLOY",
    title: "Stripe",
    subtitle: "payments",
    description: "Handles subscription billing, invoicing, and payment methods.",
    tags: ["payments"],
  },
  {
    id: "ext-sendgrid",
    category: "EXTERNAL_DEPLOY",
    title: "SendGrid",
    subtitle: "transactional email",
    description: "Delivers receipts, alerts, and product emails.",
    tags: ["email"],
  },
  {
    id: "ext-vercel",
    category: "EXTERNAL_DEPLOY",
    title: "Vercel",
    subtitle: "hosting",
    description: "Builds and serves the marketing site and web app.",
    tags: ["hosting"],
  },
  {
    id: "ext-sentry",
    category: "EXTERNAL_DEPLOY",
    title: "Sentry",
    subtitle: "error monitoring",
    description: "Catches and groups exceptions across every service.",
    tags: ["monitoring"],
  },
  {
    id: "ext-openai",
    category: "EXTERNAL_DEPLOY",
    title: "OpenAI API",
    subtitle: "LLM provider",
    description: "Powers every AI agent in the Agents column.",
    tags: ["llm"],
  },
];

export const SYSTEM_EDGES: SystemEdgeData[] = [
  { id: "e1", source: "surface-marketing-site", target: "core-auth-service", kind: "auth", label: "signup" },
  { id: "e2", source: "surface-web-app", target: "core-auth-service", kind: "auth" },
  { id: "e3", source: "surface-mobile-app", target: "surface-public-api", kind: "http" },
  { id: "e4", source: "surface-public-api", target: "core-auth-service", kind: "auth" },
  { id: "e5", source: "surface-public-api", target: "core-rate-limiter", kind: "http" },
  { id: "e6", source: "surface-admin-console", target: "core-permission-layer", kind: "auth" },
  { id: "e7", source: "core-auth-service", target: "store-postgres", kind: "data" },
  { id: "e8", source: "core-permission-layer", target: "store-postgres", kind: "data" },
  { id: "e9", source: "core-rate-limiter", target: "store-redis", kind: "data" },
  { id: "e10", source: "surface-web-app", target: "core-billing-engine", kind: "data" },
  { id: "e11", source: "core-billing-engine", target: "store-postgres", kind: "data" },
  { id: "e12", source: "core-billing-engine", target: "ext-stripe", kind: "http", label: "sync" },
  { id: "e13", source: "surface-web-app", target: "core-notification-queue", kind: "data" },
  { id: "e14", source: "core-notification-queue", target: "ext-sendgrid", kind: "http" },
  { id: "e15", source: "core-search-indexer", target: "store-postgres", kind: "data" },
  { id: "e16", source: "core-search-indexer", target: "store-analytics-warehouse", kind: "data" },
  { id: "e17", source: "agent-support-copilot", target: "ext-openai", kind: "ai" },
  { id: "e18", source: "agent-onboarding-assistant", target: "store-postgres", kind: "data" },
  { id: "e19", source: "agent-code-review-bot", target: "surface-public-api", kind: "http" },
  { id: "e20", source: "agent-sales-assistant", target: "ext-openai", kind: "ai", label: "planned" },
  { id: "e21", source: "store-vector-store", target: "ext-openai", kind: "ai", label: "planned" },
  { id: "e22", source: "surface-web-app", target: "ext-vercel", kind: "deploy" },
  { id: "e23", source: "surface-marketing-site", target: "ext-vercel", kind: "deploy" },
  { id: "e24", source: "core-auth-service", target: "ext-sentry", kind: "http", label: "monitor" },
  { id: "e25", source: "core-billing-engine", target: "ext-sentry", kind: "http" },
];
