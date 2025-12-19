import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { defer, cancelDefer } from "./utils/defer";
import {
  setInputSelection,
  getInputSelection,
  isInputFocused,
} from "./utils/input";
import { isDOMElement } from "./utils/helpers";

interface Selection {
  start: number | null;
  end: number | null;
  length?: number;
}

export interface InputState {
  value: string;
  selection: Selection;
}

export function useInputElement(inputElement: HTMLInputElement | null) {
  return useCallback(() => {
    let input = inputElement;
    const isDOMNode = typeof window !== "undefined" && isDOMElement(input);

    if (!input || !isDOMNode) {
      return null;
    }

    if (input.nodeName !== "INPUT") {
      input = input.querySelector("input");
    }

    if (!input) {
      throw new Error(
        "react-mask-io: inputComponent doesn't contain input node"
      );
    }

    return input;
  }, [inputElement]);
}

function useDeferLoop(callback: () => void) {
  const [deferId, setDeferId] = useState<number | null>(null);

  const runLoop = useCallback(() => {
    if (deferId !== null) {
      return;
    }

    let currentDeferId: number;

    function loop() {
      callback();
      currentDeferId = defer(loop);
      setDeferId(currentDeferId);
    }

    loop();
  }, [callback, deferId]);

  const stopLoop = useCallback(() => {
    if (deferId !== null) {
      cancelDefer(deferId);
      setDeferId(null);
    }
  }, [deferId]);

  useEffect(() => {
    if (deferId) {
      stopLoop();
      runLoop();
    }
  }, [runLoop, stopLoop]);

  useEffect(() => {
    return () => {
      if (deferId !== null) {
        cancelDefer(deferId);
      }
    };
  }, [deferId]);

  return [runLoop, stopLoop] as const;
}

function useSelection(
  inputElement: HTMLInputElement | null,
  isMasked: boolean
) {
  const [selection, setSelectionState] = useState<Selection>({
    start: null,
    end: null,
  });

  const getInputElement = useInputElement(inputElement);

  const getSelection = useCallback((): Selection => {
    const input = getInputElement();
    if (!input) {
      return { start: null, end: null };
    }

    return getInputSelection(input);
  }, [getInputElement]);

  const getLastSelection = useCallback((): Selection => {
    return selection;
  }, [selection]);

  const setSelection = useCallback(
    (newSelection: Selection) => {
      const input = getInputElement();

      if (!input || !isInputFocused(input)) {
        return;
      }

      setInputSelection(input, newSelection.start ?? 0, newSelection.end ?? 0);

      const actualSelection = getSelection();
      setSelectionState(actualSelection);
    },
    [getInputElement, getSelection]
  );

  const selectionLoop = useCallback(() => {
    const currentSelection = getSelection();
    setSelectionState(currentSelection);
  }, [getSelection]);

  const [runSelectionLoop, stopSelectionLoop] = useDeferLoop(selectionLoop);

  useLayoutEffect(() => {
    if (!isMasked) {
      return;
    }

    const input = getInputElement();
    if (!input) {
      return;
    }

    const handleFocus = () => runSelectionLoop();
    const handleBlur = () => stopSelectionLoop();

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    if (isInputFocused(input)) {
      runSelectionLoop();
    }

    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
      stopSelectionLoop();
    };
  }, [isMasked, getInputElement, runSelectionLoop, stopSelectionLoop]);

  return { getSelection, getLastSelection, setSelection };
}

function useValue(inputElement: HTMLInputElement | null, initialValue: string) {
  const [value, setValueState] = useState(initialValue);
  const getInputElement = useInputElement(inputElement);

  const getValue = useCallback((): string => {
    const input = getInputElement();
    if (!input) {
      return value;
    }

    return input.value;
  }, [getInputElement, value]);

  const getLastValue = useCallback((): string => {
    return value;
  }, [value]);

  const setValue = useCallback(
    (newValue: string) => {
      setValueState(newValue);

      const input = getInputElement();
      if (input) {
        input.value = newValue;
      }
    },
    [getInputElement]
  );

  return {
    getValue,
    getLastValue,
    setValue,
  };
}

export function useInputState(initialValue: string, isMasked: boolean) {
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
    null
  );

  const { getSelection, getLastSelection, setSelection } = useSelection(
    inputElement,
    isMasked
  );

  const { getValue, getLastValue, setValue } = useValue(
    inputElement,
    initialValue
  );

  const getLastInputState = useCallback((): InputState => {
    return {
      value: getLastValue(),
      selection: getLastSelection(),
    };
  }, [getLastValue, getLastSelection]);

  const getInputState = useCallback((): InputState => {
    return {
      value: getValue(),
      selection: getSelection(),
    };
  }, [getValue, getSelection]);

  const setInputState = useCallback(
    (newState: InputState) => {
      setValue(newState.value);
      setSelection(newState.selection);
    },
    [setValue, setSelection]
  );

  return {
    inputElement,
    setInputElement,
    getInputState,
    getLastInputState,
    setInputState,
  };
}

export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T | undefined>();

  useEffect(() => {
    setPrevious(value);
  }, [value]);

  return previous;
}
