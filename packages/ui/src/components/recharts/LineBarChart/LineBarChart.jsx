import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function LineBarChart({ data, height, width }) {
  return (
    <ComposedChart
      width={width}
      height={height}
      data={data}
      margin={4}
      className="my-3"
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis dataKey="date" scale="band"></XAxis>
      <YAxis
        yAxisId="left"
        orientation="left"
        dataKey="CO2 Emissions"
        tick={false}
        label={
          <Text x={0} y={0} dx={50} dy={150} offset={0} angle={-90}>
            CO2 Emissions (g)
          </Text>
        }
      />

      <YAxis
        yAxisId="right"
        orientation="right"
        dataKey="Transaction Volume"
        tick={false}
        label={
          <Text
            x={0}
            y={0}
            dx={255}
            dy={85}
            offset={0}
            angle={-90}
            textAnchor={'middle'}
          >
            Transaction Volume
          </Text>
        }
      />
      <Tooltip />
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
