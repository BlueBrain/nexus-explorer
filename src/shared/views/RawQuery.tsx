import * as React from 'react';
import { connect } from 'react-redux';
import RawSparqlQueryView from '../components/RawQueryView/RawSparqlQueryView';
import RawElasticSearchQueryView from '../components/RawQueryView/RawElasticSearchQueryView';
import { NexusState } from '../store/reducers/nexus';
import { RouteComponentProps, match } from 'react-router';
import { fetchAndAssignProject } from '../store/actions/nexus/projects';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import * as queryString from 'query-string';
import { push } from 'connected-react-router';
import { Menu, Dropdown, Icon } from 'antd';

interface RawQueryProps extends RouteComponentProps {
  activeOrg: { label: string };
  activeProject: { label: string };
  activeView?: { id: string };
  busy: boolean;
  fetchProject(orgName: string, projectName: string): void;
  match: match<{ org: string; project: string; view: string }>;
  goToOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
  location: any;
}

export const RawElasticSearchQueryComponent: React.FunctionComponent<
  RawQueryProps
> = ({
  match,
  activeOrg,
  activeProject,
  fetchProject,
  goToOrg,
  goToProject,
  location,
}): JSX.Element => {
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      activeProject.label !== match.params.project
    ) {
      fetchProject(match.params.org, match.params.project);
    }
  }, [match.params.org, match.params.project]);
  const view = decodeURIComponent(match.params.view);
  const query = queryString.parse(location.search).query;
  const menu = (
    <Menu>
      <Menu.Item key="0">
        <a href="http://www.alipay.com/">1st menu item</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="http://www.taobao.com/">2nd menu item</a>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
  );

  return (
    <div className="view-view">
      <h1 className="name">
        <span>
          <a onClick={() => goToOrg(match.params.org)}>{match.params.org}</a> |{' '}
          <a
            onClick={() => goToProject(match.params.org, match.params.project)}
          >
            {match.params.project}
          </a>{' '}
          |{' '}
        </span>
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link">
            {view}
            <Icon type="down" />
          </a>
        </Dropdown>
      </h1>
      <RawElasticSearchQueryView
        initialQuery={query}
        wantedOrg={match.params.org}
        wantedProject={match.params.project}
        wantedView={match.params.view}
      />
    </div>
  );
};

const RawSparqlQueryComponent: React.FunctionComponent<RawQueryProps> = ({
  match,
  activeOrg,
  activeProject,
  goToOrg,
  goToProject,
  fetchProject,
}): JSX.Element => {
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      activeProject.label !== match.params.project
    ) {
      fetchProject(match.params.org, match.params.project);
    }
  }, [match.params.org, match.params.project]);
  const view = decodeURIComponent(match.params.view);
  return (
    <div className="view-view">
      <h1 className="name">
        <span>
          <a onClick={() => goToOrg(match.params.org)}>{match.params.org}</a> |{' '}
          <a
            onClick={() => goToProject(match.params.org, match.params.project)}
          >
            {match.params.project}
          </a>{' '}
          |{' '}
        </span>
        {view}
      </h1>
      <RawSparqlQueryView
        wantedOrg={match.params.org}
        wantedProject={match.params.project}
        wantedView={view}
      />
    </div>
  );
};

const mapStateToProps = (state: NexusState) => ({
  activeOrg: (state &&
    state.activeOrg &&
    state.activeOrg.data &&
    state.activeOrg.data.org) || { label: '' },
  activeProject: (state && state.activeProject && state.activeProject.data) || {
    label: '',
  },
  busy:
    (state && state.activeProject && state.activeProject.isFetching) || false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchProject: (org: string, project: string) => {
    dispatch(fetchOrg(org));
    dispatch(fetchAndAssignProject(org, project));
  },
  goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  goToProject: (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`)),
});

export const RawSparqlQuery = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawSparqlQueryComponent);

export const RawElasticSearchQuery = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawElasticSearchQueryComponent);
