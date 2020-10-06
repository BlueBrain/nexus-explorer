import * as React from 'react';

import NewActivityContainer from '../containers/NewActivityContainer';
import TemplatesContainer from '../containers/TemplatesContainer';
import ProjectMetaContaier from '../containers/ProjectMetaContainer';

import './ProjectPanel.less';

const ProjectPanel: React.FC<{
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
  activityLabel?: string;
  activitySelfUrl?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
}> = ({
  projectLabel,
  orgLabel,
  onUpdate,
  activityLabel,
  activitySelfUrl,
  siblings,
}) => {
  return (
    <div className="project-panel">
      <span className="project-panel__name">{projectLabel}</span>
      <div className="project-panel__actions">
        <NewActivityContainer
          projectLabel={projectLabel}
          orgLabel={orgLabel}
          onSuccess={onUpdate}
          parentActivityLabel={activityLabel}
          parentActivitySelfUrl={activitySelfUrl}
          siblings={siblings}
        />
        <TemplatesContainer />
        <ProjectMetaContaier projectLabel={projectLabel} orgLabel={orgLabel} />
      </div>
    </div>
  );
};

export default ProjectPanel;
