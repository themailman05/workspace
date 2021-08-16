import React from 'react';
import { getDummyEmissionData } from '../dummyEmissionsData';
import AreaChart from './AreaChart';

export default {
  component: AreaChart,
  title: 'AreaChart',
};

const data = getDummyEmissionData();
export const Default = () => <AreaChart data={data} width={300} height={200} />;
