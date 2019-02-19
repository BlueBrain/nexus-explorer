import * as React from 'react';
import { Popover } from 'antd';
import TypesIcon from '../Types/TypesIcon';

import './Resources.less';
import ResourceMetadataCard from './MetadataCard';
import { Resource } from '@bbp/nexus-sdk';

const MOUSE_ENTER_DELAY = 0.5;

export interface ResourceItemProps {
  resource: Resource;
  index: number;
  onClick?(): void;
  onEdit?(): void;
}

const ResourceListItem: React.FunctionComponent<ResourceItemProps> = props => {
  const { resource, index, onClick = () => {} } = props;
  const containerRef = React.createRef<HTMLDivElement>();

  const handleKeyPress = (e: any) => {
    const code = e.keyCode || e.which;
    // enter is pressed
    if (code === 13 && containerRef.current && document) {
      onClick();
    }
  };

  // const Preview =
  //   raw._mediaType && raw._mediaType.includes('image') ? (
  //     <Avatar src={self} />
  //   ) : null;

  return (
    <Popover
      content={
        <ResourceMetadataCard {...{ ...resource, name: resource.name }} />
      }
      mouseEnterDelay={MOUSE_ENTER_DELAY}
    >
      <div
        ref={containerRef}
        className="clickable-container resource-item"
        onClick={onClick}
        onKeyPress={handleKeyPress}
        tabIndex={index + 1}
      >
        {/* {Preview} */}
        <div className="name">
          <em>{resource.name}</em>
        </div>
        {resource.type && resource.type.length && (
          <TypesIcon type={resource.type} />
        )}
      </div>
    </Popover>
  );
};

export default ResourceListItem;
