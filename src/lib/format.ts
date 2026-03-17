const ROMAN_NUMERALS: [number, string][] = [
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

/** Convert a positive integer to a roman numeral string. */
export function toRoman(n: number): string {
  let result = "";
  for (const [value, numeral] of ROMAN_NUMERALS) {
    while (n >= value) {
      result += numeral;
      n -= value;
    }
  }
  return result;
}
