import * as React from 'react';
import { QueriesContainerProps } from './QueryContainer';
import Query from './Query';
import './queries-board.less';

interface QueriesComponentProps extends QueriesContainerProps {}

const QueriesComponent: React.FunctionComponent<
  QueriesComponentProps
> = props => {
  const { lists, queryResources } = props;
  return (
    <div className="queries-board">
      {lists.map(list => {
        return <Query {...{ ...list, queryResources }} key={list.id} />;
      })}
    </div>
  );
};

export default QueriesComponent;
