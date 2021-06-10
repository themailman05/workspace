import BeneficiaryPage from 'components/BeneficiaryPage';
import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';

export default function BeneficiaryPageWrapper(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [benefeciary, setBeneficiary] = useState();

  async function getBeneficiary() {
    const ipfsHash = await contracts.beneficiary.getBeneficiary(
      router.query.id as string,
    );
    console.log(ipfsHash)
    const ipfsData = await fetch(
      `${process.env.IPFS_URL}${getIpfsHashFromBytes32(ipfsHash)}`,
    ).then((response) => response.json());

    console.log(ipfsData)
    setBeneficiary(ipfsData);
  }

  useEffect(() => {
    if (contracts) {
      getBeneficiary();
    }
  }, [contracts]);

  console.log(benefeciary)

  return <BeneficiaryPage isProposal={false} />;
}
