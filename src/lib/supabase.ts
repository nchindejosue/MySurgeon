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
}

export interface PatientDetails {
  user_id: string;
  personal_info: {
    date_of_birth: string;
    gender: string;
    address: string;
    phone_number: string;
  };
  physical_info: {
    height_cm: number;
    weight_kg: number;
    blood_type: string;
  };
  lifestyle_info: {
    smoking_status: string;
    alcohol_consumption: string;
  };
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
  procedure_name: string;
  surgery_date: string;
  surgeon_name?: string;
  hospital_name?: string;
  notes?: string;
}

export interface SurgeonDetails {
  user_id: string;
  specialty: string;
  hospital_affiliation: string;
  credentials: string;
  bio: string;
}

export interface SurgicalCase {
  id: string;
  patient_id: string;
  surgeon_id: string;
  procedure_name: string;
  proposed_surgery_date: string;
  status: 'Proposed' | 'Scheduled' | 'Completed' | 'Cancelled';
}