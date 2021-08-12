import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = new Array(20).fill(undefined).map((x, i) => {
  return {
    name: `${i}/05/2021`,
    'CO2 Emissions': 500 * Math.random(),
    'Transaction Volume': 500 * Math.random(),
  };
});

export default function SimpleBarChart() {
  return (
    <ComposedChart
      width={300}
      height={300}
      data={data}
      margin={{
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      }}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis dataKey="name" scale="band">
        <Label value="Date" offset={-5} position="insideBottom" />
      </XAxis>
      <YAxis yAxisId="left" dataKey="CO2 Emissions" />
      <YAxis yAxisId="right" orientation="right" dataKey="Transaction Volume" />
      <Tooltip />
      <Legend />
      <Bar
        yAxisId="right"
        dataKey="CO2 Emissions"
        barSize={20}
        fill="#6366F1"
      />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="Transaction Volume"
        stroke="#ff7300"
      />
    </ComposedChart>
  );
}
