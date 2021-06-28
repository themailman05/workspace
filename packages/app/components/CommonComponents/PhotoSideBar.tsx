import { BeneficiaryApplication } from '@popcorn/utils';

export default function PhotoSideBar(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <div className="col-span-2 space-y-4">
      <p className="text-2xl text-black sm:text-4xl lg:text-5xl">Photos</p>
      {beneficiary?.files?.additionalImages?.map((photoURL) => {
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
