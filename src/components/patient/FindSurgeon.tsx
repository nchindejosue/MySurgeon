import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, Profile, SurgeonDetails } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Search, MapPin, Award, User } from 'lucide-react';

interface SurgeonWithDetails extends Profile {
  surgeon_details: SurgeonDetails;
}

export const FindSurgeon: React.FC = () => {
  const [surgeons, setSurgeons] = useState<SurgeonWithDetails[]>([]);
  const [filteredSurgeons, setFilteredSurgeons] = useState<SurgeonWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurgeon, setSelectedSurgeon] = useState<SurgeonWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurgeons();
  }, []);

  useEffect(() => {
    const filtered = surgeons.filter(surgeon =>
      surgeon.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgeon.surgeon_details.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgeon.surgeon_details.hospital_affiliation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSurgeons(filtered);
  }, [searchTerm, surgeons]);

  const fetchSurgeons = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          surgeon_details(*)
        `)
        .eq('role', 'surgeon');

      if (error) throw error;
      setSurgeons(data || []);
      setFilteredSurgeons(data || []);
    } catch (error) {
      console.error('Error fetching surgeons:', error);
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Find a Surgeon</h1>
        <p className="text-neutral-600">Connect with experienced surgeons in your area</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <Input
              placeholder="Search by name, specialty, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurgeons.map((surgeon, index) => (
          <motion.div
            key={surgeon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6 cursor-pointer" onClick={() => setSelectedSurgeon(surgeon)}>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Dr. {surgeon.full_name}
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>{surgeon.surgeon_details.specialty}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{surgeon.surgeon_details.hospital_affiliation}</span>
                  </div>
                </div>
                <Button className="mt-4 w-full" size="sm">
                  View Profile
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSurgeons.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No surgeons found matching your search</p>
        </motion.div>
      )}

      <Modal
        isOpen={!!selectedSurgeon}
        onClose={() => setSelectedSurgeon(null)}
        title={`Dr. ${selectedSurgeon?.full_name}`}
        size="lg"
      >
        {selectedSurgeon && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Dr. {selectedSurgeon.full_name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900">Specialty</h4>
                <p className="text-neutral-600">{selectedSurgeon.surgeon_details.specialty}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900">Hospital</h4>
                <p className="text-neutral-600">{selectedSurgeon.surgeon_details.hospital_affiliation}</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <h4 className="font-medium text-neutral-900">Credentials</h4>
                <p className="text-neutral-600">{selectedSurgeon.surgeon_details.credentials}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-neutral-900">About</h4>
              <p className="text-neutral-600">{selectedSurgeon.surgeon_details.bio}</p>
            </div>

            <div className="flex space-x-3">
              <Button className="flex-1">Request Consultation</Button>
              <Button variant="outline" className="flex-1">Send Message</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};