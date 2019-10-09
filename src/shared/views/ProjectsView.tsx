import * as React from 'react';
import { connect } from 'react-redux';
import { Drawer, notification, Modal, Button, Empty } from 'antd';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { ProjectResponseCommon, OrgResponseCommon } from '@bbp/nexus-sdk';

import ProjectList from '../containers/ProjectList';
import Skeleton from '../components/Skeleton';
import { push } from 'connected-react-router';
import ProjectForm from '../components/Projects/ProjectForm';
import ListItem from '../components/List/Item';
import ProjectItem from '../components/Projects/ProjectItem';

interface ProjectsViewProps {
  match: any;
  goTo(o: string, p: string): void;
}

const ProjectsView: React.FunctionComponent<ProjectsViewProps> = ({
  match,
  goTo,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [orgLoadingBusy, setOrgLoadingBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [activeOrg, setActiveOrg] = React.useState<
    OrgResponseCommon | null | undefined
  >(null);
  const [
    selectedProject,
    setSelectedProject,
  ] = React.useState<ProjectResponseCommon | null>(null);

  const nexus = useNexusContext();

  React.useEffect(() => {
    if (!activeOrg) {
      setOrgLoadingBusy(true);
      nexus.Organization.get(match.params.org)
        .then((org: OrgResponseCommon) => {
          setOrgLoadingBusy(false);
          setActiveOrg(org);
        })
        .catch((error: Error) => {
          setOrgLoadingBusy(false);
          notification.error({
            message: `An error occured whilst fetching Organization ${match.params.org}`,
            description: error.message,
            duration: 0,
          });
        });
    }
  }, [match.path, activeOrg]);

  const saveAndCreate = (newProject: ProjectResponseCommon) => {
    setFormBusy(true);
    if (!activeOrg) {
      return;
    }
    nexus.Project.create(activeOrg._label, newProject._label, {
      base: newProject.base || undefined,
      vocab: newProject.vocab || undefined,
      description: newProject.description || '',
      apiMappings: newProject.apiMappings || undefined,
    })
      .then(
        () => {
          notification.success({
            message: 'Project created',
            duration: 2,
          });
          setFormBusy(false);
          goTo(activeOrg._label, newProject._label);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT created',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndModify = (
    selectedProject: ProjectResponseCommon,
    newProject: ProjectResponseCommon
  ) => {
    setFormBusy(true);
    if (!activeOrg) {
      return;
    }
    nexus.Project.update(
      activeOrg._label,
      newProject._label,
      selectedProject._rev,
      {
        base: newProject.base,
        vocab: newProject.vocab,
        description: newProject.description,
        apiMappings: newProject.apiMappings || [],
      }
    )
      .then(
        () => {
          notification.success({
            message: 'Project saved',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedProject(null);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT saved',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndDeprecate = (selectedProject: ProjectResponseCommon) => {
    setFormBusy(true);
    nexus.Project.deprecate(
      selectedProject._organizationLabel,
      selectedProject._label,
      selectedProject._rev
    )
      .then(
        () => {
          notification.success({
            message: 'Project successfully deprecated',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedProject(null);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Project NOT deprecated',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  if (orgLoadingBusy) {
    return (
      <Skeleton
        itemNumber={5}
        active
        avatar
        paragraph={{
          rows: 1,
          width: 0,
        }}
        title={{
          width: '100%',
        }}
      />
    );
  }

  return (
    <div className="projects-view view-container">
      {activeOrg ? (
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <h1 style={{ marginBottom: 0, marginRight: 8 }}>
            {activeOrg._label}
          </h1>
          {activeOrg.description && <p>{activeOrg.description}</p>}
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}
          >
            <h2 style={{ marginBottom: 0, marginRight: 8 }}>Projects</h2>
            <AccessControl
              permissions={['projects/create']}
              path={`/${activeOrg._label}`}
            >
              <Button
                type="primary"
                onClick={() => setModalVisible(true)}
                icon="plus-square"
              >
                Create Project
              </Button>
            </AccessControl>
          </div>
          <ProjectList orgLabel={activeOrg._label}>
            {({ items }: { items: ProjectResponseCommon[] }) =>
              items.map(i => (
                <ListItem
                  key={i['@id']}
                  onClick={() => goTo(i._organizationLabel, i._label)}
                  actions={[
                    <AccessControl
                      path={`/${i._organizationLabel}/${i._label}`}
                      permissions={['projects/write']}
                    >
                      <Button
                        className="edit-button"
                        size="small"
                        type="primary"
                        tabIndex={1}
                        onClick={(e: React.SyntheticEvent) => {
                          e.stopPropagation();
                          setSelectedProject(i);
                        }}
                      >
                        Edit
                      </Button>
                    </AccessControl>,
                  ]}
                >
                  <ProjectItem {...i} />
                </ListItem>
              ))
            }
          </ProjectList>
          <Modal
            title="New Project"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            confirmLoading={formBusy}
            footer={null}
            width={600}
          >
            <ProjectForm
              onSubmit={(p: ProjectResponseCommon) => saveAndCreate(p)}
              busy={formBusy}
            />
          </Modal>
          <Drawer
            width={640}
            visible={!!(selectedProject && selectedProject._label)}
            onClose={() => setSelectedProject(null)}
            title={`Project: ${selectedProject && selectedProject._label}`}
          >
            {selectedProject && (
              <ProjectForm
                project={{
                  _label: selectedProject._label,
                  _rev: selectedProject._rev,
                  description: selectedProject.description || '',
                  base: selectedProject.base,
                  vocab: selectedProject.vocab,
                  apiMappings: selectedProject.apiMappings,
                }}
                onSubmit={(p: ProjectResponseCommon) =>
                  saveAndModify(selectedProject, p)
                }
                onDeprecate={() => saveAndDeprecate(selectedProject)}
                busy={formBusy}
                mode="edit"
              />
            )}
          </Drawer>
        </div>
      ) : (
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <Empty description={`No Organization ${match.params.org} Found`} />
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (org: string, project: string) => dispatch(push(`/${org}/${project}`)),
});

export default connect(
  null,
  mapDispatchToProps
)(ProjectsView);
