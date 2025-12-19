export function getElementDocument(
  element?: Element | HTMLElement | null
): Document | null {
  if (!element) {
    return null;
  }

  return element.ownerDocument ?? null;
}

export function getElementWindow(
  element?: Element | HTMLElement | null
): Window | null {
  const document_ = getElementDocument(element);

  return document_?.defaultView ?? null;
}

export function isDOMElement(element: unknown): element is HTMLElement {
  if (!element || typeof element !== "object") {
    return false;
  }
  const elementWindow = getElementWindow(
    element as Element | HTMLElement | null
  );

  return !!elementWindow && element instanceof elementWindow.HTMLElement;
}

export function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

export function findLastIndex<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): number {
  for (let i = array.length - 1; i >= 0; i--) {
    const x = array[i];
    if (predicate(x, i)) {
      return i;
    }
  }

  return -1;
}

export function repeat(string: string, n = 1): string {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += string;
  }

  return result;
}

export function toString(value: unknown): string {
  return `${value}`;
}
