import {
  Beneficiary,
  BeneficiaryProposal,
} from 'interfaces/beneficiaries';
import SocialMediaLinks from './SocialMediaLinks';

export default function SocialMedia(
  displayData: Beneficiary | BeneficiaryProposal,
): JSX.Element {
  return (
    <>
      <p className="text-3xl text-black py-4">Social Media</p>
      <div className="flex space-x-6 my-4">
        <SocialMediaLinks {...displayData} />
      </div>
    </>
  );
}
