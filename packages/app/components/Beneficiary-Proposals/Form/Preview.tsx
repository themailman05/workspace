import BeneficiaryPage from '../../BeneficiaryPage';
import toast from 'react-hot-toast';
import { defaultFormData, Form, FormStepProps } from './ProposalForm';
import { useRouter } from 'next/router';

const success = () => toast.success('Successful upload to IPFS');
const loading = () => toast.loading('Uploading to IPFS...');
const uploadError = (errMsg: string) => toast.error(errMsg);

export default function Preview({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = form;
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  function uploadJsonToIpfs(submissionData: Form) {
    var myHeaders = new Headers();
    myHeaders.append('pinata_api_key', process.env.PINATA_API_KEY);
    myHeaders.append('pinata_secret_api_key', process.env.PINATA_API_SECRET);
    myHeaders.append('Content-Type', 'application/json');
    var raw = JSON.stringify(submissionData);
    loading();
    fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    })
      .then((response) => response.text())
      .then((result) => {
        const hash = JSON.parse(result).IpfsHash;
        window.alert(hash); // Temporary
        toast.dismiss();
        success();
        clearLocalStorage();
        setTimeout(() => router.push('/'), 3000);
      })
      .catch((error) => {
        uploadError('Error uploading submission data to IPFS');
      });
  }

  function clearLocalStorage() {
    setCurrentStep(1);
    setStepLimit(1);
    setFormData(defaultFormData);
  }

  return (
    visible && (
      <div>
        <div className="md:flex md:items-center md:justify-between my-8 mx-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Preview Beneficiary Nomination Proposal below
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                setCurrentStep(currentStep - 1);
              }}
            >
              Back/Edit
            </button>
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                uploadJsonToIpfs(formData);
              }}
            >
              Submit
            </button>
          </div>
        </div>

        <BeneficiaryPage
          isProposal={false}
          beneficiaryProposal={formData}
          isProposalPreview={true}
        />
      </div>
    )
  );
}
