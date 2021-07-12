import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Collapse } from 'antd';

const { Panel } = Collapse;

type VideoProps = {
  resource: Resource;
};

type VideoObject = {
  name: String;
  description: String;
  thumbnailUrl: [];
  uploadDate: Date;
  duration: String;
  embedUrl: String;
};

const VideoPlugin: React.FunctionComponent<VideoProps> = ({ resource }) => {
  return (
    <Collapse onChange={() => {}}>
      <Panel header="Video" key="1">
        {resource['video'].map((v: VideoObject, k: number) => (
          <li key={k}>{v.name}</li>
        ))}
        {/* <iframe
          width="853"
          height="480"
          src={resource['video']['embedUrl']}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        /> */}
      </Panel>
    </Collapse>
  );
};

export default VideoPlugin;
