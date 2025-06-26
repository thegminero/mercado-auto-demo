declare module 'react-instantsearch-core' {
  import { ComponentType, ReactNode } from 'react';
  import { SearchClient } from 'algoliasearch/lite';

  export interface InstantSearchProps {
    searchClient: SearchClient;
    indexName: string;
    insights?: boolean;
    children: ReactNode;
  }

  export const InstantSearch: ComponentType<InstantSearchProps>;
  export function useInstantSearch(): any;
  export function useInsights(): any;
  export function useHits(): any;
} 