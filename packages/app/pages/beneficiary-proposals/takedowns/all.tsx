import BeneficiaryGrid from 'components/BeneficiaryGrid';

import { beneficiaryProposalFixtures } from 'fixtures/beneficiaryProposals';

export default function BeneficiaryPageWrapper(): JSX.Element {
  return (
    <BeneficiaryGrid
      title={'Takedown Proposals'}
      subtitle={
        'Takedowns have been triggered againt the following beneficiaries. Browse and vote in takedown elections.'
      }
      isProposal={true}
      cardProps={beneficiaryProposalFixtures}
    />
  );
}
