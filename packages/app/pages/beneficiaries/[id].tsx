import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import BeneficiaryPage from 'components/Beneficiaries/BeneficiaryPage';
import { BeneficiaryApplication } from '../../interfaces/interfaces';
import { IpfsClient } from 'utils/IpfsClient';
import { BeneficiaryAdapter } from 'utils/BeneficiaryAdapter';
export default function SingleBeneficiaryPage(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [benefeciary, setBeneficiary] = useState<BeneficiaryApplication>();

  useEffect(() => {
    if (contracts) {
      BeneficiaryAdapter(contracts.beneficiary, IpfsClient)
        .getBeneficiaryApplication(router.query.id as string)
        .then((beneficiaryApplication) =>
          setBeneficiary(beneficiaryApplication),
        );
    }
  }, [contracts]);

  return <BeneficiaryPage beneficiary={benefeciary} />;
}
