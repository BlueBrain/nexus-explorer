import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import * as bodybuilder from 'bodybuilder';
import { Resource } from '@bbp/nexus-sdk';

import useAsyncCall, { AsyncCall } from '../../shared/hooks/useAsynCall';
import { SearchResponse } from '../../shared/types/search';
import { parseURL } from '../../shared/utils/nexusParse';

// TODO move to global default list
const DEFAULT_PAGE_SIZE = 20;

export const TOTAL_HITS_TRACKING = 1000000;

export type UseSearchResponse = AsyncCall<SearchResponse<Resource>>;

export enum SortDirection {
  DESCENDING = 'desc',
  ASCENDING = 'asc',
}

export type UseSearchProps = {
  query?: object;
  sort?: {
    key: string;
    direction: SortDirection;
  };
  pagination?: {
    from: number;
    size: number;
  };
};

export const DEFAULT_SEARCH_PROPS = {
  pagination: { from: 0, size: DEFAULT_PAGE_SIZE },
  sort: {
    key: '_createdAt',
    direction: SortDirection.DESCENDING,
  },
};

export default function useSearchQueryFromStudio(
  selfURL: string | null,
  query: object = {}
) {
  const [searchProps, setSearchProps] = React.useState<UseSearchProps>({
    ...DEFAULT_SEARCH_PROPS,
  });
  const {
    sort = DEFAULT_SEARCH_PROPS.sort,
    pagination = DEFAULT_SEARCH_PROPS.pagination,
  } = searchProps;

  const nexus = useNexusContext();

  const searchNexus = async () => {
    if (!selfURL) {
      return null;
    }

    const body = bodybuilder();

    body
      .filter('term', '_deprecated', false)
      .sort(sort.key, sort.direction)
      .size(pagination.size)
      .from(pagination.from)
      .rawOption('track_total_hits', TOTAL_HITS_TRACKING);

    const bodyQuery = body.build();
    const { org, project, id } = parseURL(selfURL);

    return await nexus.View.elasticSearchQuery<SearchResponse<Resource>>(
      org,
      project,
      encodeURIComponent(id),
      {
        ...bodyQuery,
        ...query,
      }
    );
  };

  const remoteResponse = useAsyncCall<SearchResponse<Resource> | null, Error>(
    searchNexus(),
    [searchProps, selfURL],
    true
  );

  return [remoteResponse, { searchProps, setSearchProps }] as [
    UseSearchResponse,
    {
      searchProps: UseSearchProps;
      setSearchProps: React.Dispatch<React.SetStateAction<UseSearchProps>>;
    }
  ];
}
