import { Datapoint, Collection } from './graphql.types';

export interface CollectionAnalyticsData {
  collection: Collection;
}

export interface CollectionAnalyticsVariables {
  id: string;
  startTime: string;
  endTime: string;
}
