import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  {
    name: 'Page A',
    uv: 590,
    pv: 800,
  },
  {
    name: 'Page B',
    uv: 868,
    pv: 967,
  },
  {
    name: 'Page C',
    uv: 1397,
    pv: 1098,
  },
  {
    name: 'Page D',
    uv: 1480,
    pv: 1200,
  },
  {
    name: 'Page E',
    uv: 1520,
    pv: 1108,
  },
  {
    name: 'Page F',
    uv: 1400,
    pv: 680,
  },
];

export default function SimpleBarChart({ chart: { id, title, state } }) {
  return (
    <div className="list-item">
      <input type="text" value={title} readOnly={true} />

      <ComposedChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="name" scale="band" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="right" dataKey="pv" barSize={20} fill="#413ea0" />
        <Line yAxisId="left" type="monotone" dataKey="uv" stroke="#ff7300" />
      </ComposedChart>
    </div>
  );
}
