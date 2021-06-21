import { Beneficiary } from 'interfaces/beneficiaries';
import { BeneficiaryProposal } from 'interfaces/proposals';

export default function PhotoSideBar(
  displayData: Beneficiary | BeneficiaryProposal,
): JSX.Element {
  return (
    <div className="col-span-2 space-y-4">
      <p className="text-2xl text-black sm:text-4xl lg:text-5xl">Photos</p>
      {displayData?.additionalImages?.map((photoURL) => {
        return (
          <img
            className="w-full"
            src={`${process.env.IPFS_URL}${photoURL}`}
            alt=""
          />
        );
      })}
    </div>
  );
}
