import { DummyBeneficiaryProposal } from '../interfaces/beneficiaries';

export default function ImpactReportLinks(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {
  return (
    <div>
      <p className="text-3xl text-black py-4">Impact Reports/Audits</p>
      {beneficiaryProposal.impactReports.map((reportUrl, index) => {
        return (
          <span className="flex flex-row justify-between">
            <p className="text-lg font-bold text-gray-700">
              Impact report {index + 1}
            </p>
            <span className="text-base text-gray-700 flex flex-row">
              <a
                href={reportUrl}
                className=" text-gray-400 hover:text-gray-500 underline"
              >
                <p>Link to report {index + 1}</p>
              </a>
            </span>
          </span>
        );
      })}
    </div>
  );
}
