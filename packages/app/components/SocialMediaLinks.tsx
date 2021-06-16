import {
  Beneficiary,
  BeneficiaryCardProps,
  DummyBeneficiaryProposal,
} from '../interfaces/beneficiaries';
import * as Icon from 'react-feather';

// TODO: Limit social media links to contents of beneficiaryProposal once we link to contracts

export default function SocialMediaLinks(
  displayData: Beneficiary | DummyBeneficiaryProposal | BeneficiaryCardProps,
): JSX.Element {
  return (
    <>
      <a
        href={`https://${displayData?.twitterUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Twitter aria-hidden="true" />
      </a>
      <a
        href={`https://${displayData?.facebookUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Facebook aria-hidden="true" />
      </a>
      <a
        href={`https://${displayData?.instagramUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Instagram aria-hidden="true" />
      </a>
      <a
        href={`https://${displayData?.githubUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.GitHub aria-hidden="true" />
      </a>
      <a
        href={`https://${displayData?.linkedinUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Linkedin aria-hidden="true" />
      </a>
    </>
  );
}
