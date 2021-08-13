import { QuestionMarkCircleIcon } from '@heroicons/react/outline';
import ReactTooltip from 'react-tooltip';

export default function Example() {
  return (
    <div className="">
      <QuestionMarkCircleIcon
        data-tip
        data-for="tooltip"
        className={`cursor-pointer h-4 w-4`}
      />
      <ReactTooltip
        id="tooltip"
        place="bottom"
        effect="solid"
        type="light"
        className="shadow-lg border border-gray-50 p-1 w-60"
      >
        <p className="font-bold text-center">Title</p>
        <p className="text-center text-gray-600">Lorem Ipsum Lorem Ipsum</p>
      </ReactTooltip>
    </div>
  );
}
