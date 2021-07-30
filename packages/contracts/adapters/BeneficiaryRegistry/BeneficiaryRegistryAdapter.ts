import { IIpfsClient } from "@popcorn/utils";
import { BeneficiaryApplication } from "../BeneficiaryGovernance/BeneficiaryGovernanceAdapter";

export const BeneficiaryRegistryAdapter = (
  contract: any,
  IpfsClient: IIpfsClient
) => {
  return {
    getBeneficiaryApplication: async (
      id: string
    ): Promise<BeneficiaryApplication> => {
      const ipfsHash = await contract.getBeneficiary(id);
      const beneficiaryApplication = await IpfsClient.get(ipfsHash);
      return beneficiaryApplication;
    },
    getAllBeneficiaryApplications: async (): Promise<
      BeneficiaryApplication[]
    > => {
      const beneficiaryAddresses = await contract.getBeneficiaryList();
      const ipfsHashes = await Promise.all(
        beneficiaryAddresses.map(async (address) => {
          return contract.getBeneficiary(address);
        })
      );
      return await await Promise.all(
        ipfsHashes.map(async (cid: string) => await IpfsClient.get(cid))
      );
    },
  };
};
