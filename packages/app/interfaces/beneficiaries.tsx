export interface Beneficiary {
  name: string;
  missionStatement: string;
  ethereumAddress: string;
  profileImage: string;
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
