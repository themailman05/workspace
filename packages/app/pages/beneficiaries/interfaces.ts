// Temporary storehouse for interfaces.
// TODO: Refer to TS definition files once contracts are finalised

export interface DummyBeneficiary {
  name: string;
  missionStatement: string;
  twitterUrl: string;
  linkedinUrl: string;
  ethereumAddress: string;
  profileImageURL: string;
  headerImageURL: string;
  photoURLs?: string[];
  impactReports?: string[];

}