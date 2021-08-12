import { QuestionMarkCircleIcon } from '@heroicons/react/outline';

interface TooltipProps {
  id: string;
  direction: 'top' | 'right' | 'bottom' | 'left';
  title: string;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ id, direction, title, text }) => {
  return (
    <div>
      <QuestionMarkCircleIcon
        data-tip
        data-for={id}
        className="cursor-pointer w-4 h-4"
      />
      <ReactTooltip
        id={id}
        place={direction}
        effect="solid"
        className="tooltip"
      >
        <p>{title}</p>
        <p>{text}</p>
      </ReactTooltip>
    </div>
  );
};

export default function Test() {
  return (
    <div>
      <Tooltip id="tooltip" direction="bottom" title="title" text="text" />
    </div>
  );
}
