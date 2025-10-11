/**
 * Email Validation Module
 * ========================
 * Validates email addresses using DNS MX record lookup (100% free, no API needed)
 *
 * Features:
 * - Format validation (regex)
 * - Domain validation (DNS MX records)
 * - Bulk validation with progress tracking
 * - No external API costs
 */

import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// Email regex pattern (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export interface EmailValidationResult {
  email: string;
  isValid: boolean;
  hasValidFormat: boolean;
  hasValidMxRecords: boolean;
  mxRecords?: dns.MxRecord[];
  error?: string;
}

/**
 * Validate email format using regex
 */
export function validateEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmedEmail = email.trim().toLowerCase();
  return EMAIL_REGEX.test(trimmedEmail);
}

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  try {
    const parts = email.trim().toLowerCase().split('@');
    return parts.length === 2 ? parts[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if domain has valid MX records (mail servers)
 */
export async function checkMxRecords(domain: string): Promise<{
  isValid: boolean;
  mxRecords?: dns.MxRecord[];
  error?: string;
}> {
  try {
    const mxRecords = await resolveMx(domain);

    if (mxRecords && mxRecords.length > 0) {
      return {
        isValid: true,
        mxRecords: mxRecords.sort((a, b) => a.priority - b.priority)
      };
    }

    return {
      isValid: false,
      error: 'No MX records found'
    };
  } catch (error: any) {
    // Common DNS errors
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        isValid: false,
        error: 'Domain does not exist or has no mail servers'
      };
    }

    return {
      isValid: false,
      error: `DNS lookup failed: ${error.message}`
    };
  }
}

/**
 * Validate a single email address (format + MX records)
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  // Step 1: Validate format
  const hasValidFormat = validateEmailFormat(email);

  if (!hasValidFormat) {
    return {
      email,
      isValid: false,
      hasValidFormat: false,
      hasValidMxRecords: false,
      error: 'Invalid email format'
    };
  }

  // Step 2: Extract domain
  const domain = extractDomain(email);

  if (!domain) {
    return {
      email,
      isValid: false,
      hasValidFormat: true,
      hasValidMxRecords: false,
      error: 'Could not extract domain'
    };
  }

  // Step 3: Check MX records
  const mxCheck = await checkMxRecords(domain);

  return {
    email,
    isValid: hasValidFormat && mxCheck.isValid,
    hasValidFormat: true,
    hasValidMxRecords: mxCheck.isValid,
    mxRecords: mxCheck.mxRecords,
    error: mxCheck.error
  };
}

/**
 * Validate multiple emails in bulk with progress tracking
 */
export async function validateEmailsBulk(
  emails: string[],
  onProgress?: (current: number, total: number, email: string) => void
): Promise<EmailValidationResult[]> {
  const results: EmailValidationResult[] = [];
  const uniqueEmails = [...new Set(emails.filter(e => e && e.trim()))];

  console.log(`\n🔍 Validating ${uniqueEmails.length} unique email addresses...\n`);

  for (let i = 0; i < uniqueEmails.length; i++) {
    const email = uniqueEmails[i].trim().toLowerCase();

    try {
      const result = await validateEmail(email);
      results.push(result);

      // Progress callback
      if (onProgress) {
        onProgress(i + 1, uniqueEmails.length, email);
      }

      // Rate limiting: 100ms delay between DNS queries
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      results.push({
        email,
        isValid: false,
        hasValidFormat: false,
        hasValidMxRecords: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Get validation statistics
 */
export function getValidationStats(results: EmailValidationResult[]): {
  total: number;
  valid: number;
  invalid: number;
  validPercentage: number;
  invalidReasons: Record<string, number>;
} {
  const total = results.length;
  const valid = results.filter(r => r.isValid).length;
  const invalid = total - valid;

  // Count error reasons
  const invalidReasons: Record<string, number> = {};
  results
    .filter(r => !r.isValid && r.error)
    .forEach(r => {
      const reason = r.error || 'Unknown';
      invalidReasons[reason] = (invalidReasons[reason] || 0) + 1;
    });

  return {
    total,
    valid,
    invalid,
    validPercentage: total > 0 ? Math.round((valid / total) * 100) : 0,
    invalidReasons
  };
}

/**
 * Filter emails by priority (prefer official domains over personal)
 */
export function prioritizeEmails(emails: string[]): string[] {
  const official: string[] = [];
  const personal: string[] = [];

  emails.forEach(email => {
    const domain = extractDomain(email);
    if (!domain) return;

    // Personal email providers
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com'];

    if (personalDomains.includes(domain.toLowerCase())) {
      personal.push(email);
    } else {
      official.push(email);
    }
  });

  // Return official emails first, then personal
  return [...official, ...personal];
}

/**
 * Extract emails from text using regex
 */
export function extractEmailsFromText(text: string): string[] {
  if (!text) return [];

  const emailMatches = text.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/g);

  if (!emailMatches) return [];

  // Clean and deduplicate
  const uniqueEmails = [...new Set(emailMatches.map(e => e.trim().toLowerCase()))];

  return uniqueEmails;
}
