import * as React from 'react';
import { Button } from 'antd';
import { Resource, DEFAULT_SPARQL_VIEW_ID, NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import useNotification from '../../../shared/hooks/useNotification';
import TabList from '../../../shared/components/Tabs/TabList';
import { StudioContext } from '../views/StudioView';
import DashboardResultsContainer from './DashboardResultsContainer';
import DashboardEditorContainer from './DashBoardEditor/DashboardEditorContainer';
import CreateDashboardContainer from './DashBoardEditor/CreateDashboardContainer';
import useQueryString from '../../../shared/hooks/useQueryString';
import { resourcesWritePermissionsWrapper } from '../../../shared/utils/permission';
import { ResultTableFields } from '../../../shared/types/search';

const removeDashBoard = async (
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  workspaceId: string,
  dashboardIndex: number,
  dashboards: Dashboard[]
) => {
  const workspace = (await nexus.Resource.get<Resource>(
    orgLabel,
    projectLabel,
    encodeURIComponent(workspaceId)
  )) as Resource;

  dashboards.splice(dashboardIndex, 1);

  const workspaceSource = await nexus.Resource.getSource<{
    [key: string]: any;
  }>(orgLabel, projectLabel, encodeURIComponent(workspaceId));
  if (workspace) {
    await nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(workspaceId),
      workspace._rev,
      {
        ...workspaceSource,
        dashboards,
      }
    );
  }
};

export type Dashboard = {
  dashboard: string;
  view: string;
  fields?: ResultTableFields[];
};

interface DashboardListProps {
  dashboards: Dashboard[];
  refreshList?(): void;
}

const DashboardList: React.FunctionComponent<DashboardListProps> = ({
  dashboards,
  refreshList,
}) => {
  const notification = useNotification();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const studioContext = React.useContext(StudioContext);
  const {
    orgLabel,
    projectLabel,
    workspaceId,
    dashboardId,
    isWritable,
  } = studioContext;
  const [queryParams, setQueryString] = useQueryString();
  const permissionsPath = `/${orgLabel}/${projectLabel}`;
  const [dashboardResources, setDashboardResources] = React.useState<
    Resource[]
  >([]);
  const [selectedDashboardIndex, setSelectedDashboardIndex] = React.useState<
    number
  >(0);
  const [
    selectedDashboardResourcesIndex,
    setSelectedDashboardResourcesIndex,
  ] = React.useState<number>(0);
  const [
    editingDashboard,
    setEditingDashboard,
  ] = React.useState<Resource | null>(null);

  const [editingDashboardView, setEditingDashboardView] = React.useState<
    string
  >(DEFAULT_SPARQL_VIEW_ID);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const nexus = useNexusContext();

  const selectDashboard = (dashboardResourcesIndex: number) => {
    const dashboard = dashboardResources[dashboardResourcesIndex];
    const dashboardId = dashboard['@id'];
    const dashboardsIndex = dashboards.findIndex(
      d => d.dashboard === dashboardId
    );
    setSelectedDashboardResourcesIndex(dashboardResourcesIndex);
    setSelectedDashboardIndex(dashboardsIndex);
    setQueryString({
      ...queryParams,
      dashboardId,
    });
  };

  const fetchAndSetupDashboards = () => {
    Promise.all(
      dashboards.map(dashboardObject => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(dashboardObject.dashboard)
        ) as Promise<
          Resource<{
            label: string;
            description?: string;
            dataQuery: string;
            plugins: string[];
          }>
        >;
      })
    )
      .then(values => {
        const sortedValues = values.sort(({ label: a }, { label: b }) => {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        setDashboardResources(sortedValues);
        if (
          dashboardId &&
          sortedValues[selectedDashboardIndex]['@id'] !== dashboardId
        ) {
          const selectedDashboardIndex = dashboards.findIndex(
            d => d.dashboard === dashboardId
          );
          const selectedDashboardResourcesIndex = sortedValues.findIndex(
            d => d['@id'] === dashboardId
          );
          setSelectedDashboardIndex(selectedDashboardIndex);
          setSelectedDashboardResourcesIndex(selectedDashboardResourcesIndex);
          setQueryString({
            ...queryParams,
            dashboardId,
          });
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  };

  React.useEffect(() => {
    fetchAndSetupDashboards();
  }, [dashboards]);

  const handleElementClick = (stringifiedIndex: string) => {
    const dashboardResource = dashboardResources[Number(stringifiedIndex)];
    const dashboard = dashboards[Number(stringifiedIndex)];
    if (dashboardResource) {
      setEditingDashboard(dashboardResource);
      setEditingDashboardView(dashboard.view);
      setShowEditModal(true);
    }
  };

  const updateDashboards = () => {
    fetchAndSetupDashboards();
    setEditingDashboard(null);
  };

  const tabAction = (
    <CreateDashboardContainer
      showCreateModal={showCreateModal}
      onCancel={() => setShowCreateModal(false)}
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      workspaceId={workspaceId as string}
      onSuccess={refreshList}
      key={workspaceId}
      viewId={
        dashboards.length > 0 ? dashboards[0].view : DEFAULT_SPARQL_VIEW_ID
      }
    />
  );

  const editButtonWrapper = (id: string) => {
    const editButton = (
      <Button
        className="studio-edit-button"
        type="link"
        size="small"
        onClick={e => {
          handleElementClick(id);
          e.stopPropagation();
        }}
        key={id}
      >
        Edit
      </Button>
    );
    return resourcesWritePermissionsWrapper(editButton, permissionsPath);
  };

  const OnEdit = React.useCallback(
    async (e, action) => {
      if (action === 'add') {
        setShowCreateModal(true);
      } else {
        if (workspaceId && refreshList) {
          const index = e.toString();
          const dashboardToRemove = dashboardResources[index];
          const indexToRemove = dashboards
            .map(d => d.dashboard)
            .indexOf(dashboardToRemove['@id']);

          await removeDashBoard(
            nexus,
            orgLabel,
            projectLabel,
            workspaceId,
            indexToRemove,
            [...dashboards]
          );
          notification.success({
            message: `Removed ${dashboardToRemove.label}`,
          });
          refreshList();
        }
      }
    },
    [
      nexus,
      orgLabel,
      projectLabel,
      workspaceId,
      dashboardResources,
      refreshList,
    ]
  );

  return (
    <>
      {editingDashboard && (
        // TODO: pass dashboard view
        <DashboardEditorContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          dashboardId={editingDashboard['@id']}
          dashboardRev={editingDashboard._rev}
          dashboard={{
            label: editingDashboard.label,
            description: editingDashboard.description,
            dataQuery: editingDashboard.dataQuery,
            plugins: editingDashboard.plugins,
          }}
          showEditModal={showEditModal}
          viewId={editingDashboardView}
          setShowEditModal={setShowEditModal}
          onSuccess={updateDashboards}
        ></DashboardEditorContainer>
      )}
      <TabList
        items={dashboardResources.map((w, index) => ({
          label: w.label,
          description: w.description,
          id: `${index}`, // must be a string
        }))}
        onSelected={(stringiedIndex: string) => {
          selectDashboard(Number(stringiedIndex));
        }}
        tabType={isWritable ? 'editable-card' : 'card'}
        position="left"
        activeKey={`${selectedDashboardResourcesIndex}`}
        tabAction={resourcesWritePermissionsWrapper(tabAction, permissionsPath)}
        editButton={editButtonWrapper}
        OnEdit={OnEdit}
      >
        {!!dashboardResources.length &&
          !!dashboardResources[selectedDashboardResourcesIndex] && (
            <DashboardResultsContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              dashboardLabel={
                dashboardResources[selectedDashboardResourcesIndex].label
              }
              key={dashboardId}
              viewId={
                (dashboards[selectedDashboardIndex] &&
                  dashboards[selectedDashboardIndex].view) ||
                DEFAULT_SPARQL_VIEW_ID
              }
              fields={
                dashboardResources[selectedDashboardResourcesIndex].fields
              }
              dataQuery={
                dashboardResources[selectedDashboardResourcesIndex].dataQuery
              }
            />
          )}
      </TabList>
    </>
  );
};

export default DashboardList;
