import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import StatusIcon from '../StatusIcon';
import { ActivityResource } from '../../views/ActivityView';

import './SubActivityItem.less';

const MAX_TITLE_LENGTH = 25;

const SubActivityItem: React.FC<{
  orgLabel: string;
  projectLabel: string;
  subactivity: ActivityResource;
}> = ({ subactivity, orgLabel, projectLabel }) => {
  const { name, status } = subactivity;

  return (
    <div className="sub-activity">
      <StatusIcon status={status} mini={true} />
      <div className="sub-activity__content">
        <Link
          to={`/projects/${orgLabel}/${projectLabel}/${subactivity['@id']}`}
        >
          {name.length > MAX_TITLE_LENGTH ? (
            <Tooltip placement="topRight" title={name}>
              <h3 className="sub-activity__title">
                {`${name.slice(0, MAX_TITLE_LENGTH)}...`}
              </h3>
            </Tooltip>
          ) : (
            <h3 className="sub-activity__title">{name}</h3>
          )}
        </Link>
      </div>
    </div>
  );
};

export default SubActivityItem;