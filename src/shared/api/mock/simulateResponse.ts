/** @scopeDefault * */
type SimulateOptions<TError> = {
  delayMs?: number;
  failureRate?: number;
  errors: Array<TError>;
};

export function simulateResponse<T, TError>(
  onSuccess: () => T,
  { delayMs = 1000, failureRate = 0.35, errors }: SimulateOptions<TError>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (errors.length > 0 && Math.random() < failureRate) {
        reject(errors[Math.floor(Math.random() * errors.length)]!);
        return;
      }

      resolve(onSuccess());
    }, delayMs);
  });
}
