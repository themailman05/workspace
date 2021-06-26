import ProposalGrid from 'components/Proposals/ProposalGrid';
import { ProposalType } from 'interfaces/interfaces';

export default function TakedownPage(): JSX.Element {
  return <ProposalGrid proposalType={ProposalType.Nomination} />;
}
