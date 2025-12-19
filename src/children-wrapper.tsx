import React, { type ReactElement, type InputHTMLAttributes } from "react";

interface InputMaskChildrenWrapperProperties extends InputHTMLAttributes<HTMLInputElement> {
  children: ReactElement<InputHTMLAttributes<HTMLInputElement>>;
}

export function InputMaskChildrenWrapper({
  children,
  ...properties
}: InputMaskChildrenWrapperProperties) {
  return React.cloneElement(children, {
    ...properties,
  });
}
