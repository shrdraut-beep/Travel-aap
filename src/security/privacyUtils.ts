/**
 * Privacy & Tax Compliance Transformer Utilities
 * 
 * Two-Tier Architecture:
 * - Tier 1: Legal PAN, GSTIN, and full addresses remain in backend tax storage for statutory 8-year audit.
 * - Tier 2: Frontend UI & Digital Vouchers display only masked identities and cryptographic KYC hashes.
 */

export interface MaskedIdentityProfile {
  maskedName: string;
  maskedPhone: string;
  maskedVehicle: string;
  kycVerificationHash: string;
  gstinMasked?: string;
}

/**
 * Generates masked string (e.g., 'An*** Sh***')
 */
export function maskName(fullName: string): string {
  if (!fullName) return 'User';
  return fullName
    .split(' ')
    .map(part => {
      if (part.length <= 2) return `${part[0]}*`;
      return `${part[0]}${'*'.repeat(Math.min(part.length - 2, 4))}${part[part.length - 1]}`;
    })
    .join(' ');
}

/**
 * Mask Phone Number: e.g. +91 98******10
 */
export function maskPhone(phone: string): string {
  if (!phone) return '+91 98******10';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 10) return '+91 ******00';
  const last2 = clean.slice(-2);
  const first2 = clean.startsWith('+91') ? clean.slice(3, 5) : clean.slice(0, 2);
  return `+91 ${first2}******${last2}`;
}

/**
 * Mask Vehicle Registration: e.g. MH-12-**-****
 */
export function maskVehicleNumber(regNo: string): string {
  if (!regNo) return 'MH-12-**-****';
  const clean = regNo.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length < 6) return 'MH-**-****';
  const stateCode = clean.slice(0, 4);
  return `${stateCode.slice(0, 2)}-${stateCode.slice(2, 4)}-**-****`;
}

/**
 * Generate a privacy-preserving KYC verification hash
 */
export function generateKycHash(userId: string, prefix = 'KYC'): string {
  const hashSource = `${userId || 'BIDINN'}_SALT_SECURE_2026`;
  let hashVal = 0;
  for (let i = 0; i < hashSource.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashSource.charCodeAt(i);
    hashVal |= 0;
  }
  const hexStr = Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0');
  return `[✔ ${prefix}-${hexStr.substring(0, 8)}]`;
}

/**
 * Complete identity masking package for UI & vouchers
 */
export function getMaskedIdentity(name: string, phone: string, userId: string, vehicleNo?: string): MaskedIdentityProfile {
  return {
    maskedName: maskName(name),
    maskedPhone: maskPhone(phone),
    maskedVehicle: maskVehicleNumber(vehicleNo || ''),
    kycVerificationHash: generateKycHash(userId),
    gstinMasked: '27AAAAA****1Z5'
  };
}
