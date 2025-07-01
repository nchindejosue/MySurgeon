import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'surgeon' | 'admin';
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientDetails {
  user_id: string;
  personal_info: {
    date_of_birth?: string;
    gender?: string;
    address?: string;
    phone_number?: string;
  };
  physical_info: {
    height_cm?: number;
    weight_kg?: number;
    blood_type?: string;
  };
  lifestyle_info: {
    smoking_status?: string;
    alcohol_consumption?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface VitalSigns {
  id: string;
  patient_id: string;
  created_at: string;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  body_temperature_celsius: number;
  respiratory_rate: number;
  notes?: string;
}

export interface SurgicalHistory {
  id: string;
  patient_id: string;
  surgeon_id?: string;
  procedure_name: string;
  surgery_date: string;
  hospital: string;
  outcome?: string;
  complications?: string;
  notes?: string;
  created_at: string;
}

export interface SurgeonDetails {
  user_id: string;
  specialty: string;
  hospital_affiliation: string;
  years_of_experience: number;
  certifications?: string[];
  bio?: string;
  consultation_fee?: number;
  created_at: string;
  updated_at: string;
}

export interface SurgicalCase {
  id: string;
  patient_id: string;
  surgeon_id?: string;
  procedure_name: string;
  scheduled_date?: string;
  status: 'proposed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  estimated_duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HistoricalSurgicalData {
  id: string;
  hospital_id: string;
  week_number: number;
  year: number;
  surgical_volume: number;
  specialty?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  created_at: string;
}