import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, SurgicalCase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Calendar, Clock, User, Activity } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<SurgicalCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('surgical_cases')
        .select(`
          *,
          surgeon:profiles!surgical_cases_surgeon_id_fkey(full_name)
        `)
        .eq('patient_id', profile?.id)
        .order('proposed_surgery_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Proposed': return 'bg-accent-100 text-accent-700';
      case 'Scheduled': return 'bg-primary-100 text-primary-700';
      case 'Completed': return 'bg-secondary-100 text-secondary-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {profile?.full_name}!
        </h1>
        <p className="text-primary-100">
          Manage your health journey with confidence
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {appointments.filter(a => a.status === 'Scheduled').length}
                </p>
                <p className="text-neutral-600">Scheduled Appointments</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent-100 rounded-full">
                <Clock className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {appointments.filter(a => a.status === 'Proposed').length}
                </p>
                <p className="text-neutral-600">Pending Proposals</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary-100 rounded-full">
                <Activity className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {appointments.filter(a => a.status === 'Completed').length}
                </p>
                <p className="text-neutral-600">Completed Procedures</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Recent Appointments</h2>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-full">
                      <User className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {appointment.procedure_name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Dr. {(appointment as any).surgeon?.full_name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {new Date(appointment.proposed_surgery_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};