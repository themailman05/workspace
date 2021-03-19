import { Check, Lock } from 'react-feather';

interface ISideBar {
  remainingVotes: number;
  maxVotes: number;
}

export default function Sidebar({
  remainingVotes,
  maxVotes,
}: ISideBar): JSX.Element {
  console.log('Sidebar', remainingVotes);
  return (
    <div className="w-8/12">
      <div className="w-full h-24 bg-white border border-gray-400 rounded-lg p-3">
        <p className="font-medium text-gray-700">Your Votes</p>
        <p className="text-center text-2xl font-bold text-gray-700">
          {remainingVotes} / {maxVotes}
        </p>
      </div>
      <button
        className="w-full button button-primary mt-2"
        id="submitVotes"
        type="button"
      >
        Vote
      </button>
      <ul className="mt-4">
        <li>
          <p className="text-lg font-medium text-white">2021</p>
          <ul>
            <li className="flex flex-row items-center">
              <div className="h-5 w-5 mr-2 rounded-full border border-secondaryDark flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-secondaryDark" />
              </div>
              <p className="text-secondaryDark text-base">
                Yearly Grant - 2021
              </p>
            </li>
            <li className="flex flex-row items-center">
              <div className="h-5 w-5 mr-2 rounded-full border border-white flex items-center justify-center flex-shrink-0">
                <Lock size={10} className="text-white" />
              </div>
              <p className="text-white text-base">Quarterly Grant - 01/2021</p>
            </li>
            <li className="flex flex-row items-center">
              <div className="h-5 w-5 mr-2 rounded-full border border-white flex items-center justify-center flex-shrink-0">
                <Lock size={10} className="text-white" />
              </div>
              <p className="text-white text-base">Monthly Grant - 01/2021</p>
            </li>
          </ul>
        </li>
        <li>
          <p className="text-lg font-medium text-white">2020</p>
        </li>
        <li>
          <p className="text-lg font-medium text-white">2019</p>
        </li>
      </ul>
      <span className="flex flex-row items-center space-x-2 text-white">
        <p>Show:</p>
        <label
          className="flex flex-row items-center  space-x-1"
          htmlFor="showClosedElections"
        >
          <input id="showClosedElections" type="checkbox" />
          <p>Active</p>
        </label>
        <label
          className="flex flex-row items-center space-x-1"
          htmlFor="showActiveElections"
        >
          <input id="showActiveElections" type="checkbox" />
          <p>Closed</p>
        </label>
      </span>
    </div>
  );
}
