import { QuestionMarkCircleIcon } from '@heroicons/react/outline';
import ReactTooltip from 'react-tooltip';

export interface TooltipProps {
  title: string;
  content: string | React.ReactElement;
  place?: "bottom" | "left" | "right" | "top";
}

export const Tooltip: React.FC<TooltipProps> = ({ title, content, place }) => {
  return (
    <div className="">
      <QuestionMarkCircleIcon
        data-tip
        data-for="tooltip"
        className={`cursor-pointer h-4 w-4`}
      />
      <ReactTooltip
        id="tooltip"
        place={place || "bottom"}
        effect="solid"
        type="light"
        className="shadow-lg border border-gray-50 p-1 w-60"
      >
        <p className="font-bold text-center">{title}</p>
        <p className="text-center text-gray-600">{content}</p>
      </ReactTooltip>
    </div>
  );
}
export default Tooltip;