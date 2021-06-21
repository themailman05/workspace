import { BeneficiaryProposal } from 'interfaces/beneficiaries';
import CurrentStandings from '../CurrentStandings';

interface CompletedVotingProps {
  displayData: BeneficiaryProposal;
  isTakedown?: boolean;
}

export default function CompletedVoting({
  displayData,
  isTakedown = false,
}: CompletedVotingProps): JSX.Element {
  return (
    <div className="content-center mx-48">
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-2/3 justify-self-center flex flex-row justify-between">
          {displayData?.votesFor > displayData?.votesAgainst ? (
            <div>
              <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
                {isTakedown
                  ? 'The beneficiary takedown proposal passed.'
                  : 'Beneficiary passed nomination proposal process.'}
              </p>
              <p className="mb-4 text-base font-medium text-gray-900 text-center">
                {isTakedown
                  ? 'It is now ineligible to receive grants.'
                  : 'It is now eligible to receive grants.'}
              </p>
            </div>
          ) : (
            <div>
              <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
                {isTakedown
                  ? 'Beneficiary did not pass the takedown proposal process.'
                  : 'Beneficiary did not pass nomination proposal process.'}
              </p>
              <p className="mb-4 text-base font-medium text-gray-900 text-center">
                {isTakedown
                  ? 'It remains eligible to receive grants.'
                  : 'It is ineligible to receive grants.'}
              </p>
            </div>
          )}
        </span>
      </div>
      {displayData && <CurrentStandings {...displayData} />}
    </div>
  );
}
