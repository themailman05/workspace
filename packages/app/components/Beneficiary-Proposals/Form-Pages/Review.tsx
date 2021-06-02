// TODO: On submit clear local storage

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
    return (
      <div>
        <h1>Review Beneficiary Nomination Proposal before submitting</h1>
        <div className="relative bg-indigo-800">
          <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover"
              src={
                'https://gateway.pinata.cloud/ipfs/' +
                window.localStorage.headerimg.slice(1, -1)
              }
              alt=""
            />
            <div
              className="absolute inset-0 bg-indigo-800 mix-blend-multiply"
              aria-hidden="true"
            />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {window.localStorage.name.slice(1, -1)}
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
              {window.localStorage.missionStatement.slice(1, -1)}
            </p>
          </div>
        </div>
        <img src={window.localStorage.img.slice(1, -1)}></img>

        <h1>name: {window.localStorage.name}</h1>
        <h1>missionStatement: {window.localStorage.missionStatement}</h1>
        <h1>ethereumAddress: {window.localStorage.ethereumAddress}</h1>
        <h1>proofOfOwnership: {window.localStorage.proofOfOwnership}</h1>
        <h1>profile img hash: {window.localStorage.img}</h1>
        <h1>header img hash: {window.localStorage.headerimg}</h1>
        <h1>additionalimages: {window.localStorage.additionalimages}</h1>
        <h1>impactreports: {window.localStorage.impactreports}</h1>
        <h1>socialMediaLinks: {window.localStorage.socialMediaLinks}</h1>
        <button
          className=" justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => window.alert('submit')}
        >
          Submit
        </button>
      </div>
    );
  } else {
    return <></>;
  }
}
