import { makeVar } from '@apollo/client';
import { Viewer } from './graphql.types';

export const viewerVar = makeVar<Viewer | null>(null);

export const sidebarOpenVar = makeVar<boolean>(false);
