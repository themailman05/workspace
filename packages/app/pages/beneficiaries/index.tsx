import BeneficiaryGrid from 'components/Beneficiaries/BeneficiaryGrid';
import { BeneficiaryApplication } from 'interfaces/interfaces';
import { useContext, useEffect, useState } from 'react';
import { BeneficiaryAdapter } from 'utils/BeneficiaryAdapter';
import { IpfsClient } from 'utils/IpfsClient';
import { ContractsContext } from '../../context/Web3/contracts';

export default function BeneficiaryPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryApplication[]>(
    [],
  );

  useEffect(() => {
    if (contracts) {
      BeneficiaryAdapter(contracts.beneficiary, IpfsClient)
        .getAllBeneficiaryApplications()
        .then((beneficiaries) => setBeneficiaries(beneficiaries));
    }
  }, [contracts]);

  return (
    <BeneficiaryGrid
      title={'Eligible Beneficiaries'}
      subtitle={
        'Beneficiary organizations that have passed the voting process and are eligible to receive grants'
      }
      beneficiaries={beneficiaries}
    />
  );
}
