import { SVGProps } from 'react';
import { MiniStatCard } from '../MiniStatCard';
import { EmissionsAreaChart } from '../recharts/AreaChart';
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
}

export const TotalStatsMini: React.FC<TotalStatsProps> = ({
  emissionSummaryStats,
}) => {
  return (
    <div className="pb-8 bg-gray-50">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mt-16">
        Totals between 12/04/2021 and 30/05/2021
      </h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-5  gap-4">
        <div className="col-span-3">
          <dl className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-2 lg:grid-cols-4 mx-4">
            {emissionSummaryStats.map((item) => (
              <MiniStatCard item={item} />
            ))}
          </dl>
        </div>
        <div className="col-span-2">
          <EmissionsAreaChart
            data={getDummyEmissionData()}
            width={300}
            height={200}
          />
        </div>
      </div>
    </div>
  );
};
