import type * as swr from 'swr';

declare module 'swr' {
  export type MutateFn<Data> = (
    data?: Data | Promise<Data> | mutateCallback<Data>,
    shouldRevalidate?: boolean
  ) => Promise<Data | undefined>;
  export interface Cache extends swr.Cache {
    clear(): void;
  }
}
