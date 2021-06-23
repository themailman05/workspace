module.exports = {
  GrantElectionAdapter: (contract) => {
    return {
      electionDefaults: async (electionId) => {
        const response = await contract.electionDefaults(electionId);
        return {
          useChainLinkVRF: response.useChainLinkVRF,
          ranking: response.ranking,
          awardees: response.awardees,
          registrationPeriod: response.registrationPeriod.toNumber(),
          votingPeriod: response.votingPeriod.toNumber(),
          cooldownPeriod: response.cooldownPeriod.toNumber(),
          registrationBondRequired: response.bondRequirements.registrationBondRequired,
          registrationBond: response.bondRequirements.registrationBond,
          finalizationIncentive:response.finalizationIncentive.toNumber(),
          enabled:response.enabled,
          shareType:response.shareType
        }
      },

      getElectionMetadata: async (electionId) => {
        /**
        * returns a nice object like:
        * {
          electionTerm: GRANT_TERM.QUARTER,
          registeredBeneficiaries: [],
          electionState: ElectionState.Registration,
          configuration: {
            awardees: 2,
            ranking: 5
          },
          useChainlinkVRF: true,
          periods: {
            cooldownPeriod: 83 * 86400, // 83 days
            registrationPeriod: 14 * 86400, // 14 days
            votingPeriod: 14 * 86400, // 14 days
          },
          startTime: 1625097601,
        }
       */
        const mapping = [
          ["votes", (value) => value.reduce(
              (votes, v, i) => [...votes, {
                  voter: v[0],
                  beneficiary: v[1],
                  weight: v[2].toNumber(),
                }],
              [],
            )
          ],
          ["electionTerm", (value) => value],
          ["registeredBeneficiaries", (value) => value],
          ["electionState", (value) => value],
          [
            "configuration",
            (value) => ({ awardees: value[0], ranking: value[1] }),
          ],
          ["useChainlinkVRF", (value) => value],
          [
            "periods",
            (value) => ({
              cooldownPeriod: value[0].toNumber(),
              registrationPeriod: value[1].toNumber(),
              votingPeriod: value[2].toNumber(),
            }),
          ],
          ["startTime", (value) => value.toNumber()],
          [
            'bondRequirements',
            (value) => ({ required: value[0], amount: value[1] }),
          ],
          ['shareType', (value) => value],
          ['randomNumber', (value) => value.toNumber()],
        ];
        return (await contract.getElectionMetadata(electionId)).reduce(
          (metadata, value, i) => {
            metadata[mapping[i][0]] = mapping[i][1](value);
            return metadata;
          },
          {}
        );
      },
    };
  },
};
