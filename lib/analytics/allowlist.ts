const allowedMetadataKeys = new Set([
  "frontline_category",
  "current_role_category",
  "industry",
  "goal",
  "selected_role_count",
  "quality_bucket",
  "generation_status",
  "payment_status",
  "failure_code"
]);

export function sanitizeAnalyticsMetadata(input: Record<string, unknown>): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => allowedMetadataKeys.has(key))
      .map(([key, value]) => {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
          return [key, value];
        }
        return [key, String(value)];
      })
  );
}
