export function defer(function_: FrameRequestCallback): number {
  return requestAnimationFrame(function_);
}

export function cancelDefer(deferId: number | null): void {
  if (deferId !== null) {
    cancelAnimationFrame(deferId);
  }
}
