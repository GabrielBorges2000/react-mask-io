interface SelectionRange {
  start: number;
  end: number;
  length: number;
}

export function setInputSelection(
  input: HTMLInputElement | null | undefined,
  start: number | null,
  end?: number | null
): void {
  if (!input || start === null) {
    return;
  }

  const startPos = start ?? 0;
  const endPos = end ?? startPos;
  input.setSelectionRange(startPos, endPos);
}

export function getInputSelection(
  input: HTMLInputElement | null | undefined
): SelectionRange {
  if (!input) {
    return {
      start: 0,
      end: 0,
      length: 0,
    };
  }

  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;

  return {
    start,
    end,
    length: end - start,
  };
}

export function isInputFocused(
  input: HTMLInputElement | null | undefined
): boolean {
  if (!input) {
    return false;
  }

  const inputDocument = input.ownerDocument;
  
return inputDocument.hasFocus() && inputDocument.activeElement === input;
}
