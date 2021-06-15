import BeneficiaryPage from 'components/BeneficiaryPage';
import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import {getIpfsHashFromBytes32} from "@popcorn/utils/ipfsHashManipulation";

export default function BeneficiaryProposalPageWrapper(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [proposal, setProposal] = useState();

  //Where does this proposal get stored?
  async function getProposal() {
    const ipfsHash = await contracts.beneficiary.getBeneficiary(
      router.query.id as string,
    );
    console.log(ipfsHash)
    const ipfsData = await fetch(
      `${process.env.IPFS_URL}${getIpfsHashFromBytes32(ipfsHash)}`,
    ).then((response) => response.json());

    console.log(ipfsData)
    setProposal(ipfsData);
  }

  useEffect(() => {
    if (contracts) {
      getProposal();
    }
  }, [contracts]);

  console.log(proposal)
  return <BeneficiaryPage isProposal={true} />;
}
