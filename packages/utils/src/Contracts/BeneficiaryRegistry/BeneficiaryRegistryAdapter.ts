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
    getAllBeneficiaryApplicationMap: async (): Promise<BeneficiaryMap[]> => {
      const beneficiaryAddresses = await contract.getBeneficiaryList();
      return await Promise.all(
        beneficiaryAddresses.map(async (address) => {
          const cid = await contract.getBeneficiary(address);
          const beneficiaryApplication = await IpfsClient().get(cid);
          return { address, beneficiaryApplication };
        }),
      );
    },
  };
};
