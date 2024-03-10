export namespace ANSIEscapeCode {
  export const escape = 27;
  const startEscape = [escape, 91];
  const endEscape = [109];

  const toEscapeCode = (value: string | number) =>
    Uint8Array.of(
      ...startEscape,
      ...new TextEncoder().encode(`${value}`),
      ...endEscape,
    );

  export const Reset = toEscapeCode(0);
  export const Bold = toEscapeCode(1);

  const colorsTable = {
    Black: 30,
    Red: 31,
    Green: 32,
    Yellow: 33,
    Blue: 34,
    Magenta: 35,
    Cyan: 36,
    White: 37,
    BrightBlack: 90,
    BrightRed: 91,
    BrightGreen: 92,
    BrightYellow: 93,
    BrightBlue: 94,
    BrightMagenta: 95,
    BrightCyan: 96,
    BrightWhite: 97,
  } as const;

  export const colors = Object.fromEntries(
    Object.entries(colorsTable).map(([key, codeColor]) => [
      key,
      Uint8Array.of(
        ...startEscape,
        ...new TextEncoder().encode(`${codeColor}`),
        ...endEscape,
      ),
    ]),
  ) as Record<keyof typeof colorsTable, Uint8Array>;
}
