import { useContext, useEffect, useState } from 'react';
import ProposalGrid from 'components/Proposals/ProposalGrid';
import { ContractsContext } from 'context/Web3/contracts';
import { Proposal } from 'interfaces/interfaces';
import { IpfsClient } from 'utils/IpfsClient';
import { ProposalAdapter } from 'utils/ProposalAdapter';

export default function BeneficiaryProposalPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  useEffect(() => {
    if (contracts) {
      ProposalAdapter(contracts.beneficiaryGovernance, IpfsClient)
        .getProposals(0)
        .then((res) => setProposals(res));
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
