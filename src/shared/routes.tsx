import * as React from 'react';
import { RouteProps, match } from 'react-router-dom';
import Landing from './views/Landing';
import Home from './views/Home';
import Login from './views/Login';
import Project from './views/Project';
import {
  fetchOrgs,
  fetchProjects,
  fetchResources,
  loadProjectViewData,
} from './store/actions/nexus';
import { RawElasticSearchQuery, RawSparqlQuery } from './views/RawQuery';
import { ThunkAction } from './store';
import { RootState } from './store/reducers';
import {
  ProjectBreadcrumbLabel,
  HomeBreadcrumbLabel,
  OrgBreadcrumbLabel,
  LoginBreadcrumbLabel,
  RawQueryBreadcrumbLabel,
} from './views/breadcrumbs/BreadcrumbLabels';

export interface RouteWithData extends RouteProps {
  breadcrumbLabel?: any;
  loadData?(state: RootState, match: match | null): ThunkAction;
}
const routes: RouteWithData[] = [
  {
    path: '/',
    exact: true,
    component: Landing,
    breadcrumbLabel: HomeBreadcrumbLabel,
    loadData: () => fetchOrgs(),
  },
  {
    path: '/login',
    breadcrumbLabel: LoginBreadcrumbLabel,
    component: Login,
  },
  {
    path: '/:org',
    exact: true,
    component: Home,
    breadcrumbLabel: OrgBreadcrumbLabel,
    loadData: (state, match) =>
      fetchProjects(match && match.params && (match.params as any)['org']),
  },
  {
    path: '/:org/:project',
    exact: true,
    component: Project,
    breadcrumbLabel: ProjectBreadcrumbLabel,
    // loadData: (state, match) =>
    // loadProjectViewData(
    //   match && match.params && (match.params as any)['org'],
    //   match && match.params && (match.params as any)['project'],
    //   state && state.nexus && state.nexus.resourcePaginationSettings
    // ),
  },
  {
    path: '/:org/:project/_search',
    component: RawElasticSearchQuery,
    breadcrumbLabel: RawQueryBreadcrumbLabel,
  },
  {
    path: '/:org/:project/:view/_search',
    component: RawElasticSearchQuery,
    breadcrumbLabel: RawQueryBreadcrumbLabel,
  },
  {
    path: '/:org/:project/graph/sparql',
    component: RawSparqlQuery,
    breadcrumbLabel: RawQueryBreadcrumbLabel,
  },
];

export default routes;
