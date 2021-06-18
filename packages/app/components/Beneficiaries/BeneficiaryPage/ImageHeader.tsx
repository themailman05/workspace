import { Beneficiary, BeneficiaryProposal } from "interfaces/beneficiaries";

export default function ImageHeader(
  displayData: Beneficiary | BeneficiaryProposal,
): JSX.Element {
  return (
    <div className="py-48 px-4 bg-gray-900 sm:px-6 lg:px-8 lg:pt-20 mb-8">
      <div className="text-center">
        <p className="mb-10 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          {displayData?.name}
        </p>
        <div className="w-2/3 mx-auto relative">
          <img
            className="object-cover shadow-lg rounded-lg w-full"
            src={`${process.env.IPFS_URL}${displayData?.headerImage}`}
            alt="header image"
          />
          <div
            className="absolute -bottom-32 left-10 shadow-lg rounded-full h-60 w-60 border-black "
            style={{
              backgroundImage: `url(${process.env.IPFS_URL}${displayData?.profileImage})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>
    </div>
  );
}
