import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { Beneficiary } from 'interfaces/beneficiaries';
import BeneficiaryPage from 'components/Beneficiaries/BeneficiaryPage';

export default function SingleBeneficiaryPage(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [benefeciary, setBeneficiary] = useState<Beneficiary>();

  async function getBeneficiary() {
    const ipfsHash = await contracts.beneficiary.getBeneficiary(
      router.query.id as string,
    );
    const ipfsData = await fetch(
      `${process.env.IPFS_URL}${getIpfsHashFromBytes32(ipfsHash)}`,
    ).then((response) => response.json());
    setBeneficiary(ipfsData);
  }

  useEffect(() => {
    if (contracts) {
      getBeneficiary();
    }
  }, [contracts]);

  return (
    <BeneficiaryPage
      beneficiary={benefeciary}
    />
  );
}
