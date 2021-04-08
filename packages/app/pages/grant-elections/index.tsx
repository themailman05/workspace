import { LandingPage } from 'components/Grants/LandingPage';


export interface IGrantRoundFilter {
  active: boolean;
  closed: boolean;
}

export interface IVote {
  address: string;
  votes: number;
}

export interface IElectionVotes {
  votes: IVote[];
}

export default function GrantOverview() {
 return <LandingPage></LandingPage>
}