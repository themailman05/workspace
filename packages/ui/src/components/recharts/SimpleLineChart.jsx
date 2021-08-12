import React from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
const data = new Array(108).fill(undefined).map((x, i) => {
  return {
    name: `Page ${i}`,
    uv: 400 * Math.random(),
    pv: 2400 * Math.random(),
    amt: 2400 * Math.random(),
  };
});
export default function SimpleLineChart({ chart: { id, title, state } }) {
  return (
    <div className="list-item">
      <input type="text" value={title} readOnly={true} />
      <LineChart width={600} height={300} data={data}>
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
      </LineChart>
    </div>
  );
}
