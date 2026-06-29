"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function TrendLineChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full" style={{ minHeight: 300, minWidth: 100 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
          <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityPieChart({ data }: { data: any[] }) {
  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4'];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
