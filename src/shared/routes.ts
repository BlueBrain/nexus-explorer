import { RouteProps } from 'react-router-dom';
import Login from './views/Login';
import ResourceView from './views/ResourceView';
import UserView from './views/UserView';
import StudioView from './views/StudioView';
import StudioListView from './views/StudioListView';
import Home from './views/Home';

const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: Home,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/user',
    component: UserView,
  },
  {
    path: '/studio',
    exact: true,
    component: StudioListView,
  },
  {
    path: '/:orgLabel/:projectLabel/resources/:resourceId',
    component: ResourceView,
  },
  {
    path: '/:orgLabel/:projectLabel/studios/:studioId',
    exact: true,
    component: StudioView,
  },
  {
    path: '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId',
    exact: true,
    component: StudioView,
  },
  {
    path:
      '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId',
    exact: true,
    component: StudioView,
  },
  {
    path:
      '/:orgLabel/:projectLabel/studios/:studioId/workspaces/:workspaceId/dashboards/:dashboardId/studioResource/:studioResourceId',
    exact: true,
    component: StudioView,
  },
  // TODO move to admin
  // {
  //   path: '/:orgLabel/:projectLabel/:viewId/_search',
  //   component: ElasticSearchQueryView,
  // },
  // {
  //   path: '/:orgLabel/:projectLabel/:viewId/sparql',
  //   component: SparqlQueryView,
  // },
  // {
  //   path: '/:orgLabel/:projectLabel/_settings/acls',
  //   component: ACLsView,
  // },
];

export default routes;
