import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import BeneficiaryPage from 'components/Beneficiaries/BeneficiaryPage';
import { BeneficiaryApplication } from '../../interfaces/interfaces';
import { IpfsClient } from 'utils/IpfsClient';
export default function SingleBeneficiaryPage(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [benefeciary, setBeneficiary] = useState<BeneficiaryApplication>();

  async function getBeneficiary() {
    const ipfsHash = await contracts.beneficiary.getBeneficiary(
      router.query.id as string,
    );
    const beneficiaryApplication = await IpfsClient().get(ipfsHash);
    setBeneficiary(beneficiaryApplication);
  }

  useEffect(() => {
    if (contracts) {
      getBeneficiary();
    }
  }, [contracts]);

  return <BeneficiaryPage beneficiary={benefeciary} />;
}
