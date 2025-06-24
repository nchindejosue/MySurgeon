import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';

export const BookingVelocityChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingVelocityData();
  }, []);

  const fetchBookingVelocityData = async () => {
    try {
      // Mock data for demonstration - in production, this would query the historical_surgical_data table
      const mockData = [
        { period: 'Week 1', tMinus3: 42, tMinus2: 48, tMinus1: 35 },
        { period: 'Week 2', tMinus3: 45, tMinus2: 52, tMinus1: 38 },
        { period: 'Week 3', tMinus3: 38, tMinus2: 45, tMinus1: 42 },
        { period: 'Week 4', tMinus3: 51, tMinus2: 58, tMinus1: 45 },
        { period: 'Week 5', tMinus3: 47, tMinus2: 53, tMinus1: 40 },
        { period: 'Week 6', tMinus3: 49, tMinus2: 55, tMinus1: 43 },
      ];
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching booking velocity data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="tMinus3" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="T-3 Bookings"
          />
          <Line 
            type="monotone" 
            dataKey="tMinus2" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="T-2 Bookings"
          />
          <Line 
            type="monotone" 
            dataKey="tMinus1" 
            stroke="#fbbf24" 
            strokeWidth={2}
            dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
            name="T-1 Bookings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};