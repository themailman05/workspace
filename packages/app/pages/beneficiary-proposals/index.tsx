import ProposalGrid from 'components/Proposals/ProposalGrid';
import { ContractsContext } from 'context/Web3/contracts';
import { Proposal } from 'interfaces/interfaces';
import { useContext, useEffect, useState } from 'react';
import { getProposals } from 'utils/getProposals';

export default function BeneficiaryProposalPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (contracts) {
      getProposals(contracts, 0).then((res) => setProposals(res));
    }
  }, [contracts]);

  return (
    <ProposalGrid
      title={'Eligible Beneficiaries'}
      subtitle={
        'You choose which social initiatives are included in grant elections. Browse and vote on beneficiary nominations'
      }
      proposals={proposals}
      proposalType={0}
    />
  );
}
