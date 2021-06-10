import BeneficiaryGrid from 'components/BeneficiaryGrid';

import { beneficiaryProposalFixtures } from 'fixtures/beneficiaryProposals';


export default function BeneficiaryPageWrapper(): JSX.Element {
  return (
    <BeneficiaryGrid
      isProposal={true}
      cardProps={beneficiaryProposalFixtures}
    />
  );
}
