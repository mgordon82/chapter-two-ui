// src/auth/passwordPolicy.ts

export type PasswordPolicy = {
  minLength: number;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
};

export type PasswordRuleKey =
  | 'minLength'
  | 'lowercase'
  | 'uppercase'
  | 'number'
  | 'symbol';

export type PasswordRuleResult = {
  key: PasswordRuleKey;
  label: string;
  passed: boolean;
};

export type PasswordValidationResult = {
  rules: PasswordRuleResult[];
  isValid: boolean;
};

/**
 * IMPORTANT:
 * Cognito password policy is configured per User Pool and can differ.
 * Keep this policy in one place so you can match your environment.
 */
export const defaultCognitoLikePolicy: PasswordPolicy = {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSymbols: true
};

function hasLowercase(s: string) {
  return /[a-z]/.test(s);
}
function hasUppercase(s: string) {
  return /[A-Z]/.test(s);
}
function hasNumber(s: string) {
  return /[0-9]/.test(s);
}
/**
 * Cognito considers "symbols" as non-alphanumeric characters.
 * This is a decent approximation for UI validation.
 */
function hasSymbol(s: string) {
  return /[^A-Za-z0-9]/.test(s);
}

export function validatePassword(
  password: string,
  policy: PasswordPolicy = defaultCognitoLikePolicy
): PasswordValidationResult {
  const rules: PasswordRuleResult[] = [];

  rules.push({
    key: 'minLength',
    label: `At least ${policy.minLength} characters`,
    passed: password.length >= policy.minLength
  });

  if (policy.requireLowercase) {
    rules.push({
      key: 'lowercase',
      label: 'At least 1 lowercase letter (a–z)',
      passed: hasLowercase(password)
    });
  }

  if (policy.requireUppercase) {
    rules.push({
      key: 'uppercase',
      label: 'At least 1 uppercase letter (A–Z)',
      passed: hasUppercase(password)
    });
  }

  if (policy.requireNumbers) {
    rules.push({
      key: 'number',
      label: 'At least 1 number (0–9)',
      passed: hasNumber(password)
    });
  }

  if (policy.requireSymbols) {
    rules.push({
      key: 'symbol',
      label: 'At least 1 symbol (e.g. !@#$)',
      passed: hasSymbol(password)
    });
  }

  const isValid = rules.every((r) => r.passed);
  return { rules, isValid };
}

export function passwordsMatch(a: string, b: string) {
  return a.length > 0 && a === b;
}
