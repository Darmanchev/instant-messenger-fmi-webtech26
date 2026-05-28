export const passwordRequirements = [
  {
    id: 'min-length',
    label: 'Use at least 8 characters',
    test: value => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Include at least one uppercase letter',
    test: value => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'Include at least one lowercase letter',
    test: value => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'Include at least one number',
    test: value => /\d/.test(value),
  },
]

export function evaluatePassword(password = '') {
  return passwordRequirements.map(requirement => ({
    id: requirement.id,
    label: requirement.label,
    passed: requirement.test(password),
  }))
}

export function isPasswordStrong(password = '') {
  return evaluatePassword(password).every(requirement => requirement.passed)
}
