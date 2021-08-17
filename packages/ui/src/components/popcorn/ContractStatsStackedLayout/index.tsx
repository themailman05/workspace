import React from 'react';
import { MiniStatCard } from '../MiniStatCard';
import { AreaBarChart } from '../recharts/AreaBarChart';
import { getDummyEmissionData } from '../recharts/dummyEmissionsData';

export const ContractStatsStackedLayout = ({
  emissionSummaryStats,
  contractName,
}) => {
  return (
    <div className="py-10 mx-8">
      <div className="max-w-7xl mt-2 mb-8">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          {contractName}
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
        <div className="grid grid-cols-1 gap-4 lg:col-span-2">
          <div className="rounded-lg bg-white overflow-hidden shadow">
            <div className="p-6">
              <AreaBarChart
                data={getDummyEmissionData()}
                width={600}
                height={152}
              />
            </div>
          </div>
        </div>

        <div className="grid justify-items-center  grid-cols-1 gap-4">
          <div className="rounded-lg bg-white overflow-hidden shadow w-full">
            <div className="p-6 ">
              {emissionSummaryStats.map((item) => (
                <MiniStatCard item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
