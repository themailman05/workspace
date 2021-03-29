import { Check } from 'react-feather';

interface IGrantFunded {
  votes: number;
}

export default function GrantFunded({ votes }: IGrantFunded): JSX.Element {
  return (
    <span className="flex flex-row">
      <div className="h-12 w-12 mr-2 rounded-full border-4 border-green-400 flex items-center justify-center flex-shrink-0">
        <Check size={38} className="text-green-400" />
      </div>
      <div>
        <p className="text-lg text-gray-700 font-bold">Funded</p>
        <p className="text-gray-700 text-base">{votes}</p>
      </div>
    </span>
  );
}
