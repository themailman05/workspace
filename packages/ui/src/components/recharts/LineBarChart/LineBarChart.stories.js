import React from 'react';
import { getDummyEmissionData } from '../dummyEmissionsData';
import LineBarChart from './LineBarChart';

export default {
  component: LineBarChart,
  title: 'LineBarChart',
};

const data = getDummyEmissionData();
export const Default = () => <LineBarChart data={data} />;
