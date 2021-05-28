export default function Intro({ currentStep }): JSX.Element {
  if (currentStep === 0) {
    return (
      <div className="px-4 w-2/3 bg-indigo-200 sm:px-6 lg:px-8 lg:pt-20 py-20">
        <div className="text-center">
          <p className="mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
            For an organization to become an eligible grant recipient, a
            Beneficiary Nomination Proposal (BNP) must be raised and the
            proposal must receive a majority of votes cast towards “Yes” with at
            least 10% of the available supply of governance tokens voting “Yes”.
          </p>
          <p className="mt-3 mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
            An organization wishing to apply for eligible beneficiary status may
            acquire the requisite number of POP tokens to raise a BNP (2000), or
            they may reach out to the Popcorn Foundation to seek a nomination at
            no cost.
          </p>
          <p className="mt-3 mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
            Supplementary application materials, such as mission statement,
            proof of address ownership, photos, links to social media accounts,
            and links to impact reports will be included as an IPFS content
            hash.
          </p>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
