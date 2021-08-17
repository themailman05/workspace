import React, { SVGProps } from 'react';
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
}

export const TotalStatsMini: React.FC<TotalStatsProps> = ({
  emissionSummaryStats,
}) => {
  return (
    <div className="pb-8 my-8 bg-gray-50">
      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="col-span-3">
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 mx-4 ">
            <div className="mt-2">
              <dt>
                <p className="text-lg leading-6 font-medium text-gray-900">
                  Total Stats
                </p>
              </dt>
              <dd className=" text-base text-gray-500">19 Aug 2021 - 09:12</dd>
            </div>

            {emissionSummaryStats.map((item) => (
              <MiniStatCard item={item} />
            ))}
          </dl>
        </div>
        <div className="col-span-2">
          <AreaBarChart
            data={getDummyEmissionData()}
            width={350}
            height={125}
          />
        </div>
      </div>
    </div>
  );
};
