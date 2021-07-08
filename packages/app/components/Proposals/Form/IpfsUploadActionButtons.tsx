import { CheckIcon, XIcon } from '@heroicons/react/solid';
import { Navigation } from 'pages/proposals/propose';

interface ActionButtonProps {
  clearLocalState: () => void;
  navigation: Navigation;
}

export default function ActionButtons({
  clearLocalState,
  navigation,
}: ActionButtonProps): JSX.Element {
  const { setCurrentStep, currentStep, setStepLimit } = navigation;
  return (
    <div className="row-auto my-2 justify-self-center">
      <button
        onClick={clearLocalState}
        className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Remove
        <XIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
      </button>
      <button
        onClick={() => {
          setStepLimit(currentStep + 1);
          setCurrentStep(currentStep + 1);
        }}
        className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        OK
        <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
