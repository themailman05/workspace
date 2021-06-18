import {
  BaseBeneficiary,
  BaseProposal,
} from 'interfaces/beneficiaries';
import Link from 'next/link';
import { formatAndRoundBigNumber } from 'utils/formatBigNumber';

interface IVotingRow {
  name: string;
  value: string;
}

interface IBeneficiaryProposalCard {
  displayData: BaseBeneficiary | BaseProposal;
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

export default function VotingInformation(
  beneficiaryProposal: BaseProposal,
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
