import BeneficiaryGrid from 'components/Beneficiaries/BeneficiaryGrid';
import { BeneficiaryApplication } from 'interfaces/interfaces';
import { useContext, useEffect, useState } from 'react';
import { IpfsClient } from 'utils/IpfsClient';
import { ContractsContext } from '../../context/Web3/contracts';

export default function BeneficiaryPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryApplication[]>(
    [],
  );

  async function getBeneficiaries() {
    const beneficiaryAddresses =
      await contracts.beneficiary.getBeneficiaryList();
    const ipfsHashes = await Promise.all(
      beneficiaryAddresses.map(async (address) => {
        return contracts.beneficiary.getBeneficiary(address);
      }),
    );
    const beneficiaryData = await (
      await Promise.all(
        ipfsHashes.map(async (cid) => await IpfsClient().get(cid)),
      )
    ).map((beneficiaryApplication) => {
      // TODO: Remove temporary address assignment
      beneficiaryApplication.beneficiaryAddress = beneficiaryAddresses[0];
      return beneficiaryApplication;
    });
    setBeneficiaries(beneficiaryData);
  }

  useEffect(() => {
    if (contracts) {
      getBeneficiaries();
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
