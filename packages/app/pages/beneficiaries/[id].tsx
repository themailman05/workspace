import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import BeneficiaryPage from 'components/Beneficiaries/BeneficiaryPage';
import { BeneficiaryApplication, IpfsClient, BeneficiaryRegistryAdapter } from '@popcorn/utils/';

export default function SingleBeneficiaryPage(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [benefeciary, setBeneficiary] = useState<BeneficiaryApplication>();

  useEffect(() => {
    if (contracts) {
      BeneficiaryRegistryAdapter(contracts.beneficiary, IpfsClient)
        .getBeneficiaryApplication(router.query.id as string)
        .then((beneficiaryApplication) =>
          setBeneficiary(beneficiaryApplication),
        );
    }
  }, [contracts]);

  return <BeneficiaryPage beneficiary={benefeciary} />;
}
