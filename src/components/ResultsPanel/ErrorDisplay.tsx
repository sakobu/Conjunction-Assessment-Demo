import type { AssessError } from "../../lib/index.ts";

type ErrorDisplayProps = {
  error: AssessError;
};

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (error.kind === "domain") {
    return (
      <div
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid var(--risk-red)",
          borderRadius: 6,
          padding: "12px 14px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--risk-red)",
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          Domain Error
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-primary)" }}>
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(234, 179, 8, 0.1)",
        border: "1px solid var(--risk-amber)",
        borderRadius: 6,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--risk-amber)",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        Validation Errors
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {Object.entries(error.errors).map(([field, message]) => (
          <li
            key={field}
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-primary)",
              marginBottom: 4,
              paddingLeft: 8,
              borderLeft: "2px solid var(--risk-amber)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
              }}
            >
              {field}
            </span>
            <br />
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
