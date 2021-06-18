import { LandingPage } from 'components/Grants/LandingPage';

export interface IGrantRoundFilter {
  active: boolean;
  closed: boolean;
}

export interface Vote {
  address: string;
  votes: number;
}

export interface IElectionVotes {
  votes: Vote[];
}

export default function GrantOverview() {
  return <LandingPage></LandingPage>;
}
