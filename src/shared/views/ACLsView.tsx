import * as React from 'react';
import { connect } from 'react-redux';
import { Empty, Spin } from 'antd';
import { push } from 'connected-react-router';
import { ACL } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ACLsForm from '../components/ACLs/ACLsForm';

interface ACLsViewProps {
  match: any;
  goToOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
}
const ACLs: React.FunctionComponent<ACLsViewProps> = ({
  match,
  goToOrg,
  goToProject,
}) => {
  const path = `${match.params.org}${
    match.params.project ? `/${match.params.project}` : ''
  }`;

  const [{ busy, error, acls }, setACLs] = React.useState<{
    busy: Boolean;
    error: Error | null;
    acls: ACL[] | null;
  }>({
    busy: false,
    error: null,
    acls: null,
  });

  const nexus = useNexusContext();

  React.useEffect(() => {
    if (!busy) {
      setACLs({
        error: null,
        acls: null,
        busy: true,
      });
      nexus.ACL.list(path, { ancestors: true })
        .then(acls => {
          setACLs({
            acls: acls._results,
            busy: false,
            error: null,
          });
        })
        .catch(error => {
          setACLs({
            error,
            acls: null,
            busy: false,
          });
        });
    }
  }, [match.params.orgLabel, match.params.projectLabel]);

  return (
    <div className="acl-view view-container">
      <div style={{ flexGrow: 1 }}>
        <h1 className="name">
          <span>
            <a onClick={() => goToOrg(match.params.org)}>{match.params.org}</a>{' '}
            |{' '}
            <a
              onClick={() =>
                goToProject(match.params.org, match.params.project)
              }
            >
              {match.params.project}
            </a>{' '}
          </span>
        </h1>
        {busy && <Spin tip="Loading ACLs..." />}
        {error && (
          <Empty
            style={{ marginTop: '22vh' }}
            description={
              <span>Error while retrieving ALCs: {error.message}</span>
            }
          />
        )}
        {!acls ||
          (acls.length === 0 && (
            <Empty
              style={{ marginTop: '22vh' }}
              description={'No ACLs to display...'}
            />
          ))}
        {acls && <ACLsForm acls={acls} path={path} />}
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  goToProject: (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`)),
});

export default connect(
  null,
  mapDispatchToProps
)(ACLs);
