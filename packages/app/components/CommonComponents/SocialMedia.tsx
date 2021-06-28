import { BeneficiaryApplication } from '@popcorn/utils';
import SocialMediaLinks from './SocialMediaLinks';

export default function SocialMedia(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <>
      <p className="text-3xl text-black py-4">Social Media</p>
      <div className="flex space-x-6 my-4">
        <SocialMediaLinks {...beneficiary} />
      </div>
    </>
  );
}
