import { BeneficiaryApplication } from '@popcorn/utils';

export default function ImageHeader(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <div className="relative bg-indigo-800">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src={`${process.env.IPFS_URL}${beneficiary?.files?.headerImage}`}
          alt=""
        />
        <div
          className="absolute inset-0 bg-indigo-800 mix-blend-multiply"
          aria-hidden="true"
        />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {beneficiary?.organizationName}
        </h1>
        <div
          className="absolute -bottom-32 left-10 shadow-lg rounded-full h-60 w-60 border-black "
          style={{
            backgroundImage: `url(${process.env.IPFS_URL}${beneficiary?.files?.profileImage})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
    </div>
  );
}
