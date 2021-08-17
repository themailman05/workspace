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
import { ChartData } from '../AreaChart';

export interface AreaChartProps {
  data: ChartData[];
  height?: number;
  width?: number;
}

export const EmissionsLineBarChart: React.FC<AreaChartProps> = ({
  data,
  height,
  width,
}) => {
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
        dataKey="co2Emissions"
        tick={false}
        label={
          <Text x={0} y={0} dx={50} dy={height - 25} offset={0} angle={-90}>
            CO2 (kg))
          </Text>
        }
      />

      <YAxis
        yAxisId="right"
        orientation="right"
        dataKey="numTransactions"
        tick={false}
        label={
          <Text
            x={0}
            y={0}
            dx={width - 45}
            dy={height - 70}
            offset={0}
            angle={-90}
            textAnchor={'middle'}
          >
            Transactions
          </Text>
        }
      />
      <Tooltip />
      <Bar yAxisId="right" dataKey="co2Emissions" barSize={20} fill="#6366F1" />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="numTransactions"
        stroke="#ff7300"
      />
    </ComposedChart>
  );
};
