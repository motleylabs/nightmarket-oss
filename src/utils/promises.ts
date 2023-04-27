export const reduceSettledPromise = <T>(settledPromise: PromiseSettledResult<T>[]) => {
  return settledPromise.reduce(
    (
      acc: {
        rejected: string[];
        fulfilled: T[];
      },
      cur
    ) => {
      if (cur.status === 'fulfilled') acc.fulfilled.push(cur.value);
      if (cur.status === 'rejected') acc.rejected.push(cur.reason);
      return acc;
    },
    { rejected: [], fulfilled: [] }
  );
};
