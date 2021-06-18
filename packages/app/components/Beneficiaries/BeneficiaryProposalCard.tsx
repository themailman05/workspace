import {
  BeneficiaryCardProps,
  ProposalCardProps,
} from 'interfaces/beneficiaries';
import Link from 'next/link';
import { formatAndRoundBigNumber } from 'utils/formatBigNumber';

interface IVotingRow {
  name: string;
  value: string;
}

interface IBeneficiaryProposalCard {
  displayData: BeneficiaryCardProps | ProposalCardProps;
  isProposal: boolean;
  isTakedown: boolean;
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
  beneficiaryProposal: ProposalCardProps,
): JSX.Element {
  return (
    <div>
      <VotingRow name={'Status'} value={String(beneficiaryProposal.status)} />
      <VotingRow
        name={'Voting Deadline'}
        value={beneficiaryProposal.stageDeadline.toLocaleString()}
      />
      <VotingRow
        name={'Votes For'}
        value={formatAndRoundBigNumber(beneficiaryProposal.votesFor)}
      />
      <VotingRow
        name={'Votes Against'}
        value={formatAndRoundBigNumber(beneficiaryProposal.votesAgainst)}
      />
      <VotingRow
        name={'Total Votes'}
        value={formatAndRoundBigNumber(
          beneficiaryProposal.votesFor.add(beneficiaryProposal.votesAgainst),
        )}
      />
    </div>
  );
}

export default function BeneficiaryProposalCard({
  displayData,
  isProposal,
  isTakedown,
}: IBeneficiaryProposalCard): JSX.Element {
  return (
    <Link
      key={displayData.name}
      href={
        isTakedown
          ? '/beneficiary-proposals/takedowns/' + displayData.ethereumAddress
          : isProposal
          ? '/beneficiary-proposals/' + displayData.ethereumAddress
          : '/beneficiaries/' + displayData.ethereumAddress
      }
    >
      <a>
        <div className="m-0 shadow-sm w-100 h-auto rounded-lg bg-white border-b border-gray-200 ">
          <div className="aspect-w-3 aspect-h-2">
            <img
              className="w-100 h-auto md:w-100 md:h-auto md:rounded-t rounded-t mx-auto"
              src={`${process.env.IPFS_URL}${displayData?.profileImage}`}
              alt=""
            />
          </div>
          <div className="space-y-2 my-2">
            <div>
              <h3 className="mx-4 mt-4 text-lg font-bold text-gray-800 leading-snug">
                {displayData.name}
              </h3>
              <p className="mx-4 my-4 text-m font-medium  text-gray-700">
                {displayData.missionStatement}
              </p>
            </div>
            {isProposal ? (
              <VotingInformation {...(displayData as ProposalCardProps)} />
            ) : (
              <div> </div>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
}
