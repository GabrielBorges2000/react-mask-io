import React, { useCallback, useEffect, useState, ReactNode } from "react";

export type Mask = string | RegExp[] | ((value: string) => string);

export interface Selection {
  start: number | null;
  end: number | null;
}

export interface InputState {
  value: string;
  selection: Selection;
}
interface ChildrenProps {
  value: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export interface InputMaskProps {
  value?: string;
  defaultValue?: string;
  mask?: Mask | null;
  disabled?: boolean;
  alwaysShowMask?: boolean;
  beforeMaskedValueChange?: (args: {
    currentState: InputState;
    nextState: InputState;
    inputValue: string;
  }) => InputState;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  children: (props: ChildrenProps) => ReactNode;
}

function applyMask(value: string, mask?: Mask | null): string {
  if (!mask) {
    return value;
  }

  if (typeof mask === "function") {
    return mask(value);
  }

  if (Array.isArray(mask)) {
    let result = "";
    let vi = 0;

    for (let i = 0; i < mask.length && vi < value.length; i++) {
      const rule = mask[i];
      const char = value[vi];

      if (typeof rule === "string") {
        result += rule;
        if (char === rule) vi++;
      } else if (rule.test(char)) {
        result += char;
        vi++;
      } else {
        vi++;
        i--;
      }
    }

    return result;
  }

  // string mask tipo 999.999.999-99
  let result = "";
  let vi = 0;

  for (let i = 0; i < mask.length && vi < value.length; i++) {
    const maskValue = mask[i];
    const valueInput = value[vi];

    if (maskValue === "9") {
      if (/\d/.test(valueInput)) {
        result += valueInput;
        vi++;
      } else {
        vi++;
        i--;
      }
    } else if (maskValue === "a") {
      if (/[A-Za-z]/.test(valueInput)) {
        result += valueInput.toUpperCase();
        vi++;
      } else {
        vi++;
        i--;
      }
    } else if (maskValue === "*") {
      if (/[A-Za-z0-9]/.test(valueInput)) {
        result += valueInput;
        vi++;
      } else {
        vi++;
        i--;
      }
    } else {
      result += maskValue;
      if (valueInput === maskValue) {
        vi++;
      }
    }
  }

  return result;
}

export default function InputMask(props: InputMaskProps) {
  const {
    value,
    defaultValue,
    mask,
    disabled,
    alwaysShowMask,
    beforeMaskedValueChange,
    onChange,
    onBlur,
    children,
  } = props;

  const isControlled = value !== undefined;

  const [state, setState] = useState<InputState>(() => {
    const initial = value ?? defaultValue ?? "";

    return {
      value: applyMask(initial, mask),
      selection: { start: null, end: null },
    };
  });

  const commitState = useCallback((next: InputState) => {
    setState((prev) => {
      if (
        prev.value === next.value &&
        prev.selection.start === next.selection.start &&
        prev.selection.end === next.selection.end
      ) {
        return prev;
      }

      return next;
    });
  }, []);

  // 🔒 sincronização CONTROLLED
  useEffect(() => {
    if (!isControlled) {
      return;
    }

    const maskedValue =
      alwaysShowMask || value ? applyMask(value ?? "", mask) : (value ?? "");

    let nextState: InputState = {
      value: maskedValue,
      selection: { start: null, end: null },
    };

    if (beforeMaskedValueChange) {
      nextState = beforeMaskedValueChange({
        currentState: state,
        nextState,
        inputValue: value ?? "",
      });
    }

    commitState(nextState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, mask, alwaysShowMask, isControlled]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const maskedValue = applyMask(rawValue, mask);

      if (maskedValue === state.value) {
        return;
      }

      let nextState: InputState = {
        value: maskedValue,
        selection: {
          start: e.target.selectionStart,
          end: e.target.selectionEnd,
        },
      };

      if (beforeMaskedValueChange) {
        nextState = beforeMaskedValueChange({
          currentState: state,
          nextState,
          inputValue: rawValue,
        });

        if (nextState.value === state.value) {
          return;
        }
      }

      commitState(nextState);
      onChange?.(e);
    },
    [mask, beforeMaskedValueChange, commitState, onChange, state],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
    },
    [onBlur],
  );

  return (
    <>
      {children({
        value: state.value,
        disabled,
        onChange: handleChange,
        onBlur: handleBlur,
      })}
    </>
  );
}
