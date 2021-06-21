import ProposalGrid from 'components/Proposals/ProposalGrid';
import { ContractsContext } from 'context/Web3/contracts';
import { BaseProposal } from 'interfaces/proposals';

import { useContext, useEffect, useState } from 'react';
import { getProposals } from 'utils/getProposals';

export default function TakedownPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [takedownProposals, setTakedownProposals] = useState<BaseProposal[]>(
    [],
  );

  useEffect(() => {
    if (contracts) {
      getProposals(contracts, true).then((res) => setTakedownProposals(res));
    }
  }, [contracts]);

  return (
    <ProposalGrid
      title={'Takedown Proposals'}
      subtitle={
        'Takedowns have been triggered against the following beneficiaries. Browse and vote in takedown elections.'
      }
      cardProps={takedownProposals}
      isTakedown={true}
    />
  );
}
