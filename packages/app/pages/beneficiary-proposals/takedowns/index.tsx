import { useContext, useEffect, useState } from 'react';
import ProposalGrid from 'components/Proposals/ProposalGrid';
import { ContractsContext } from 'context/Web3/contracts';
import { Proposal } from 'interfaces/interfaces';
import { getProposals } from 'utils/getProposals';

export default function TakedownPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [takedownProposals, setTakedownProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (contracts) {
      getProposals(contracts, 1).then((res) => setTakedownProposals(res));
    }
  }, [contracts]);

  return (
    <ProposalGrid
      title={'Takedown Proposals'}
      subtitle={
        'Takedowns have been triggered against the following beneficiaries. Browse and vote in takedown elections.'
      }
      proposals={takedownProposals}
      proposalType={1}
    />
  );
}
