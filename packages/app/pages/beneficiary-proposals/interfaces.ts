// Temporary storehouse for interfaces.
// TODO: Refer to TS definition files once contracts are finalised

export type Stage = "All" | "Open" | "Challenge" | "Closed";

export interface DummyBeneficiaryProposal {
  name: string;
  missionStatement: string;
  twitterUrl: string;
  linkedinUrl: string;
  ethereumAddress: string;
  profileImageURL: string;
  headerImageURL: string;
  photoURLs?: string[];
  impactReports?: string[];
  votes: number;
  currentStage: Stage;
  stageDeadline: Date;
}