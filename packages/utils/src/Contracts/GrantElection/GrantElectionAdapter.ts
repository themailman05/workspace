import {utils} from "ethers";

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
}

export interface ElectionMetadata {
  votes: Vote[];
  electionTerm: ElectionTerm;
  registeredBeneficiaries: string[];
  electionState: ElectionState;
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

export const GrantElectionAdapter = (contract?) => {
  return {
    electionDefaults: async (grantTerm) => {
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

    getElectionMetadata: async (grantTerm): Promise<ElectionMetadata> => {
      const mapping = [
        [
          'votes',
          (value) =>
            value.reduce(
              (votes, v, i) => [...votes, {
                  voter: v[0],
                  beneficiary: v[1],
                  weight: v[2],
                }],
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
      return (await contract.getElectionMetadata(grantTerm)).reduce(
        (metadata, value, i) => {
          metadata[mapping[i][0] as string] = (mapping[i][1] as any)(value);
          return metadata;
        },
        {},
      ) as ElectionMetadata;
    },
    isActive: (election: ElectionMetadata): boolean => {
      return [ElectionState.Registration, ElectionState.Voting].includes(election.electionState) 
    }
  };
};
export default GrantElectionAdapter;