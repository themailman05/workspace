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

export interface BeneficiaryApplication {
  organizationName: string;
  missionStatement: string;
  beneficiaryAddress: string;
  files: {
    profileImage: string;
    headerImage?: string;
    impactReports?: string[];
    additionalImages?: string[];
  };
  links: {
    twitterUrl?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    githubUrl?: string;
    proofOfOwnership?: string;
  };
}

export interface Proposal {
  id: string;
  status: Status;
  stageDeadline: Date;
  application: BeneficiaryApplication;
  votes: {
    for: BigNumber;
    against: BigNumber;
  };
}
