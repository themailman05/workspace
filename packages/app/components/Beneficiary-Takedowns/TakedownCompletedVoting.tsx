import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';
import CurrentStandings from '../Beneficiary-Proposals/CurrentStandings';

export default function CompletedVoting(displayData: DummyBeneficiaryProposal): JSX.Element {
  return (
    <div className="content-center mx-48">
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-2/3 justify-self-center flex flex-row justify-between">
          {displayData.votesFor > displayData.votesAgainst ? (
            <div>
              <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
                The beneficiary takedown proposal passed.
              </p>
              <p className="mb-4 text-base font-medium text-gray-900 text-center">
                It is now ineligible to receive grants.
              </p>
            </div>
          ) : (
            <div>
              <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
                Beneficiary did not pass the takedown proposal process.
              </p>
              <p className="mb-4 text-base font-medium text-gray-900 text-center">
                It remains eligible to receive grants.
              </p>
            </div>
          )}
        </span>
      </div>
      <CurrentStandings {...displayData} />
    </div>
  );
};

