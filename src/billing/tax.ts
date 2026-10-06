import type { Address, TaxClass } from '../types.ts';

/** Combined sales tax by country, then by region (province or state). */
const RATES: Record<string, Record<string, number>> = {
  CA: {
    AB: 0.05,
    BC: 0.12,
    MB: 0.12,
    NB: 0.15,
    NL: 0.15,
    NS: 0.15,
    NT: 0.05,
    NU: 0.05,
    ON: 0.13,
    PE: 0.15,
    QC: 0.14,
    SK: 0.11,
    YT: 0.05,
  },
  US: {
    CA: 0.0725,
    FL: 0.06,
    NY: 0.04,
    OR: 0,
    TX: 0.0625,
    WA: 0.065,
  },
};

/** Regional portion of the listed Canadian rates; the federal portion is 5%. */
const CANADIAN_REGIONAL_RATES: Record<string, number> = {
  AB: 0,
  BC: 0.07,
  MB: 0.07,
  NB: 0.1,
  NL: 0.1,
  NS: 0.1,
  NT: 0,
  NU: 0,
  ON: 0.08,
  PE: 0.1,
  QC: 0.09,
  SK: 0.06,
  YT: 0,
};

/** Share of the full rate charged on `reduced` goods such as food. */
const REDUCED_SHARE = 0.5;

/** Federal and regional rate fractions, with unknown destinations entirely regional. */
export function taxComponentsFor(address: Address, taxClass: TaxClass, fallback: number): { federal: number; regional: number } {
  if (taxClass === 'exempt') return { federal: 0, regional: 0 };
  const country = address.country.toUpperCase();
  const region = address.region.toUpperCase();
  const canadianRegional = country === 'CA' ? CANADIAN_REGIONAL_RATES[region] : undefined;
  const share = taxClass === 'reduced' ? REDUCED_SHARE : 1;
  return {
    federal: canadianRegional === undefined ? 0 : 0.05 * share,
    regional: (canadianRegional ?? RATES[country]?.[region] ?? fallback) * share,
  };
}

/**
 * The tax rate (a fraction, 0.13 = 13%) that applies to goods of `taxClass`
 * shipped to `address`. Unknown regions fall back to `fallback`.
 */
export function taxRateFor(address: Address, taxClass: TaxClass, fallback: number): number {
  if (taxClass === 'exempt') return 0;
  const country = address.country.toUpperCase();
  const region = address.region.toUpperCase();
  const full = RATES[country]?.[region] ?? fallback;
  return taxClass === 'reduced' ? full * REDUCED_SHARE : full;
}
