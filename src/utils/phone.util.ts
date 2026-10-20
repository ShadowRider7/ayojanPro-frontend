import {
  type Country,
  DEFAULT_COUNTRY_CODE,
  findCountryByDialCode,
  getCountry,
} from "./countries.util";

/** E.164 caps the whole number — `+`, country code and national part — at 15 chars. */
const E164_MAX_DIGITS = 15;

const MIN_NATIONAL_DIGITS = 4;

/** Bangladesh mobile numbers: `01XXXXXXXXX`, stored without the trunk `0`. */
const BD_NATIONAL_REGEX = /^1[3-9]\d{8}$/;

export type ParsedPhone = {
  country: Country;

  /** Digits of the national number, without the country code. */
  nationalDigits: string;
};

/**
 * Resolves the country of a value written with a `+` prefix (`+880…` → BD).
 * Returns `undefined` when the dialling code is unknown or missing.
 */
export function matchCountryFromDialCode(
  value: string | null | undefined,
): Country | undefined {
  const raw = (value ?? "").trim();

  if (!raw.startsWith("+")) {
    return undefined;
  }

  const digits = raw.slice(1).replace(/\D/g, "");

  for (let length = 3; length >= 1; length -= 1) {
    const country = findCountryByDialCode(`+${digits.slice(0, length)}`);

    if (country) {
      return country;
    }
  }

  return undefined;
}

/** Strips the country code and any trunk `0`, and caps the national length. */
export function toNationalDigits(
  value: string | null | undefined,
  country: Country,
): string {
  const dialDigits = country.dialCode.slice(1);
  const digits = (value ?? "").replace(/\D/g, "");

  const national = digits.startsWith(dialDigits)
    ? digits.slice(dialDigits.length)
    : digits;

  return normalizeNationalDigits(national, country);
}

/** Strips a leading trunk `0` and caps the length allowed by E.164. */
function normalizeNationalDigits(digits: string, country: Country): string {
  // Bangladeshi numbers are usually written with the leading trunk `0` while the
  // dialling code already replaces it, so drop it while typing.
  const withoutTrunk =
    country.code === DEFAULT_COUNTRY_CODE
      ? digits.replace(/^0+(?=\d)/, "")
      : digits;

  // `+` counts towards the 15 character E.164 limit.
  return withoutTrunk.slice(0, E164_MAX_DIGITS - country.dialCode.length + 1);
}

/** Normalises what the user typed into the national field (no country code yet). */
export function toTypedNationalDigits(value: string, country: Country): string {
  return normalizeNationalDigits(value.replace(/\D/g, ""), country);
}

/** Splits a stored value (`+8801712345678`, `01712345678`) into country + national part. */
export function parsePhone(value: string | null | undefined): ParsedPhone {
  const country =
    matchCountryFromDialCode(value) ?? getCountry(DEFAULT_COUNTRY_CODE);

  return { country, nationalDigits: toNationalDigits(value, country) };
}

/** Formats the national part: `1712345678` → `1712 345678` (BD) or `9876543210`. */
export function formatNationalNumber(country: Country, digits: string): string {
  if (!digits) {
    return "";
  }

  // Only Bangladesh has a known national grouping here; other countries are
  // shown as typed so digits are never rearranged.
  if (country.code !== DEFAULT_COUNTRY_CODE) {
    return digits;
  }

  return digits.length > 4
    ? `${digits.slice(0, 4)} ${digits.slice(4)}`
    : digits;
}

/** Formats what the user typed in the national field, honouring the country rules. */
export function formatPhoneNationalInput(
  country: Country,
  value: string,
): string {
  return formatNationalNumber(country, toTypedNationalDigits(value, country));
}

/** Renders a stored value for display: `+880 1712 345678`. */
export function formatPhone(value: string | null | undefined): string {
  const { country, nationalDigits } = parsePhone(value);

  if (!nationalDigits) {
    return "";
  }

  return `${country.dialCode} ${formatNationalNumber(country, nationalDigits)}`;
}

/** Returns the stored E.164 value (`+8801712345678`) or `null` when empty. */
export function toE164Phone(value: string | null | undefined): string | null {
  const { country, nationalDigits } = parsePhone(value);

  return nationalDigits ? `${country.dialCode}${nationalDigits}` : null;
}

/** Rewrites a stored value with another country code, keeping the national part. */
export function withCountryDialCode(
  countryCode: string,
  value: string | null | undefined,
): string {
  const country = getCountry(countryCode);
  const digits = toTypedNationalDigits(
    parsePhone(value).nationalDigits,
    country,
  );

  return digits ? `${country.dialCode}${digits}` : "";
}

export function isValidPhone(value: string | null | undefined): boolean {
  const { country, nationalDigits } = parsePhone(value);

  if (!nationalDigits) {
    return false;
  }

  if (country.code === DEFAULT_COUNTRY_CODE) {
    return BD_NATIONAL_REGEX.test(nationalDigits);
  }

  return (
    nationalDigits.length >= MIN_NATIONAL_DIGITS &&
    nationalDigits.length + country.dialCode.length <= E164_MAX_DIGITS
  );
}

export function phonePlaceholder(country: Country): string {
  return country.code === DEFAULT_COUNTRY_CODE
    ? "1712 345678"
    : "National number";
}
