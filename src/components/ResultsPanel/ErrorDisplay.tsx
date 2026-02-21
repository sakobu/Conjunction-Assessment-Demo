import type { AssessError } from "../../lib/index.ts";

type ErrorDisplayProps = {
  error: AssessError;
};

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (error.kind === "domain") {
    return (
      <div className="error-box error-box--domain">
        <div className="error-box__heading error-box__heading--domain">
          Domain Error
        </div>
        <div className="error-box__message">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="error-box error-box--validation">
      <div className="error-box__heading error-box__heading--validation">
        Validation Errors
      </div>
      <ul className="error-box__list">
        {Object.entries(error.errors).map(([field, message]) => (
          <li key={field} className="error-box__item">
            <span className="error-box__field">
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
