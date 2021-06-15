// Temporary storehouse for interfaces.
// TODO: Refer to TS definition files once contracts are finalised
// TODO: Improve social media links - change

export type Stage = 'All' | 'Open' | 'Challenge' | 'Closed';

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

export interface Beneficiary extends BeneficiaryCardProps{
  headerImage: string;
  additionalImages?: string[];
  impactReports?: string[];
  proofOfOwnership: string;
}

export interface DummyBeneficiaryProposal extends Beneficiary {
  votesFor: number;
  votesAgainst: number;
  currentStage: Stage;
  stageDeadline: Date;
  proofOfOwnership: string;
}