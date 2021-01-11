import * as React from 'react';
import { Badge, Button, Popover, Modal } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';

import NotififcationsPopover from '../components/NotificationsPopover';
import { useUnlinkedActivities } from '../hooks/useUnlinkedActivities';
import LinkActivityForm from '../components/LinkActivityForm';
import fusionConfig from '../config';
import { displayError, successNotification } from '../components/Notifications';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import { useActivitySubClasses } from '../hooks/useActivitySubClasses';
import { labelOf } from '../../../shared/utils';

const ActivitiesLinkingContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const { unlinkedActivities, fetchUnlinkedActivities } = useUnlinkedActivities(
    orgLabel,
    projectLabel
  );
  const [showLinkForm, setShowLinkForm] = React.useState<boolean>(false);
  const [showCreateStepForm, setshowCreateStepForm] = React.useState<boolean>(
    false
  );
  const [selectedActivity, setSelectedActivity] = React.useState<any>();
  const [steps, setSteps] = React.useState<any[]>([]);
  const { subClasses, fetchSubClasses, error } = useActivitySubClasses();
  const nexus = useNexusContext();

  const fetchWorkflowSteps = (activities: any) => {
    Promise.all(
      activities.map((activity: any) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity['@id'])
        );
      })
    )
      .then(response => setSteps(response))
      .catch(error => {
        displayError(error, 'Failed to fetch Activities');
      });
  };

  const onClickLinkActivity = (id: string) => {
    setSelectedActivity(
      unlinkedActivities.find(activity => activity.resourceId === id)
    );

    nexus.Resource.list(orgLabel, projectLabel, {
      type: fusionConfig.workflowStepType,
      size: 200,
      deprecated: false,
    })
      .then(response => {
        fetchWorkflowSteps(response._results);
      })
      .catch(error => {
        displayError(error, 'Failed to load the list of Workflow Steps');
      });

    setShowLinkForm(true);
  };

  const updateWorkflowStep = (stepId: string, originalPayload: any) => {
    const updatedPayload = originalPayload;

    if (originalPayload[fusionConfig.activityWorkflowLink]) {
      updatedPayload[fusionConfig.activityWorkflowLink] = Array.isArray(
        originalPayload[fusionConfig.activityWorkflowLink]
      )
        ? [
            ...originalPayload[fusionConfig.activityWorkflowLink],
            {
              '@id': selectedActivity.resourceId,
            },
          ]
        : [
            originalPayload[fusionConfig.activityWorkflowLink],
            {
              '@id': selectedActivity.resourceId,
            },
          ];
    } else {
      updatedPayload[fusionConfig.activityWorkflowLink] = {
        '@id': selectedActivity.resourceId,
      };
    }

    return nexus.Resource.update(
      orgLabel,
      projectLabel,
      stepId,
      steps.find(step => step['@id'] === stepId)._rev,
      {
        ...updatedPayload,
      }
    );
  };

  const linkActivity = (stepId: string) => {
    setShowLinkForm(false);

    nexus.Resource.getSource(orgLabel, projectLabel, encodeURIComponent(stepId))
      .then(response => updateWorkflowStep(stepId, response))
      .then(() => {
        successNotification('The activity is linked successfully');
        //  TODO: find a better solution
        const reloadTimer = setTimeout(() => {
          fetchUnlinkedActivities();
          clearTimeout(reloadTimer);
        }, 4000);
      })
      .catch(error =>
        displayError(
          error,
          'Oops! Something got wrong - the Activity was not linked'
        )
      );
  };

  const addNew = (id: string) => {
    setSelectedActivity(
      unlinkedActivities.find(activity => activity.resourceId === id)
    );

    fetchSubClasses();
    setshowCreateStepForm(true);
  };

  const stepsList = steps.map(step => ({
    id: step['@id'],
    name: step.name,
  }));

  const defaultActivityType = () => {
    if (selectedActivity) {
      const types = Array.from(
        selectedActivity.resourceType as string[]
      ).map(type => labelOf(type));

      return types.find(type => type !== 'Activity');
    }

    return undefined;
  };

  return (
    <>
      <Popover
        placement="topLeft"
        title={
          <h3
            style={{ marginTop: '7px' }}
          >{`${unlinkedActivities.length} detached activities`}</h3>
        }
        content={
          <NotififcationsPopover
            activities={unlinkedActivities}
            onClickLinkActivity={onClickLinkActivity}
            onClickNew={addNew}
          />
        }
        trigger="click"
      >
        <Badge count={unlinkedActivities.length}>
          <Button
            icon={<BellOutlined style={{ color: 'inherit' }} />}
            shape="circle"
            style={{ marginLeft: '7px' }}
          />
        </Badge>
      </Popover>
      <Modal
        maskClosable
        visible={showLinkForm}
        footer={null}
        onCancel={() => setShowLinkForm(false)}
        width={1000}
        destroyOnClose={true}
      >
        <LinkActivityForm
          activity={selectedActivity}
          stepsList={stepsList}
          onSubmit={linkActivity}
          onCancel={() => setShowLinkForm(false)}
        />
      </Modal>
      <Modal
        maskClosable
        visible={showCreateStepForm}
        footer={null}
        onCancel={() => setshowCreateStepForm(false)}
        width={1200}
        destroyOnClose={true}
      >
        <WorkflowStepWithActivityForm
          title="Create new Workflow Step"
          onClickCancel={() => setshowCreateStepForm(false)}
          onSubmit={() => {}}
          busy={false}
          parentLabel={''}
          siblings={[]}
          activityList={subClasses}
          defaultActivityType={defaultActivityType()}
        />
      </Modal>
    </>
  );
};

export default ActivitiesLinkingContainer;
