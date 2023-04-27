export function debounce<T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  ms = 3000
) {
  let timer: ReturnType<typeof setTimeout>;

  return function (...args: T): Promise<U> {
    clearTimeout(timer);

    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(callback(...args)), ms);
    });
  };
}
