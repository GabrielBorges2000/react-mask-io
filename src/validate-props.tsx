import invariant from "invariant";
import warning from "warning";
import { CONTROLLED_PROPS } from "./constants";
import { InputMaskProps as InputMaskProperties } from "./index";
import React from "react";

export function validateMaxLength(properties: InputMaskProperties): void {
  warning(
    !properties.maxLength || !properties.mask,
    `react-mask-io: maxLength property shouldn't be passed to the masked input.
    It breaks masking and unnecessary because length is limited by the mask length.`,
  );
}

export function validateMaskPlaceholder(properties: InputMaskProperties): void {
  const { mask, maskPlaceholder } = properties;

  invariant(
    !mask ||
      !maskPlaceholder ||
      maskPlaceholder.length === 1 ||
      maskPlaceholder.length ===
        (typeof mask === "string" ? mask.length : mask.length),
    "react-mask-io: maskPlaceholder should either be a single character or have the same length as the mask:\n" +
      `mask: ${mask}\n` +
      `maskPlaceholder: ${maskPlaceholder}`,
  );
}