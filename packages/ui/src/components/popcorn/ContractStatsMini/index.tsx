/* This example requires Tailwind CSS v2.0+ */
import { SVGProps } from 'react';
import { MiniStatCard } from '../MiniStatCard';
import { AreaBarChart } from '../recharts/AreaBarChart';
import { getDummyEmissionData } from '../recharts/dummyEmissionsData';
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

export const ContractStatsMini: React.FC<TotalStatsProps> = ({
  emissionSummaryStats,
  contractName,
}) => {
  return (
    <div className="py-8 px-4 bg-gray-50">
      <div className="grid grid-cols-6">
        <div className="col-span-1">
          <p className="text-lg font-medium text-gray-900">{contractName}</p>
        </div>
        {emissionSummaryStats.map((item) => (
          <div className="col-span-1">
            <MiniStatCard item={item} />
          </div>
        ))}
        <div className="col-span-3">
          <AreaBarChart
            data={getDummyEmissionData()}
            width={500}
            height={125}
          />
        </div>
      </div>
    </div>
  );
};
