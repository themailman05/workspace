import Link from 'next/link';
import { social } from '../fixtures/social';
import { DummyBeneficiaryProposal } from '../interfaces/beneficiaries';

interface IVotingRow {
  name: string;
  value: string;
}

interface IBeneficiaryProposalCard {
  beneficiaryProposal: DummyBeneficiaryProposal;
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
  beneficiaryProposal,
  isProposal,
}: IBeneficiaryProposalCard): JSX.Element {
  return (
    <Link
      key={beneficiaryProposal.name}
      href={
        isProposal
          ? 'beneficiary-proposals/' + beneficiaryProposal.ethereumAddress
          : 'beneficiaries/' + beneficiaryProposal.ethereumAddress
      }
    >
      <a>
        <div className="m-0 shadow-sm w-100 h-auto rounded-lg bg-white border-b border-gray-200 ">
          <div className="aspect-w-3 aspect-h-2">
            <img
              className="w-100 h-auto md:w-100 md:h-auto md:rounded-t rounded-t mx-auto"
              src={beneficiaryProposal.profileImage}
              alt=""
            />
          </div>
          <div className="space-y-2 my-2">
            <div>
              <h3 className="mx-4 mt-4 text-lg font-bold text-gray-800 leading-snug">
                {beneficiaryProposal.name}
              </h3>
              <p className="mx-4 my-4 text-m font-medium  text-gray-700">
                {beneficiaryProposal.missionStatement}
              </p>
            </div>
            {isProposal ? (
              <VotingInformation {...beneficiaryProposal} />
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
            <div className="flex space-x-6 mx-4 justify-center">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
