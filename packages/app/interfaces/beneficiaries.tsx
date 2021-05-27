// Temporary storehouse for interfaces.
// TODO: Refer to TS definition files once contracts are finalised
// TODO: Improve social media links - change

export type Stage = 'All' | 'Open' | 'Challenge' | 'Closed';

export interface DummyBeneficiaryProposal {
  name: string;
  missionStatement: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
  dribbleUrl?: string;
  ethereumAddress: string;
  profileImageURL: string;
  headerImageURL: string;
  photoURLs?: string[];
  impactReports?: string[];
  votesFor: number;
  votesAgainst: number;
  currentStage: Stage;
  stageDeadline: Date;
  proofOfOwnership: string;
}
