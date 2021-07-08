import { BeneficiaryApplication } from '@popcorn/utils';
import * as Icon from 'react-feather';

// TODO: Limit social media links to contents of beneficiaryProposal once we link to contracts

export default function SocialMediaLinks(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <>
      <a
        href={`https://${beneficiary?.website}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Globe aria-hidden="true" />
      </a>
      <a
        href={`mailto:${beneficiary?.contactEmail}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Mail aria-hidden="true" />
      </a>
      <a
        href={`https://${beneficiary?.links?.twitterUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Twitter aria-hidden="true" />
      </a>
      <a
        href={`https://${beneficiary?.links?.facebookUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Facebook aria-hidden="true" />
      </a>
      <a
        href={`https://${beneficiary?.links?.instagramUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Instagram aria-hidden="true" />
      </a>
      <a
        href={`https://${beneficiary?.links?.githubUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.GitHub aria-hidden="true" />
      </a>
      <a
        href={`https://${beneficiary?.links?.linkedinUrl}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        <Icon.Linkedin aria-hidden="true" />
      </a>
    </>
  );
}
