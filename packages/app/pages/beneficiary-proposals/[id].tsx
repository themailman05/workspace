import ProposalPage from 'components/Proposals/ProposalPage';
import { ContractsContext } from 'context/Web3/contracts';
import { Proposal } from 'interfaces/interfaces';
import router from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getProposal } from 'utils/getProposals';

export default function SingleProposalPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [proposal, setProposal] = useState<Proposal>();
  useEffect(() => {
    if (contracts) {
      getProposal(contracts, router.query.id as string).then((res) =>
        setProposal(res),
      );
    }
  }, [contracts]);
  return <ProposalPage proposal={proposal} proposalType={0} />;
}
