import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { displayError } from '../components/Notifications';

import ActivityCard from '../components/Activities/ActivityCard';
import { ActivityResource } from '../views/ActivityView';
import { isParentLink } from '../utils';

const SignleActivityContainer: React.FC<{
  projectLabel: string;
  orgLabel: string;
  activity: ActivityResource;
}> = ({ projectLabel, orgLabel, activity }) => {
  const nexus = useNexusContext();
  const [children, setChildren] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = () => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(activity['@id']),
      'incoming'
    )
      .then(response =>
        Promise.all(
          response._results
            .filter(link => isParentLink(link))
            .map(link => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
        )
          .then(response => {
            setChildren(response);
          })
          .catch(error => displayError(error, 'Failed to load activities'))
      )
      .catch(error => displayError(error, 'Failed to load activities'));
  };

  if (!activity) return null;

  return (
    <ActivityCard
      activity={activity}
      subactivities={children}
      key={activity['@id']}
      projectLabel={projectLabel}
      orgLabel={orgLabel}
    />
  );
};

export default SignleActivityContainer;