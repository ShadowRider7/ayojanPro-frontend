"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  formatNationalNumber,
  getCountry,
  matchCountryFromDialCode,
  parsePhone,
  phonePlaceholder,
  toNationalDigits,
  toTypedNationalDigits,
  withCountryDialCode,
} from "@/utils";

const COUNTRY_ITEMS = COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.name} ${country.dialCode}`,
}));

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type" | "inputMode" | "autoComplete" | "placeholder"
> & {
  /** Stored value in E.164 form (`+8801712345678`) or an empty string. */
  value: string | null | undefined;

  onValueChange: (value: string) => void;
};

/**
 * Country-code dropdown plus a national number field. The dropdown owns the
 * dialling code, the input formats the national number (`1712 345678`) and the
 * combined value is always stored as E.164 (`+8801712345678`).
 */
export function PhoneInput({
  value,
  onValueChange,
  className,
  ...props
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState(
    () => parsePhone(value).country.code,
  );

  const country = getCountry(countryCode);
  const nationalDigits = toNationalDigits(value, country);
  const nationalNumber = formatNationalNumber(country, nationalDigits);

  // Adopt the country of a value that comes from outside this input — a saved
  // number after a profile update, for example.
  const externalCountry = matchCountryFromDialCode(value);
  useEffect(() => {
    if (externalCountry && externalCountry.dialCode !== country.dialCode) {
      setCountryCode(externalCountry.code);
    }
  }, [externalCountry, country.dialCode]);

  const handleCountryChange = (nextCountryCode: string | null) => {
    if (!nextCountryCode) {
      return;
    }

    setCountryCode(nextCountryCode);
    onValueChange(withCountryDialCode(nextCountryCode, value));
  };

  const handleNationalChange = (typedValue: string) => {
    const digits = toTypedNationalDigits(typedValue, country);

    onValueChange(digits ? `${country.dialCode}${digits}` : "");
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        items={COUNTRY_ITEMS}
        value={country.code}
        onValueChange={handleCountryChange}
        disabled={props.disabled}
      >
        <SelectTrigger className="w-24 shrink-0" aria-label="Country code">
          <SelectValue>
            {(code: string) => (code ? getCountry(code).dialCode : "")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.name} {item.dialCode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        {...props}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={phonePlaceholder(country)}
        className="min-w-0 flex-1"
        value={nationalNumber}
        onChange={(event) => handleNationalChange(event.target.value)}
      />
    </div>
  );
}
