export interface BaseBeneficiary {
  name: string;
  missionStatement: string;
  ethereumAddress: string;
  profileImage: string;
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
