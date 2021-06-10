import { DummyBeneficiaryProposal } from '../interfaces/beneficiaries';
import { social } from '../fixtures/social';
import Link from 'next/link';

// TODO: Limit social media links to contents of beneficiaryProposal once we link to contracts

export default function SocialMediaLinks(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {
  return (
    <div>
      <p className="text-3xl text-black py-4">Social Media</p>
      <div className="flex space-x-6 my-4">
        {social.map((item) => (
          <Link href={item.href}>
            <a
              key={item.name}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon aria-hidden="true" />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
