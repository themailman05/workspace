import { BigNumber } from 'ethers';

export enum Status {
  Open,
  Challenge,
  Completed,
  Passed,
  Failed,
  All,
}

export enum ProposalType {
  Nomination,
  Takedown,
}
export interface Proposal {
  name: string;
  missionStatement: string;
  ethereumAddress: string;
  profileImage: string;
  votesFor: BigNumber;
  votesAgainst: BigNumber;
  status: Status;
  stageDeadline: Date;
  id: string;
  headerImage?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
  impactReports?: string[];
  additionalImages?: string[];
  proofOfOwnership?: string;
}
