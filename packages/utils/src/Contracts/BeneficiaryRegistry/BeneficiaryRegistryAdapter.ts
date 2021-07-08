import { BeneficiaryRegistry } from '@popcorn/contracts/typechain';
import { BeneficiaryApplication, BeneficiaryMap } from '../../';
import { IIpfsClient } from '../../IpfsClient/IpfsClient';

export const BeneficiaryRegistryAdapter = (
  contract: BeneficiaryRegistry,
  IpfsClient: () => IIpfsClient,
) => {
  return {
    getBeneficiaryApplication: async (
      id: string,
    ): Promise<BeneficiaryApplication> => {
      const cid = await contract.getBeneficiary(id);
      const beneficiaryApplication = await IpfsClient().get(cid);
      return beneficiaryApplication;
    },
    getBeneficiaryApplicationMap: async (
      addresses: string[],
    ): Promise<BeneficiaryMap[]> => {
      return await Promise.all(
        addresses.map(async (address) => {
          const cid = await contract.getBeneficiary(address);
          const beneficiaryApplication = await IpfsClient().get(cid);
          return { address, beneficiaryApplication };
        }),
      );
    },
    getAllBeneficiaryApplications: async (): Promise<
      BeneficiaryApplication[]
    > => {
      const beneficiaryAddresses = await contract.getBeneficiaryList();
      const ipfsHashes = await Promise.all(
        beneficiaryAddresses.map(async (address) => {
          return contract.getBeneficiary(address);
        }),
      );
      const beneficiaryData = await (
        await Promise.all(
          ipfsHashes.map(async (cid) => await IpfsClient().get(cid)),
        )
      ).map((beneficiaryApplication) => {
        // TODO: Remove temporary address assignment
        beneficiaryApplication.beneficiaryAddress = beneficiaryAddresses[0];
        return beneficiaryApplication;
      });
      return beneficiaryData;
    },
  };
};
