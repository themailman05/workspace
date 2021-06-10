import Link from 'next/link';
import * as Icon from 'react-feather';
import {
  BeneficiaryCardProps,
  DummyBeneficiaryProposal,
} from '../interfaces/beneficiaries';

interface IVotingRow {
  name: string;
  value: string;
}

interface IBeneficiaryProposalCard {
  displayData: DummyBeneficiaryProposal | BeneficiaryCardProps;
  isProposal: boolean;
}

function VotingRow(data: IVotingRow): JSX.Element {
  return (
    <span className="mx-4 my-1 flex flex-row justify-between">
      <p className="text-lg font-medium text-gray-700">{data.name}</p>
      <span className="text-base text-gray-700 flex flex-row">
        <p>{data.value}</p>
      </span>
    </span>
  );
}

function VotingInformation(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {
  return (
    <div>
      <VotingRow name={'Status'} value={beneficiaryProposal.currentStage} />
      <VotingRow
        name={'Voting Deadline'}
        value={beneficiaryProposal.stageDeadline.toLocaleString()}
      />
      <VotingRow
        name={'Votes For'}
        value={beneficiaryProposal.votesFor.toString()}
      />
      <VotingRow
        name={'Votes Against'}
        value={beneficiaryProposal.votesAgainst.toString()}
      />
      <VotingRow
        name={'Total Votes'}
        value={(
          beneficiaryProposal.votesFor + beneficiaryProposal.votesAgainst
        ).toString()}
      />
    </div>
  );
}

export default function BeneficiaryProposalCard({
  displayData,
  isProposal,
}: IBeneficiaryProposalCard): JSX.Element {
  return (
    <Link
      key={displayData?.name}
      href={
        isProposal
          ? 'beneficiary-proposals/' + displayData?.ethereumAddress
          : 'beneficiaries/' + displayData?.ethereumAddress
      }
    >
      <a>
        <div className="m-0 shadow-sm w-100 h-auto rounded-lg bg-white border-b border-gray-200 ">
          <div className="aspect-w-3 aspect-h-2">
            <img
              className="w-100 h-auto md:w-100 md:h-auto md:rounded-t rounded-t mx-auto"
              src={`${process.env.IPFS_URL}${displayData?.profileImageURL}`}
              alt=""
            />
          </div>
          <div className="space-y-2 my-2">
            <div>
              <h3 className="mx-4 mt-4 text-lg font-bold text-gray-800 leading-snug">
                {displayData?.name}
              </h3>
              <p className="mx-4 my-4 text-m font-medium  text-gray-700">
                {displayData?.missionStatement}
              </p>
            </div>
            {isProposal ? (
              <VotingInformation
                {...(displayData as DummyBeneficiaryProposal)}
              />
            ) : (
              <div> </div>
            )}
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
            <div
              className="flex space-x-6 mx-4 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
                <a
                  href={`https://${displayData?.twitterUrl}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Icon.Twitter aria-hidden="true" />
                </a>
                <a
                  href={`https://${displayData?.facebookUrl}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Icon.Facebook aria-hidden="true" />
                </a>
                <a
                  href={`https://${displayData?.instagramUrl}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Icon.Instagram aria-hidden="true" />
                </a>
                <a
                  href={`https://${displayData?.githubUrl}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Icon.GitHub aria-hidden="true" />
                </a>
                <a
                  href={`https://${displayData?.linkedinUrl}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Icon.Linkedin aria-hidden="true" />
                </a>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
