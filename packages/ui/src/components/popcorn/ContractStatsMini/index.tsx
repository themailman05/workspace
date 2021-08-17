/* This example requires Tailwind CSS v2.0+ */
import { SVGProps } from 'react';
import { MiniStatCard } from '../MiniStatCard';
import { getDummyEmissionData } from '../recharts/dummyEmissionsData';
import { EmissionsLineBarChart } from '../recharts/LineBarChart';
export interface EmissionSummaryStats {
  id: number;
  name: string;
  stat: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  change: string;
  changeType: 'increase' | 'decrease';
}

interface TotalStatsProps {
  emissionSummaryStats: EmissionSummaryStats[];
  contractName: string;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ContractStatsMini: React.FC<TotalStatsProps> = ({
  emissionSummaryStats,
  contractName,
}) => {
  return (
    <div className="pb-8 my-8 bg-gray-50">
      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="col-span-3">
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 mx-4 ">
            <div className="mt-2">
              <dt>
                <p className="text-lg leading-6 font-medium text-gray-900">
                  {contractName}
                </p>
              </dt>
            </div>

            {emissionSummaryStats.map((item) => (
              <MiniStatCard item={item} />
            ))}
          </dl>
        </div>
        <div className="col-span-2">
          <EmissionsLineBarChart
            data={getDummyEmissionData()}
            width={500}
            height={200}
          />
        </div>
      </div>
    </div>
  );
};
