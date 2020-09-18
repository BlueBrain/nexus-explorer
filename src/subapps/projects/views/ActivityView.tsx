import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { Button } from 'antd';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import NewActivityContainer from '../containers/NewActivityContainer';
import TemplatesContainer from '../containers/TemplatesContainer';

const ActivityView: React.FC = () => {
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    activityId: string;
  }>(`/${subapp.namespace}/:orgLabel/:projectLabel/:activityId`);

  const projectLabel = match?.params.projectLabel;
  const orgLabel = match?.params.orgLabel;
  const activityId = match?.params.activityId;

  return (
    <div className="activity-view">
      {orgLabel && projectLabel && (
        <ProjectPanel orgLabel={orgLabel} projectLabel={projectLabel} />
      )}
    </div>
  );
};

export default ActivityView;
