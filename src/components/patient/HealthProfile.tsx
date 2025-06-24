import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, PatientDetails, VitalSigns, SurgicalHistory } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { User, Activity, FileText, Plus, Edit, Trash2 } from 'lucide-react';

export const HealthProfile: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [surgicalHistory, setSurgicalHistory] = useState<SurgicalHistory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'vitals' | 'surgery' | 'personal'>('vitals');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      // Fetch patient details
      const { data: patientData } = await supabase
        .from('patient_details')
        .select('*')
        .eq('user_id', profile?.id)
        .single();

      // Fetch vital signs
      const { data: vitalsData } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', profile?.id)
        .order('created_at', { ascending: false });

      // Fetch surgical history
      const { data: surgeryData } = await supabase
        .from('surgical_history')
        .select('*')
        .eq('patient_id', profile?.id)
        .order('surgery_date', { ascending: false });

      setPatientDetails(patientData);
      setVitalSigns(vitalsData || []);
      setSurgicalHistory(surgeryData || []);
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'vitals' | 'surgery' | 'personal', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setShowModal(true);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'vitals', label: 'Vital Signs', icon: Activity },
    { id: 'surgery', label: 'Surgical History', icon: FileText },
  ];

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
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Health Profile</h1>
        <p className="text-neutral-600">Manage your personal health information</p>
      </motion.div>

      <Card className="p-6">
        <div className="border-b border-neutral-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'personal' && (
            <PersonalInfoTab 
              patientDetails={patientDetails} 
              onEdit={() => openModal('personal', patientDetails)}
            />
          )}
          {activeTab === 'vitals' && (
            <VitalSignsTab 
              vitalSigns={vitalSigns} 
              onAdd={() => openModal('vitals')}
              onEdit={(item) => openModal('vitals', item)}
            />
          )}
          {activeTab === 'surgery' && (
            <SurgicalHistoryTab 
              surgicalHistory={surgicalHistory} 
              onAdd={() => openModal('surgery')}
              onEdit={(item) => openModal('surgery', item)}
            />
          )}
        </motion.div>
      </Card>

      <HealthProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        editingItem={editingItem}
        onSave={fetchHealthData}
      />
    </div>
  );
};

const PersonalInfoTab: React.FC<{ patientDetails: PatientDetails | null; onEdit: () => void }> = ({ patientDetails, onEdit }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-neutral-900">Personal Information</h3>
      <Button onClick={onEdit} size="sm">
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>
    
    {patientDetails ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Date of Birth</label>
          <p className="text-neutral-900">{patientDetails.personal_info.date_of_birth}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
          <p className="text-neutral-900">{patientDetails.personal_info.gender}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
          <p className="text-neutral-900">{patientDetails.personal_info.phone_number}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Blood Type</label>
          <p className="text-neutral-900">{patientDetails.physical_info.blood_type}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
          <p className="text-neutral-900">{patientDetails.personal_info.address}</p>
        </div>
      </div>
    ) : (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 mb-4">No personal information on file</p>
        <Button onClick={onEdit}>Add Personal Information</Button>
      </div>
    )}
  </div>
);

const VitalSignsTab: React.FC<{ vitalSigns: VitalSigns[]; onAdd: () => void; onEdit: (item: VitalSigns) => void }> = ({ vitalSigns, onAdd, onEdit }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-neutral-900">Vital Signs</h3>
      <Button onClick={onAdd} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Entry
      </Button>
    </div>
    
    {vitalSigns.length > 0 ? (
      <div className="space-y-4">
        {vitalSigns.map((vital) => (
          <div key={vital.id} className="bg-neutral-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm text-neutral-600">
                {new Date(vital.created_at).toLocaleDateString()}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEdit(vital)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-neutral-600">Heart Rate:</span>
                <p className="font-medium">{vital.heart_rate} bpm</p>
              </div>
              <div>
                <span className="text-neutral-600">Blood Pressure:</span>
                <p className="font-medium">{vital.systolic_bp}/{vital.diastolic_bp}</p>
              </div>
              <div>
                <span className="text-neutral-600">Temperature:</span>
                <p className="font-medium">{vital.body_temperature_celsius}°C</p>
              </div>
              <div>
                <span className="text-neutral-600">Respiratory:</span>
                <p className="font-medium">{vital.respiratory_rate}/min</p>
              </div>
            </div>
            {vital.notes && (
              <div className="mt-3 text-sm">
                <span className="text-neutral-600">Notes:</span>
                <p className="text-neutral-900">{vital.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 mb-4">No vital signs recorded</p>
        <Button onClick={onAdd}>Add First Entry</Button>
      </div>
    )}
  </div>
);

const SurgicalHistoryTab: React.FC<{ surgicalHistory: SurgicalHistory[]; onAdd: () => void; onEdit: (item: SurgicalHistory) => void }> = ({ surgicalHistory, onAdd, onEdit }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-neutral-900">Surgical History</h3>
      <Button onClick={onAdd} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Entry
      </Button>
    </div>
    
    {surgicalHistory.length > 0 ? (
      <div className="space-y-4">
        {surgicalHistory.map((surgery) => (
          <div key={surgery.id} className="bg-neutral-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-neutral-900">{surgery.procedure_name}</h4>
              <Button variant="ghost" size="sm" onClick={() => onEdit(surgery)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-neutral-600">Date:</span>
                <p className="font-medium">{new Date(surgery.surgery_date).toLocaleDateString()}</p>
              </div>
              {surgery.surgeon_name && (
                <div>
                  <span className="text-neutral-600">Surgeon:</span>
                  <p className="font-medium">{surgery.surgeon_name}</p>
                </div>
              )}
              {surgery.hospital_name && (
                <div>
                  <span className="text-neutral-600">Hospital:</span>
                  <p className="font-medium">{surgery.hospital_name}</p>
                </div>
              )}
            </div>
            {surgery.notes && (
              <div className="mt-3 text-sm">
                <span className="text-neutral-600">Notes:</span>
                <p className="text-neutral-900">{surgery.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 mb-4">No surgical history recorded</p>
        <Button onClick={onAdd}>Add First Entry</Button>
      </div>
    )}
  </div>
);

const HealthProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  type: 'vitals' | 'surgery' | 'personal';
  editingItem: any;
  onSave: () => void;
}> = ({ isOpen, onClose, type, editingItem, onSave }) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({});
    }
  }, [editingItem, type]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (type === 'vitals') {
        const data = {
          patient_id: profile?.id,
          heart_rate: parseInt(formData.heart_rate),
          systolic_bp: parseInt(formData.systolic_bp),
          diastolic_bp: parseInt(formData.diastolic_bp),
          body_temperature_celsius: parseFloat(formData.body_temperature_celsius),
          respiratory_rate: parseInt(formData.respiratory_rate),
          notes: formData.notes || null,
        };

        if (editingItem) {
          await supabase.from('vital_signs').update(data).eq('id', editingItem.id);
        } else {
          await supabase.from('vital_signs').insert(data);
        }
      } else if (type === 'surgery') {
        const data = {
          patient_id: profile?.id,
          procedure_name: formData.procedure_name,
          surgery_date: formData.surgery_date,
          surgeon_name: formData.surgeon_name || null,
          hospital_name: formData.hospital_name || null,
          notes: formData.notes || null,
        };

        if (editingItem) {
          await supabase.from('surgical_history').update(data).eq('id', editingItem.id);
        } else {
          await supabase.from('surgical_history').insert(data);
        }
      } else if (type === 'personal') {
        const data = {
          user_id: profile?.id,
          personal_info: {
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            address: formData.address,
            phone_number: formData.phone_number,
          },
          physical_info: {
            height_cm: parseFloat(formData.height_cm),
            weight_kg: parseFloat(formData.weight_kg),
            blood_type: formData.blood_type,
          },
          lifestyle_info: {
            smoking_status: formData.smoking_status,
            alcohol_consumption: formData.alcohol_consumption,
          },
        };

        if (editingItem) {
          await supabase.from('patient_details').update(data).eq('user_id', profile?.id);
        } else {
          await supabase.from('patient_details').insert(data);
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    const action = editingItem ? 'Edit' : 'Add';
    switch (type) {
      case 'vitals': return `${action} Vital Signs`;
      case 'surgery': return `${action} Surgical History`;
      case 'personal': return `${action} Personal Information`;
      default: return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="lg">
      <div className="space-y-4">
        {type === 'vitals' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Heart Rate (bpm)"
                type="number"
                value={formData.heart_rate || ''}
                onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
              />
              <Input
                label="Respiratory Rate (/min)"
                type="number"
                value={formData.respiratory_rate || ''}
                onChange={(e) => setFormData({...formData, respiratory_rate: e.target.value})}
              />
              <Input
                label="Systolic BP"
                type="number"
                value={formData.systolic_bp || ''}
                onChange={(e) => setFormData({...formData, systolic_bp: e.target.value})}
              />
              <Input
                label="Diastolic BP"
                type="number"
                value={formData.diastolic_bp || ''}
                onChange={(e) => setFormData({...formData, diastolic_bp: e.target.value})}
              />
            </div>
            <Input
              label="Body Temperature (°C)"
              type="number"
              step="0.1"
              value={formData.body_temperature_celsius || ''}
              onChange={(e) => setFormData({...formData, body_temperature_celsius: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
              <textarea
                className="block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </>
        )}

        {type === 'surgery' && (
          <>
            <Input
              label="Procedure Name"
              value={formData.procedure_name || ''}
              onChange={(e) => setFormData({...formData, procedure_name: e.target.value})}
            />
            <Input
              label="Surgery Date"
              type="date"
              value={formData.surgery_date || ''}
              onChange={(e) => setFormData({...formData, surgery_date: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Surgeon Name"
                value={formData.surgeon_name || ''}
                onChange={(e) => setFormData({...formData, surgeon_name: e.target.value})}
              />
              <Input
                label="Hospital Name"
                value={formData.hospital_name || ''}
                onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
              <textarea
                className="block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </>
        )}

        {type === 'personal' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                <select
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <Input
              label="Phone Number"
              value={formData.phone_number || ''}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
            <Input
              label="Address"
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Height (cm)"
                type="number"
                value={formData.height_cm || ''}
                onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
              />
              <Input
                label="Weight (kg)"
                type="number"
                value={formData.weight_kg || ''}
                onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
              />
              <Input
                label="Blood Type"
                value={formData.blood_type || ''}
                onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Smoking Status</label>
                <select
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.smoking_status || ''}
                  onChange={(e) => setFormData({...formData, smoking_status: e.target.value})}
                >
                  <option value="">Select Status</option>
                  <option value="Never">Never</option>
                  <option value="Former">Former</option>
                  <option value="Current">Current</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Alcohol Consumption</label>
                <select
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.alcohol_consumption || ''}
                  onChange={(e) => setFormData({...formData, alcohol_consumption: e.target.value})}
                >
                  <option value="">Select Frequency</option>
                  <option value="Never">Never</option>
                  <option value="Rarely">Rarely</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Regularly">Regularly</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};