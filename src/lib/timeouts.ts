export const timeoutSetting = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 100 && parsed <= 30000
    ? parsed
    : fallback;
};

// This bounds orchestration; network and database operations also have their own deadlines.
export async function withDeadline<T>(
  operation: Promise<T>,
  milliseconds = 8000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Operation deadline exceeded")),
          milliseconds,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
