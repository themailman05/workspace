
import { DummyBeneficiaryProposal } from '../pages/beneficiary-proposals/interfaces';

export default function ImageHeader(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {

  return (
    <div className="py-48 px-4 bg-gray-900 sm:px-6 lg:px-8 lg:pt-20 mb-8">
        <div className="text-center">
          <p className="mb-10 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            {beneficiaryProposal.name}
          </p>
          <div className="w-2/3 mx-auto relative">
            <img
              className="object-cover shadow-lg rounded-lg w-full"
              src={beneficiaryProposal.headerImageURL}
              alt=""
            />
            <img
              className="absolute -bottom-32 left-10 shadow-lg rounded-full h-60 border-black "
              src={beneficiaryProposal.profileImageURL}
              alt=""
            />
          </div>
        </div>
      </div>
  );
}
