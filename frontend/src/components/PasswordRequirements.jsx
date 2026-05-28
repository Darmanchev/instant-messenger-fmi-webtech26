export default function PasswordRequirements({ rules = [] }) {
  if (!rules.length) return null

  return (
    <div className="alert alert-warning mt-2 mb-0 py-2" role="status" aria-live="polite">
      <div className="d-flex align-items-start gap-2">
        <i className="bi bi-shield-lock fs-5 text-warning-emphasis"></i>
        <div className="w-100">
          <div className="fw-semibold mb-2">Password requirements</div>
          <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
            {rules.map(rule => (
              <li key={rule.id ?? rule.label} className="d-flex align-items-center gap-2">
                <i
                  className={`bi ${
                    rule.passed
                      ? 'bi-check-circle-fill text-success'
                      : 'bi-circle text-secondary'
                  }`}
                ></i>
                <span className={rule.passed ? 'text-success-emphasis' : ''}>
                  {rule.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
