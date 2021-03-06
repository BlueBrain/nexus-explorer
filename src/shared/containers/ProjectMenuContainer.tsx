import * as React from 'react';
import { AccessControl } from '@bbp/react-nexus';
import { Link } from 'react-router-dom';
import { Divider, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
  DEFAULT_SPARQL_VIEW_ID,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
} from '@bbp/nexus-sdk';

import SideMenu from '../components/Menu/SideMenu';
import FileUploadContainer from '../containers/FileUploadContainer';
import ResourceFormContainer from '../containers/ResourceFormContainer';

const ProjectMenuContainer: React.FunctionComponent<{
  menuVisible: boolean;
  setMenuVisible: (value: boolean) => void;
  orgLabel: string;
  projectLabel: string;
}> = ({ menuVisible, orgLabel, projectLabel, setMenuVisible }) => {
  const [activeResourceMenuTab, setActiveResourceMenuTab] = React.useState(
    'resources'
  );

  const tabList = [
    {
      key: 'resources',
      tab: 'Resources',
    },
    {
      key: 'studios',
      tab: 'Studios',
    },
  ];

  const menuContentList: { [key: string]: any } = {
    resources: [
      <p>
        View resources in your project using pre-defined query-helper lists.
      </p>,
      <div className="project-menu__controls">
        <AccessControl
          path={`/${orgLabel}/${projectLabel}`}
          permissions={['resources/write']}
        >
          <ResourceFormContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
          />
        </AccessControl>
        <Link
          to={`/admin/${orgLabel}/${projectLabel}/${encodeURIComponent(
            DEFAULT_SPARQL_VIEW_ID
          )}/sparql`}
        >
          Sparql Query Editor
        </Link>
        <Link
          to={`/admin/${orgLabel}/${projectLabel}/${encodeURIComponent(
            DEFAULT_ELASTIC_SEARCH_VIEW_ID
          )}/_search`}
        >
          ElasticSearch Query Editor
        </Link>
        <Link to={`/admin/${orgLabel}/${projectLabel}/_settings/acls`}>
          View Project's permissions
        </Link>
      </div>,
      <AccessControl
        path={`/${orgLabel}/${projectLabel}`}
        permissions={['files/write']}
      >
        <Divider />
        <FileUploadContainer projectLabel={projectLabel} orgLabel={orgLabel} />
      </AccessControl>,
    ],
  };

  return (
    <div className="project-menu">
      <SideMenu
        visible={menuVisible}
        tabList={tabList}
        onTabChange={(key: string) => setActiveResourceMenuTab(key)}
        activeTabKey={activeResourceMenuTab}
        tabBarExtraContent={
          <Button
            icon={<CloseOutlined />}
            onClick={() => setMenuVisible(false)}
            style={{ border: 'none' }}
          />
        }
      >
        <div className="project-menu__content">
          {menuContentList[activeResourceMenuTab]}
        </div>
      </SideMenu>
    </div>
  );
};

export default ProjectMenuContainer;
