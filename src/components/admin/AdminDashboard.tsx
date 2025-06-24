import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { VolumeForecaster } from './VolumeForecaster';
import { DayOfWeekChart } from './DayOfWeekChart';
import { BookingVelocityChart } from './BookingVelocityChart';
import { BarChart3, TrendingUp, Calendar, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">SurgiCast</h1>
            <p className="text-primary-100">
              AI-Powered Surgical Volume Forecasting & Analytics
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-full">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">Volume Forecaster</h2>
            </div>
            <VolumeForecaster />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-secondary-100 rounded-full">
                <Calendar className="w-5 h-5 text-secondary-600" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">Day of Week Analysis</h2>
            </div>
            <DayOfWeekChart />
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-accent-100 rounded-full">
              <Activity className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">Booking Velocity Trends</h2>
          </div>
          <BookingVelocityChart />
        </Card>
      </motion.div>
    </div>
  );
};