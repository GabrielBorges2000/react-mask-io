import { defaultFormatChars } from "../constants";

type MaskType = string | (string | RegExp)[];

export interface ParsedMaskOptions {
  mask: (string | RegExp)[] | null;
  maskPlaceholder: string | null;
  prefix: string | null;
  lastEditablePosition: number | null;
  permanents: number[];
}

export interface MaskOptions {
  mask?: MaskType;
  maskPlaceholder?: string;
}

export function parseMask(options: MaskOptions): ParsedMaskOptions {
  const { mask, maskPlaceholder } = options;
  const permanents: number[] = [];

  if (!mask) {
    return {
      maskPlaceholder: null,
      mask: null,
      prefix: null,
      lastEditablePosition: null,
      permanents: [],
    };
  }

  let parsedMask: (string | RegExp)[];

  if (typeof mask === "string") {
    let isPermanent = false;
    let parsedMaskString = "";

    mask.split("").forEach((character) => {
      if (!isPermanent && character === "\\") {
        isPermanent = true;
      } else {
        if (
          isPermanent ||
          !defaultFormatChars[character as keyof typeof defaultFormatChars]
        ) {
          permanents.push(parsedMaskString.length);
        }
        parsedMaskString += character;
        isPermanent = false;
      }
    });

    parsedMask = parsedMaskString.split("").map((character, index) => {
      if (permanents.indexOf(index) === -1) {
        return (
          defaultFormatChars[character as keyof typeof defaultFormatChars] ||
          character
        );
      }

      return character;
    });
  } else {
    parsedMask = mask;
    mask.forEach((character, index) => {
      if (typeof character === "string") {
        permanents.push(index);
      }
    });
  }

  let parsedMaskPlaceholder: string | null = maskPlaceholder ?? null;

  if (parsedMaskPlaceholder) {
    let placeholder = parsedMaskPlaceholder;

    if (placeholder.length === 1) {
      placeholder = parsedMask
        .map((character, index) => {
          if (permanents.indexOf(index) !== -1) {
            return character;
          }
          
          return placeholder;
        })
        .join("");
    } else {
      placeholder = placeholder.split("").join("");
    }

    permanents.forEach((position) => {
      const chars = placeholder.split("");
      chars[position] = String(parsedMask[position]);
      placeholder = chars.join("");
    });

    parsedMaskPlaceholder = placeholder;
  }

  const prefix = permanents
    .filter((position, index) => position === index)
    .map((position) => parsedMask[position])
    .join("");

  let lastEditablePosition = parsedMask.length - 1;
  while (permanents.indexOf(lastEditablePosition) !== -1) {
    lastEditablePosition--;
  }

  return {
    maskPlaceholder: parsedMaskPlaceholder,
    prefix,
    mask: parsedMask,
    lastEditablePosition,
    permanents,
  };
}
