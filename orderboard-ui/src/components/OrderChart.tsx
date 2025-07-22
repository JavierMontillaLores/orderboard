import React from 'react';
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';

interface Props {
  data: any[];
  xKey: string;
  yKey: string;
}

const OrderChart: React.FC<Props> = ({ data, xKey, yKey }) => {
  if (!data || data.length === 0) return <p>No chart data available.</p>;

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={yKey} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderChart;
