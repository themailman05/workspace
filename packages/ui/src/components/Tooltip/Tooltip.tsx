import { QuestionMarkCircleIcon } from '@heroicons/react/outline';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import './Tooltip.module.css';

interface TooltipProps {
  id: string;
  direction: 'top' | 'right' | 'bottom' | 'left';
  tooltip: string;
}

const Tooltip: React.FC<TooltipProps> = ({ id, direction, tooltip }) => {
  return (
    <div>
      <QuestionMarkCircleIcon
        data-tip
        data-for={id}
        className="cursor-pointer"
      />
      <ReactTooltip
        id={id}
        place={direction}
        effect="solid"
        className="tooltip"
      >
        <p>{tooltip}</p>
      </ReactTooltip>
    </div>
  );
};

export default Tooltip;
