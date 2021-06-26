import ProposalPage from 'components/Proposals/ProposalPage';
import { ProposalType } from 'interfaces/interfaces';

export default function SingleTakedownPage(): JSX.Element {
  return <ProposalPage proposalType={ProposalType.Nomination} />;
}
