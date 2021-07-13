import axios from 'axios';
import { BeneficiaryApplication } from '../';
import { getIpfsHashFromBytes32 } from '../ipfsHashManipulation';

export interface IIpfsClient {
  get: (cid: string) => Promise<BeneficiaryApplication>;
  add: (beneficiaryApplication: BeneficiaryApplication) => Promise<string>;
  uploadFile: (file: File) => Promise<string>;
}

export const IpfsClient = (): IIpfsClient => {
  return {
    get: async (cid: string): Promise<BeneficiaryApplication> => {
      const beneficiaryApplication: BeneficiaryApplication = await fetch(
        `${process.env.IPFS_URL}${getIpfsHashFromBytes32(cid)}`,
      ).then((response) => response.json());
      return beneficiaryApplication;
    },

    add: async (
      beneficiaryApplication: BeneficiaryApplication,
    ): Promise<string> => {
      var myHeaders = new Headers();
      myHeaders.append('pinata_api_key', process.env.PINATA_API_KEY);
      myHeaders.append('pinata_secret_api_key', process.env.PINATA_API_SECRET);
      myHeaders.append('Content-Type', 'application/json');
      var raw = JSON.stringify(beneficiaryApplication);
      const cid = await fetch(process.env.IPFS_GATEWAY_PIN, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      })
        .then((response) => response.text())
        .then((result) => {
          return JSON.parse(result).IpfsHash;
        })
        .catch((error) => {
          console.error(error);
        });
      return cid;
    },

    uploadFile: async (file: File): Promise<string> => {
      var headers = new Headers();
      headers.append('pinata_api_key', process.env.PINATA_API_KEY);
      headers.append('pinata_secret_api_key', process.env.PINATA_API_SECRET);
      var data = new FormData();
      data.append('file', file, file.name); // TODO: Source from filename
      var config = {
        headers,
      };
      const uploadHash = axios
        .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, config)
        .then((result) => {
          const hash = result.data.IpfsHash;
          return hash;
        })
        .catch((error) => {
          console.error(error);
          return error;
        });
      return uploadHash;
    },
  };
};
