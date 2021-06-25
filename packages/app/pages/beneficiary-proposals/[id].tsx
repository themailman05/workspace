import ProposalPage from 'components/Proposals/ProposalPage';
import { ContractsContext } from 'context/Web3/contracts';
import { Proposal } from 'interfaces/interfaces';
import { useContext, useEffect, useState } from 'react';
import { IpfsClient } from 'utils/IpfsClient';
import { ProposalAdapter } from 'utils/ProposalAdapter';

export default function SingleProposalPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [proposal, setProposal] = useState<Proposal>();
  const [proposalId, setProposalId] = useState<string>('');
  useEffect(() => {
    setProposalId(window.location.pathname.split('/').pop());
  }, []);
  useEffect(() => {
    if (contracts) {
      ProposalAdapter(contracts.beneficiaryGovernance, IpfsClient)
        .getProposal(proposalId)
        .then((res) => setProposal(res));
    }
  }, [contracts]);
  return <ProposalPage {...proposal} />;
}
