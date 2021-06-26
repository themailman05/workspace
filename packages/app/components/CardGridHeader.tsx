import { ProposalType } from 'interfaces/interfaces';

export default function CardGridHeader(
  proposalType: ProposalType,
): JSX.Element {
  return (
    <div className="pt-12 px-4 bg-indigo-200 sm:px-6 lg:px-8 lg:pt-20 py-20">
      <div className="text-center">
        <p className="mt-2 text-3xl text-indigo-900 sm:text-4xl lg:text-5xl">
          {proposalType === ProposalType.Nomination
            ? 'Eligible Beneficiaries'
            : 'Takedown Proposals'}
        </p>
        <p className="mt-3 max-w-4xl mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
          {proposalType === ProposalType.Nomination
            ? 'You choose which social initiatives are included in grant elections. Browse and vote on beneficiary nominations.'
            : 'Takedowns have been triggered against the following beneficiaries. Browse and vote in takedown elections.'}
        </p>
      </div>
    </div>
  );
}
