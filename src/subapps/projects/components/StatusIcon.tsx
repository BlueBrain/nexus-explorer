import * as React from 'react';

import { Status } from '../types';

const progressIcon = require('../../../shared/images/progressIcon.svg');
const blockedIcon = require('../../../shared/images/blockedStatus.svg');
const todoIcon = require('../../../shared/images/todoStatus.svg');
const doneIcon = require('../../../shared/images/done.svg');
const progressIconMini = require('../../../shared/images/progressIconMini.svg');
const blockedIconMini = require('../../../shared/images/blockedIconMini.svg');
const doneIconMini = require('../../../shared/images/doneIconMini.svg');

const StatusIcon: React.FC<{
  status: Status;
  mini?: boolean;
}> = ({ status, mini }) => {
  let icon;

  switch (status) {
    case Status.inProgress:
      icon = mini ? progressIconMini : progressIcon;
      break;
    case Status.blocked:
      icon = mini ? blockedIconMini : blockedIcon;
      break;
    case Status.toDo:
      icon = todoIcon;
      break;
    case Status.done:
      icon = mini ? doneIconMini : doneIcon;
      break;
    default:
      icon = todoIcon;
  }

  return <img src={icon} width={mini ? '18px' : '35px'} />;
};

export default StatusIcon;
