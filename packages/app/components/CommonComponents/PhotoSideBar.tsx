import { BeneficiaryApplication } from '@popcorn/utils';

export default function PhotoSideBar(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <div className="col-span-2 space-y-4">
      <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Photos</h3>
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
