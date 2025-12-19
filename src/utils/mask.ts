import { findLastIndex, repeat } from "./helpers";
import { ParsedMaskOptions, parseMask } from "./parse-mask";

interface Selection {
  start: number | null;
  end: number | null;
  length?: number;
}

interface InputState {
  value: string;
  selection: Selection;
  enteredString?: string;
}

interface MaskOptions {
  mask?: string | (string | RegExp)[];
  maskPlaceholder?: string;
}

export class MaskUtilities {
  private maskOptions: ParsedMaskOptions;

  constructor(options: MaskOptions) {
    this.maskOptions = parseMask(options);
  }

  private isCharacterAllowedAtPosition = (
    character: string,
    position: number,
  ): boolean => {
    const { maskPlaceholder } = this.maskOptions;

    if (this.isCharacterFillingPosition(character, position)) {
      return true;
    }

    if (!maskPlaceholder) {
      return false;
    }

    return maskPlaceholder[position] === character;
  };

  private isCharacterFillingPosition = (
    character: string,
    position: number,
  ): boolean => {
    const { mask } = this.maskOptions;

    if (!character || !mask || position >= mask.length) {
      return false;
    }

    if (!this.isPositionEditable(position)) {
      return mask[position] === character;
    }

    const charRule = mask[position];
    if (charRule instanceof RegExp) {
      return charRule.test(character);
    }

    return typeof charRule === "string" && charRule === character;
  };

  private isPositionEditable = (position: number): boolean => {
    const { mask, permanents } = this.maskOptions;

    return (
      !!mask && position < mask.length && permanents.indexOf(position) === -1
    );
  };

  isValueEmpty = (value: string): boolean => {
    return value.split("").every((character, position) => {
      return (
        !this.isPositionEditable(position) ||
        !this.isCharacterFillingPosition(character, position)
      );
    });
  };

  isValueFilled = (value: string): boolean => {
    const { lastEditablePosition } = this.maskOptions;
    if (lastEditablePosition === null) {
      return false;
    }

    return this.getFilledLength(value) === lastEditablePosition + 1;
  };

  getDefaultSelectionForValue = (value: string): Selection => {
    const filledLength = this.getFilledLength(value);
    const cursorPosition = this.getRightEditablePosition(filledLength);

    return { start: cursorPosition, end: cursorPosition };
  };

  private getFilledLength = (value: string): number => {
    const characters = value.split("");
    const lastFilledIndex = findLastIndex(characters, (character, position) => {
      return (
        this.isPositionEditable(position) &&
        this.isCharacterFillingPosition(character, position)
      );
    });

    return lastFilledIndex + 1;
  };

  private getStringFillingLengthAtPosition = (
    string: string,
    position: number,
  ): number => {
    const characters = string.split("");
    const insertedValue = characters.reduce(
      (value, character) => {
        return this.insertCharacterAtPosition(value, character, value.length);
      },
      repeat(" ", position),
    );

    return insertedValue.length - position;
  };

  private getLeftEditablePosition = (position: number): number | null => {
    for (let i = position; i >= 0; i--) {
      if (this.isPositionEditable(i)) {
        return i;
      }
    }

    return null;
  };

  private getRightEditablePosition = (position: number): number | null => {
    const { mask } = this.maskOptions;
    if (!mask) {
      return null;
    }
    for (let i = position; i < mask.length; i++) {
      if (this.isPositionEditable(i)) {
        return i;
      }
    }

    return null;
  };

  formatValue = (value: string): string => {
    const { maskPlaceholder, mask } = this.maskOptions;

    if (!maskPlaceholder || !mask) {
      let formattedValue = this.insertStringAtPosition("", value, 0);

      while (
        formattedValue.length < mask!.length &&
        !this.isPositionEditable(formattedValue.length)
      ) {
        const char = mask![formattedValue.length];
        formattedValue += typeof char === "string" ? char : String(char);
      }

      return formattedValue;
    }

    return this.insertStringAtPosition(maskPlaceholder, value, 0);
  };

  private clearRange = (
    value: string,
    start: number | null,
    length_: number,
  ): string => {
    if (!length_ || start === null) {
      return value;
    }

    const end = start + length_;
    const { maskPlaceholder, mask } = this.maskOptions;

    const clearedValue = value
      .split("")
      .map((character, i) => {
        const isEditable = this.isPositionEditable(i);

        if (!maskPlaceholder && i >= end && !isEditable) {
          return "";
        }
        if (i < start || i >= end) {
          return character;
        }
        if (!isEditable) {
          const maskChar = mask?.[i];

          return typeof maskChar === "string" ? maskChar : String(maskChar);
        }
        if (maskPlaceholder) {
          return maskPlaceholder[i];
        }

        return "";
      })
      .join("");

    return this.formatValue(clearedValue);
  };

  private insertCharacterAtPosition = (
    value: string,
    character: string,
    position: number,
  ): string => {
    const { mask, maskPlaceholder } = this.maskOptions;
    if (!mask || position >= mask.length) {
      return value;
    }

    const isAllowed = this.isCharacterAllowedAtPosition(character, position);
    const isEditable = this.isPositionEditable(position);
    const nextEditablePosition = this.getRightEditablePosition(position);
    const isNextPlaceholder =
      maskPlaceholder && nextEditablePosition
        ? character === maskPlaceholder[nextEditablePosition]
        : null;
    const valueBefore = value.slice(0, position);

    if (isAllowed || !isEditable) {
      const insertedCharacter = isAllowed
        ? character
        : (mask[position] as string | RegExp);
      const charToInsert =
        typeof insertedCharacter === "string"
          ? insertedCharacter
          : String(insertedCharacter);
      value = valueBefore + charToInsert;
    }

    if (!isAllowed && !isEditable && !isNextPlaceholder) {
      value = this.insertCharacterAtPosition(value, character, position + 1);
    }

    return value;
  };

  private insertStringAtPosition = (
    value: string,
    string: string,
    position: number,
  ): string => {
    const { mask, maskPlaceholder } = this.maskOptions;
    if (!string || !mask || position >= mask.length) {
      return value;
    }

    const characters = string.split("");
    const isFixedLength = this.isValueFilled(value) || !!maskPlaceholder;
    const valueAfter = value.slice(position);

    value = characters.reduce(
      (value_, character) => {
        return this.insertCharacterAtPosition(value_, character, value_.length);
      },
      value.slice(0, position),
    );

    if (isFixedLength) {
      value += valueAfter.slice(value.length - position);
    } else if (this.isValueFilled(value)) {
      const maskSlice = mask.slice(value.length);
      value += maskSlice
        .map((m) => (typeof m === "string" ? m : String(m)))
        .join("");
    } else {
      const editableCharactersAfter = valueAfter.split("").filter((_, i) => {
        return this.isPositionEditable(position + i);
      });
      value = editableCharactersAfter.reduce((value_, character) => {
        const nextEditablePosition = this.getRightEditablePosition(
          value_.length,
        );
        if (nextEditablePosition === null) {
          return value_;
        }

        if (!this.isPositionEditable(value_.length)) {
          const maskSlice = mask.slice(value_.length, nextEditablePosition);
          value_ += maskSlice
            .map((m) => (typeof m === "string" ? m : String(m)))
            .join("");
        }

        return this.insertCharacterAtPosition(
          character,
          character,
          value_.length,
        );
      }, value);
    }

    return value;
  };

  processChange = (
    currentState: InputState,
    previousState: InputState,
  ): InputState => {
    const { mask, prefix, lastEditablePosition } = this.maskOptions;
    const { value, selection } = currentState;
    const previousValue = previousState.value;
    const previousSelection = previousState.selection;
    let newValue = value;
    let enteredString = "";
    let formattedEnteredStringLength = 0;
    let removedLength = 0;
    let cursorPosition = Math.min(
      previousSelection.start ?? 0,
      selection.start ?? 0,
    );

    if ((selection.end ?? 0) > (previousSelection.start ?? 0)) {
      enteredString = newValue.slice(
        previousSelection.start ?? 0,
        selection.end ?? 0,
      );
      formattedEnteredStringLength = this.getStringFillingLengthAtPosition(
        enteredString,
        cursorPosition,
      );
      if (!formattedEnteredStringLength) {
        removedLength = 0;
      } else {
        removedLength =
          (previousSelection.end ?? 0) - (previousSelection.start ?? 0);
      }
    } else if (newValue.length < previousValue.length) {
      removedLength = previousValue.length - newValue.length;
    }

    newValue = previousValue;

    if (removedLength) {
      if (
        removedLength === 1 &&
        !((previousSelection.end ?? 0) - (previousSelection.start ?? 0))
      ) {
        const deleteFromRight = previousSelection.start === selection.start;
        cursorPosition = deleteFromRight
          ? (this.getRightEditablePosition(selection.start ?? 0) ??
            cursorPosition)
          : (this.getLeftEditablePosition(selection.start ?? 0) ??
            cursorPosition);
      }
      newValue = this.clearRange(newValue, cursorPosition, removedLength);
    }

    newValue = this.insertStringAtPosition(
      newValue,
      enteredString,
      cursorPosition,
    );

    cursorPosition += formattedEnteredStringLength;
    if (!mask) {
      cursorPosition = newValue.length;
    } else if (cursorPosition >= mask.length) {
      cursorPosition = mask.length;
    } else if (
      cursorPosition < (prefix?.length ?? 0) &&
      !formattedEnteredStringLength
    ) {
      cursorPosition = prefix?.length ?? 0;
    } else if (
      cursorPosition >= (prefix?.length ?? 0) &&
      lastEditablePosition !== null &&
      cursorPosition < lastEditablePosition &&
      formattedEnteredStringLength
    ) {
      cursorPosition =
        this.getRightEditablePosition(cursorPosition) ?? cursorPosition;
    }

    newValue = this.formatValue(newValue);

    return {
      value: newValue,
      enteredString,
      selection: { start: cursorPosition, end: cursorPosition },
    };
  };
}
