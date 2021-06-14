// Temporary storehouse for interfaces.
// TODO: Refer to TS definition files once contracts are finalised
// TODO: Improve social media links - change

import { BigNumber } from "ethers";

export enum Status {
  Open=0,
  Challenge=1,
  Completed=2,
  Passed=3,
  Failed=4,
  All=5,
}

export interface BeneficiaryCardProps {
  name: string;
  missionStatement: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
  ethereumAddress: string;
  profileImage: string;
}

export interface ProposalCardProps extends BeneficiaryCardProps {
  votesFor: BigNumber;
  votesAgainst: BigNumber;
  status: Status;
  stageDeadline: Date;
}

export interface DummyBeneficiaryProposal extends ProposalCardProps {
  headerImageURL: string;
  photoURLs?: string[];
  impactReports?: string[];
}

export interface Beneficiary extends BeneficiaryCardProps{
  headerImage: string;
  additionalImages?: string[];
  impactReports?: string[];
  proofOfOwnership: string;
}