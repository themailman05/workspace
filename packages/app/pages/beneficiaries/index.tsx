import {
  BeneficiaryMap,
  BeneficiaryRegistryAdapter,
  IpfsClient,
} from '@popcorn/utils';
import BeneficiaryGrid from 'components/Beneficiaries/BeneficiaryGrid';
import { ContractsContext } from 'context/Web3/contracts';
import React, { useContext, useEffect, useState } from 'react';

export default function BeneficiaryPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiaryApplicationMap, setBeneficiaryApplicationMap] =
    useState<BeneficiaryMap[]>();
  useEffect(() => {
    if (contracts) {
      BeneficiaryRegistryAdapter(contracts.beneficiary, IpfsClient)
        .getAllBeneficiaryApplicationMap()
        .then((beneficiaryApplicationMap) =>
          setBeneficiaryApplicationMap(beneficiaryApplicationMap),
        );
    }
  }, [contracts]);

  return (
    <BeneficiaryGrid
      title={'Eligible Beneficiaries'}
      subtitle={
        'Beneficiary organizations that have passed the voting process and are eligible to receive grants'
      }
      beneficiaryApplicationMap={beneficiaryApplicationMap}
    />
  );
}
