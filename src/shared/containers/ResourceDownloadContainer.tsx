import * as React from 'react';
import { Button, Dropdown, Menu, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { DownOutlined } from '@ant-design/icons';

type formatType = 'vnd.graph-viz' | 'n-triples' | 'json';

const ResourceDownloadButton: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
}> = props => {
  const nexus = useNexusContext();
  const download = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    format: formatType
  ) => {
    nexus.Resource.get(orgLabel, projectLabel, resourceId, { as: format })
      .then(result => {
        const extension = {
          json: 'json',
          'n-triples': 'txt',
          'vnd.graph-viz': 'dot',
        }[format];
        const blob = new Blob([
          format === 'json' ? JSON.stringify(result) : result.toString(),
        ]);
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        setFilename(`${resourceId}.${extension}`);
        refContainer.current.click();
      })
      .catch(error => {
        notification.error({
          message: error.reason,
        });
      });
  };
  const linkStyle: any = {
    display: 'none',
  };
  const refContainer = React.useRef<any>(null);
  const [filename, setFilename] = React.useState<string>('');
  const [downloadUrl, setDownloadUrl] = React.useState<any>(null);
  const menu = (
    <Menu
      onClick={clickparam => {
        const format: formatType = clickparam.key.toString() as formatType;
        download(props.orgLabel, props.projectLabel, props.resourceId, format);
      }}
    >
      <Menu.Item key="json">JSON</Menu.Item>
      <Menu.Item key="n-triples">N-triples</Menu.Item>
      <Menu.Item key="vnd.graph-viz">Dot file</Menu.Item>
    </Menu>
  );

  return (
    <div className="action">
      <a
        href={downloadUrl}
        ref={refContainer}
        download={filename}
        style={linkStyle}
      >
        download
      </a>
      <Dropdown overlay={menu}>
        <Button icon={<DownOutlined />}>Download Metadata</Button>
      </Dropdown>
    </div>
  );
};

export default ResourceDownloadButton;
