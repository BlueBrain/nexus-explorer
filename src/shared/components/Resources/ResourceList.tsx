import * as React from 'react';
import { List, Drawer } from 'antd';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import ResourceItem, { ResourceItemProps } from './ResourceItem';
import './Resources.less';

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

export interface ResourceListProps {
  header?: React.ReactNode;
  resources: PaginatedList<Resource>;
  paginationChange: any;
  paginationSettings: PaginationSettings;
  loading?: boolean;
}

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
  header = <div />,
  resources,
  paginationChange,
  paginationSettings,
  loading = false,
}) => {
  const { total, results } = resources;
  const { from, size } = paginationSettings;
  const totalPages = Math.ceil(total / size);
  const current = Math.ceil((totalPages / total) * (from || 1));
  const [selectedResource, setSelectedResource] = React.useState(
    null as Resource | null
  );
  const handleKeyPress = (e: KeyboardEvent) => {
    const code = e.keyCode || e.which;
    // enter is pressed
    if (code === 27 && selectedResource) {
      setSelectedResource(null);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, false);
    return () => {
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  });

  return (
    <React.Fragment>
      <List
        className="resources-list"
        loading={loading}
        header={
          <div>
            {header}
            <p className="result">{`Found ${total} resource${
              total > 1 ? 's' : ''
            }`}</p>
          </div>
        }
        dataSource={results}
        pagination={
          total && totalPages > 1
            ? {
                total,
                current,
                onChange: paginationChange,
                pageSize: size,
              }
            : undefined
        }
        renderItem={(resource: Resource, index: number) => {
          return (
            <ResourceItem
              index={index}
              key={resource.id}
              name={resource.name}
              {...resource}
              onClick={() => setSelectedResource(resource)}
            />
          );
        }}
      />
      {typeof window !== 'undefined' && selectedResource && (
        <Drawer
          width={640}
          placement="right"
          onClose={() => setSelectedResource(null)}
          visible={!!selectedResource}
          title={selectedResource.name}
        >
          <ReactJson src={selectedResource.raw} name={null} />
        </Drawer>
      )}
    </React.Fragment>
  );
};

export default ResourceList;
