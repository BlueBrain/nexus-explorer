import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardList from './DashboardListContainer';

type WorkspaceListProps = {
  workspaceIds: string[];
  orgLabel: string;
  projectLabel: string;
};

const WorkspaceList: React.FunctionComponent<WorkspaceListProps> = ({
  workspaceIds,
  orgLabel,
  projectLabel,
}) => {
  const [workspaces, setWorkspaces] = React.useState<Resource[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Resource>();
  const nexus = useNexusContext();
  const selectWorkspace = (id: string) => {
    const w = workspaces.find(w => w['@id'] === id);
    setSelectedWorkspace(w);
  };

  React.useEffect(() => {
    Promise.all(
      workspaceIds.map(workspaceId => {
        return nexus.httpGet({
          path: workspaceId,
        });
      })
    )
      .then(values => {
        setWorkspaces(values);
        setSelectedWorkspace(values[0] as Resource);
      })
      .catch(e => {
        // Fail silently.
      });
  }, [workspaceIds]);

  return (
    <>
      {workspaces.length > 0 ? (
        <TabList
          items={workspaces.map(w => ({
            label: w.label,
            description: w.description,
            id: w['@id'],
          }))}
          onSelected={(id: string) => {
            selectWorkspace(id);
          }}
          defaultActiveId={
            selectedWorkspace ? selectedWorkspace['@id'] : workspaces[0]['@id']
          }
          position="top"
        >
          {selectedWorkspace ? (
            <div className="workspace">
              <DashboardList
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                dashboards={selectedWorkspace['dashboards']}
              />{' '}
            </div>
          ) : null}
        </TabList>
      ) : (
        'No Workspaces are available for this Studio'
      )}
    </>
  );
};

export default WorkspaceList;
