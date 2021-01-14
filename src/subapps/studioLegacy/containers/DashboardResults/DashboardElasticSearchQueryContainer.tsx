import { ElasticSearchView, Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
import ElasticSearchResultsTable from '../../../../shared/components/ElasticSearchResultsTable';
import useSearchQuery from '../../../hooks/useSearchQuery';

const DashboardElasticSearchQueryContainer: React.FC<{
  view: ElasticSearchView;
  dataQuery: string;
  goToStudioResource: (selfUrl: string) => void;
}> = ({ view, dataQuery, goToStudioResource }) => {
  const [searchResponse, { searchProps, setSearchProps }] = useSearchQuery(
    view._self,
    JSON.parse(dataQuery)
  );

  const handleClickItem = (resource: Resource) => {
    goToStudioResource(resource._self);
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    const size = searchProps.pagination?.size || 0;
    setSearchProps({
      ...searchProps,
      pagination: {
        from: (page - 1) * size,
        size: pageSize || size,
      },
    });
  };

  // Pagination Props
  const total = searchResponse.data?.hits.total.value || 0;
  const size = searchProps.pagination?.size || 0;
  const from = searchProps.pagination?.from || 0;
  const totalPages = Math.ceil(total / size);
  const current = Math.floor((totalPages / total) * from + 1);
  const shouldShowPagination = totalPages > 1;

  return (
    <ElasticSearchResultsTable
      searchResponse={searchResponse}
      onClickItem={handleClickItem}
      pagination={
        shouldShowPagination
          ? {
              total,
              current,
              pageSize: size,
              showSizeChanger: false,
              onChange: handlePaginationChange,
            }
          : {}
      }
    />
  );
};

export default DashboardElasticSearchQueryContainer;
