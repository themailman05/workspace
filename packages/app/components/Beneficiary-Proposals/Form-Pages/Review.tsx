// TODO: On submit clear local storage
import BeneficiaryPage from '../../../components/BeneficiaryPage';
import { DummyBeneficiaryProposal } from '../../../interfaces/beneficiaries';
interface RProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  name: string;
  ethereumAddress: string;
  missionStatement: string;
  proofOfOwnership: string;
  profileImage: string;
  headerImage: string;
  additionalImages: string[];
  impactReports: string[];
  socialMediaLinks: string;
}
export default function Review({
  currentStep,
  name,
  ethereumAddress,
  missionStatement,
  proofOfOwnership,
  profileImage,
  headerImage,
  additionalImages,
  impactReports,
  socialMediaLinks,
}: RProps): JSX.Element {
  if (currentStep === 10) {
    const res = {
      name,
      ethereumAddress,
      missionStatement,
      proofOfOwnership,
      profileImage,
      headerImage,
      additionalImages,
      impactReports,
      socialMediaLinks,
    };
    console.log({ res });
    const beneficaryProposal: DummyBeneficiaryProposal = {
      name,
      missionStatement,
      ethereumAddress,
      proofOfOwnership,
      profileImageURL: 'https://gateway.pinata.cloud/ipfs/' + profileImage,
      headerImageURL: 'https://gateway.pinata.cloud/ipfs/' + headerImage,
      impactReports: impactReports.map(
        (IpfsHash) => 'https://gateway.pinata.cloud/ipfs/' + IpfsHash,
      ),
      photoURLs: additionalImages.map(
        (IpfsHash) => 'https://gateway.pinata.cloud/ipfs/' + IpfsHash,
      ),
      votesAgainst: 0,
      votesFor: 0,
      currentStage: 'Open',
      stageDeadline: new Date(),
    };
    return (
      <div>
        <h1>Review Beneficiary Nomination Proposal before submitting</h1>
        <BeneficiaryPage isProposal={true} beneficiaryProposal={beneficaryProposal} />
      </div>
    );
  } else {
    return <></>;
  }
}
