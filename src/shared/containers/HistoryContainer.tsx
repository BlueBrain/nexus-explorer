import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { diff } from 'deep-object-diff';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import {
  getResourceLabelsAndIdsFromSelf,
  blacklistKeys,
  getUsername,
} from '../utils';
import HistoryComponent from '../components/History';

const HistoryContainer: React.FunctionComponent<{
  self: string;
  latestRev: number;
  link?: (rev: number) => React.ReactNode;
}> = ({ self, latestRev, link }) => {
  const [revisions, setRevisions] = React.useState<
    {
      changes: object;
      hasChanges: boolean;
      userName: string;
      updatedAt: string;
      createdAt: string;
    }[]
  >([]);
  const nexus = useNexusContext();
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(self);

  useAsyncEffect(async () => {
    // This creates an array like [0,1,2,3]
    // so if you have 4 revisions
    // it will be [0,1,2,3]
    const promises = [...Array(latestRev).keys()]
      // now map them to resource revisions
      .map((index: number) => {
        return nexus.Resource.get(orgLabel, projectLabel, resourceId, {
          rev: index + 1,
        });
      });

    const metadataKeys = ['_rev', '_updatedAt', '_updatedBy'];
    const revisions = await Promise.all(promises);
    setRevisions(
      revisions.map((revision: Resource, index: number) => {
        const previous = blacklistKeys(
          revisions[index - 1] || {},
          metadataKeys
        );
        const current = blacklistKeys(revision, metadataKeys);
        const changes = diff(current, previous);
        const hasChanges = JSON.stringify(changes, null, 2) !== '{}';

        return {
          changes,
          hasChanges,
          userName: getUsername(revision._updatedBy),
          updatedAt: revision._updatedAt,
          createdAt: revision._createdAt,
        };
      })
    );
  }, [orgLabel, projectLabel, resourceId]);

  return <HistoryComponent revisions={revisions} link={link} />;
};

export default HistoryContainer;
