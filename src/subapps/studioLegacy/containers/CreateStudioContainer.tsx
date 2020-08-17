import * as React from 'react';
import { Button, Modal, notification, message, Icon } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import StudioEditorForm from '../components/StudioEditorForm';
import STUDIO_CONTEXT from '../components/StudioContext';

export const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';

const CreateStudioContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  goToStudio?(studioId: string): void;
}> = ({ orgLabel, projectLabel, goToStudio }) => {
  const nexus = useNexusContext();
  const [showModal, setShowModal] = React.useState(false);

  const generateStudioResource = (label: string, description?: string) => ({
    label,
    description,
    '@context': STUDIO_CONTEXT['@id'],
    '@type': DEFAULT_STUDIO_TYPE,
  });

  const makeStudioContext = async () => {
    try {
      await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(STUDIO_CONTEXT['@id'])
      );
    } catch (error) {
      if (error['@type'] === 'NotFound') {
        // @ts-ignore TODO: update resource type in SDK to allow nested objects
        // https://github.com/BlueBrain/nexus/issues/937
        await nexus.Resource.create(orgLabel, projectLabel, {
          ...STUDIO_CONTEXT,
        });
        return;
      }
      throw error;
    }
  };

  const createStudioResource = async (label: string, description?: string) => {
    await makeStudioContext();
    return await nexus.Resource.create(
      orgLabel,
      projectLabel,
      generateStudioResource(label, description)
    );
  };

  const saveStudio = (label: string, description?: string) => {
    setShowModal(false);

    createStudioResource(label, description)
      .then(response => {
        goToStudio && goToStudio(response['@id']);

        message.success(
          <span>
            Studio <em>{label}</em> created
          </span>
        );
      })
      .catch(error => {
        notification.error({
          message: 'An error occurred',
          description: error.reason || error.message,
          duration: 3,
        });
      });
  };

  return (
    <div className="studio-modal">
      <Button type="primary" block onClick={() => setShowModal(true)}>
        <Icon type="plus-square" style={{ fontSize: '16px', color: 'white' }} />
        Create Studio
      </Button>
      <Modal
        title="Create Studio"
        visible={showModal}
        footer={null}
        onCancel={() => setShowModal(false)}
        destroyOnClose={true}
      >
        <StudioEditorForm saveStudio={saveStudio} />
      </Modal>
    </div>
  );
};

export default CreateStudioContainer;