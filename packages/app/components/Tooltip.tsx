import { QuestionMarkCircleIcon } from '@heroicons/react/outline';
import ReactTooltip from 'react-tooltip';

interface TooltipProps {
  id: string;
  direction?: 'top' | 'right' | 'bottom' | 'left';
  title: string;
  text: string;
  size?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  id,
  direction = 'bottom',
  title,
  text,
  size = 4,
}) => {
  return (
    <div className="">
      <QuestionMarkCircleIcon
        data-tip
        data-for={id}
        className={`cursor-pointer h-${size} w-${size}`}
      />
      <ReactTooltip
        id={id}
        place={direction}
        effect="solid"
        type="light"
        className="shadow-lg border border-gray-50 p-1 w-60"
      >
        <p className="font-bold text-center">{title}</p>
        <p className="text-center text-gray-600">{text}</p>
      </ReactTooltip>
    </div>
  );
};

export default Tooltip;
