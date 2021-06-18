// Temporary storehouse for interfaces.
// TODO: Refer to TS definition files once contracts are finalised
// TODO: Improve social media links - change

import { BigNumber } from 'ethers';

export enum Status {
  Open,
  Challenge,
  Completed,
  Passed,
  Failed,
  All,
}

export interface BaseBeneficiary {
  name: string;
  missionStatement: string;
  ethereumAddress: string;
  profileImage: string;
}

export interface BaseProposal extends BaseBeneficiary {
  votesFor: BigNumber;
  votesAgainst: BigNumber;
  status: Status;
  stageDeadline: Date;
}

export interface BeneficiaryProposal extends BaseProposal {
  headerImage: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
  impactReports?: string[];
  additionalImages?: string[];
  proofOfOwnership: string;
}

export interface Beneficiary extends BaseBeneficiary {
  headerImage: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
  additionalImages?: string[];
  impactReports?: string[];
  proofOfOwnership: string;
}
