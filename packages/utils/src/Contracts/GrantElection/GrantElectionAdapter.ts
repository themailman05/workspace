import { utils } from 'ethers';

export enum ElectionTerm {
  Monthly,
  Quarterly,
  Yearly,
}
export enum ElectionState {
  Registration,
  Voting,
  Closed,
}
interface Vote {
  voter: string;
  beneficiary: string;
  weight: number;
}

export const ElectionTermIntToName = {
  0: 'monthly',
  1: 'quarterly',
  2: 'yearly',
};

export interface ElectionMetadata {
  votes: Vote[];
  electionTerm: ElectionTerm;
  registeredBeneficiaries: string[];
  electionState: ElectionState;
  electionStateStringShort: string;
  electionStateStringLong: string;
  configuration: {
    awardees: number;
    ranking: number;
  };
  useChainlinkVRF: boolean;
  periods: {
    cooldownPeriod: number;
    registrationPeriod: number;
    votingPeriod: number;
  };
  startTime: number;
  registrationBondRequired: boolean;
  registrationBond: object;
}

export type ElectionPeriod = 'voting' | 'registration' | 'closed' | 'finalized';

export const GrantElectionAdapter = function (contract?) {
  return {
    electionDefaults: async function (grantTerm) {
      const response = await contract.electionDefaults(grantTerm);
      return {
        useChainLinkVRF: response.useChainLinkVRF,
        ranking: response.ranking,
        awardees: response.awardees,
        registrationPeriod: response.registrationPeriod.toNumber(),
        votingPeriod: response.votingPeriod.toNumber(),
        cooldownPeriod: response.cooldownPeriod.toNumber(),
        registrationBondRequired: response.registrationBondRequired,
        registrationBond: response.registrationBond,
      };
    },

    getElectionStateStringShort: function (
      electionState: ElectionState,
    ): 'voting' | 'registration' | 'closed' | 'finalized' {
      return ['voting', 'registration', 'closed', 'finalized'][
        electionState
      ] as ElectionPeriod;
    },

    getElectionStateStringLong: function(grantTerm): string {
      const period = this.getElectionStateStringShort(grantTerm) as ElectionPeriod
      switch(period) {
        case "registration":
          return "open for registration";
        case "voting":
          return "open for voting";
        case "closed":
        case "finalized":
          return "closed";
        default:
          return "";
      }
    },

    getElectionMetadata: async function (grantTerm): Promise<ElectionMetadata> {
      const mapping = [
        [
          'votes',
          (value) =>
            value.reduce(
              (votes, v, i) => [
                ...votes,
                {
                  voter: v[0],
                  beneficiary: v[1],
                  weight: v[2],
                },
              ],
              [],
            ),
        ],
        ['electionTerm', (value) => value],
        ['registeredBeneficiaries', (value) => value],
        ['electionState', (value) => value],
        [
          'configuration',
          (value) => ({ awardees: value[0], ranking: value[1] }),
        ],
        ['useChainlinkVRF', (value) => value],
        [
          'periods',
          (value) => ({
            cooldownPeriod: value[0].toNumber(),
            registrationPeriod: value[1].toNumber(),
            votingPeriod: value[2].toNumber(),
          }),
        ],
        ['startTime', (value) => value.toNumber()],
        ['registrationBondRequired', (value) => value],
        ['registrationBond', (value) => value],
      ];
      const metadata = (await contract.getElectionMetadata(grantTerm)).reduce(
        (metadata, value, i) => {
          metadata[mapping[i][0] as string] = (mapping[i][1] as any)(value);
          return metadata;
        },
        {},
      ) as ElectionMetadata;
      metadata.electionStateStringShort = this.getElectionStateStringShort(metadata.electionState);
      metadata.electionStateStringLong = this.getElectionStateStringLong(metadata.electionState);
      return metadata;
    },
    isActive: function (election: ElectionMetadata): boolean {
      return [ElectionState.Registration, ElectionState.Voting].includes(
        election.electionState,
      );
    },
  };
};
export default GrantElectionAdapter;
