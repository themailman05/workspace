// TODO: Replace internal anchor links with Link elements - this way we can traverse properly

import Link from 'next/link';
import { social } from '../../fixtures/social';

const beneficiaryProposalCard = (beneficiaryProposal) => {
  return (
    <Link
      key={beneficiaryProposal.name}
      href={'beneficiaries/' + beneficiaryProposal.ethereumAddress}
    >
      <div className="m-0 shadow-sm w-100 h-auto rounded-lg bg-white border-b border-gray-200 ">
        <div className="aspect-w-3 aspect-h-2">
          <img
            className="w-100 h-auto md:w-100 md:h-auto md:rounded-t rounded-t mx-auto"
            src={beneficiaryProposal.profileImageURL}
            alt=""
          />
        </div>

        <div className="space-y-2 my-2">
          <div>
            <h3 className="mx-4 mt-4 text-lg font-bold text-gray-800 leading-snug">
              {beneficiaryProposal.name}
            </h3>
            <span className="mx-4 my-1 flex flex-row justify-between">
              <p className="text-lg font-medium text-gray-700">Status</p>
              <span className="text-base text-gray-700 flex flex-row">
                <p>{beneficiaryProposal.currentStage}</p>
              </span>
            </span>

            <span className="mx-4 flex flex-row justify-between">
              <p className="text-lg font-medium text-gray-700">Votes For</p>
              <span className="text-base text-gray-700 flex flex-row">
                <p>{beneficiaryProposal.votesFor}</p>
              </span>
            </span>
            <span className="mx-4 flex flex-row justify-between">
              <p className="text-lg font-medium text-gray-700">Votes Against</p>
              <span className="text-base text-gray-700 flex flex-row">
                <p>{beneficiaryProposal.votesAgainst}</p>
              </span>
            </span>
            <span className="mx-4 flex flex-row justify-between">
              <p className="text-lg font-medium text-gray-700">Total Votes</p>
              <span className="text-base text-gray-700 flex flex-row">
                <p>
                  {beneficiaryProposal.votesFor +
                    beneficiaryProposal.votesAgainst}
                </p>
              </span>
            </span>
            <p className="mx-4 my-4 text-m font-medium  text-gray-700">
              {beneficiaryProposal.missionStatement}
            </p>
          </div>
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-sm text-gray-500"></span>
            </div>
          </div>
          <div className="flex space-x-6 mx-4 justify-center">
            {social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default beneficiaryProposalCard;
