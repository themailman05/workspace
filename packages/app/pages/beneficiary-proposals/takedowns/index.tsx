import BeneficiaryGrid from 'components/Beneficiaries/BeneficiaryGrid';
import { ContractsContext } from 'context/Web3/contracts';
import { BaseBeneficiary } from 'interfaces/beneficiaries';
import { useContext, useEffect, useState } from 'react';
import { getProposals } from 'utils/getProposals';

export default function TakedownPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [takedownProposals, setTakedownProposals] = useState<
    BaseBeneficiary[]
  >([]);

  useEffect(() => {
    if (contracts) {
      getProposals(contracts, true).then((res) => setTakedownProposals(res));
    }
  }, [contracts]);

  return (
    <BeneficiaryGrid
      title={'Takedown Proposals'}
      subtitle={
        'Takedowns have been triggered against the following beneficiaries. Browse and vote in takedown elections.'
      }
      cardProps={takedownProposals}
      isProposal
      isTakedown
    />
  );
}
