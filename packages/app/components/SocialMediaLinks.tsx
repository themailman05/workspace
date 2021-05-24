import { DummyBeneficiaryProposal } from '../pages/beneficiary-proposals/interfaces';
import { social } from '../fixtures/social';

// TODO: Limit social media links to contents of beneficiaryProposal

export default function SocialMediaLinks(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {
  return (
    <div>
      <p className="text-3xl text-black py-4">Social Media</p>
      <div className="flex space-x-6 my-4">
        {social.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">{item.name}</span>
            <item.icon className="h-6 w-6" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
