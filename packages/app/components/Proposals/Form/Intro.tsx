import { defaultFormData, FormStepProps } from './ProposalForm';

export default function Intro({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const [formData, setFormData] = form;
  const { currentStep, setCurrentStep, stepLimit, setStepLimit } = navigation;

  return (
    visible && (
      <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
        <div className="sm:text-center lg:text-left">
          <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Beneficiary Nomination Proposal Form
          </h3>
          <p className="mt-8 text-lg text-gray-500">
            Thank you for making the effort to nominate an organization for
            grant election eligibility.
          </p>
          <p className="mt-8 text-lg text-gray-500">
            Anyone may nominate an organization by completing this form. It is
            also possible for an organization to nominate itself.
          </p>
          <p className="mt-8 text-lg text-gray-500">
            After the form has been submitted, the organization will be subject
            to a round of voting. If the organisation receives a majority of
            votes cast towards “Yes” (with at least 10% of the available supply
            of governance tokens voting “Yes”), it will become eligible for
            grants via grant elections.
          </p>
          <p className="mt-8 text-lg text-gray-500">
            An organization wishing to apply for eligible beneficiary status may
            acquire the requisite number of POP tokens to raise a BNP (2000), or
            they may reach out to the Popcorn Foundation to seek a nomination at
            no cost.
          </p>
          <div className="mt-5 prose prose-indigo text-gray-500">
            <p className="mt-8 text-lg text-gray-500">
              You'll need the following things to submit a proposal:
            </p>
            <ul>
              <li>A connected wallet with 2000 Popcorn governance tokens</li>
              <li>Your nominee's name and mission statement</li>
              <li>Ethereum address to which rewards will be transferred</li>
              <li>Proof that the address belongs to the nominee</li>
              <li>Impact reports and/or audited documents</li>
              <li>
                Supplmentary information such as photos and links to social
                media accounts
              </li>
            </ul>
          </div>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
            {/* Check for partially completed form */}
            {formData.name !== '' ? (
              <div className="rounded-md shadow">
                <a
                  onClick={() => {
                    setCurrentStep(currentStep + 1);
                  }}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Continue
                </a>
              </div>
            ) : (
              <></>
            )}
            <button
              onClick={() => {
                setCurrentStep(1);
                setStepLimit(1);
                setFormData(defaultFormData);
              }}
              type="button"
              className="w-80 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 mt-3 sm:mt-0"
            >
              Start new proposal
            </button>
          </div>
        </div>
      </main>
    )
  );
}
