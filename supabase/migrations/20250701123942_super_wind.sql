/*
  # MySurgeon Database Schema

  1. New Tables
    - `profiles` - User profile information linked to auth.users
    - `patient_details` - Extended patient information with JSONB fields
    - `surgeon_details` - Surgeon-specific information and credentials
    - `vital_signs` - Patient vital signs tracking
    - `surgical_history` - Historical surgical procedures
    - `surgical_cases` - Current and scheduled surgical cases
    - `historical_surgical_data` - ML training data for volume forecasting

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Patients can only access their own data
    - Surgeons can view patient data and manage their cases
    - Admins have full access

  3. Functions & Triggers
    - Auto-create profile on user signup
    - Handle user metadata properly
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'surgeon', 'admin')),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_details table
CREATE TABLE IF NOT EXISTS public.patient_details (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    personal_info JSONB NOT NULL DEFAULT '{}',
    physical_info JSONB NOT NULL DEFAULT '{}',
    lifestyle_info JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create surgeon_details table
CREATE TABLE IF NOT EXISTS public.surgeon_details (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    specialty TEXT NOT NULL,
    hospital_affiliation TEXT NOT NULL,
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    certifications TEXT[],
    bio TEXT,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS public.vital_signs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    heart_rate INTEGER NOT NULL,
    systolic_bp INTEGER NOT NULL,
    diastolic_bp INTEGER NOT NULL,
    body_temperature_celsius DECIMAL(4,2) NOT NULL,
    respiratory_rate INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create surgical_history table
CREATE TABLE IF NOT EXISTS public.surgical_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    surgeon_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    procedure_name TEXT NOT NULL,
    hospital TEXT NOT NULL,
    surgery_date DATE NOT NULL,
    outcome TEXT,
    complications TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create surgical_cases table
CREATE TABLE IF NOT EXISTS public.surgical_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    surgeon_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    procedure_name TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('proposed', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    estimated_duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create historical_surgical_data table for ML predictions
CREATE TABLE IF NOT EXISTS public.historical_surgical_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    surgical_volume INTEGER NOT NULL,
    specialty TEXT,
    season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeon_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_surgical_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Surgeons can view other profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'surgeon'
        )
    );

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for patient_details
CREATE POLICY "Patients can manage their own details" ON public.patient_details
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Surgeons can view patient details" ON public.patient_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('surgeon', 'admin')
        )
    );

-- RLS Policies for surgeon_details
CREATE POLICY "Surgeons can manage their own details" ON public.surgeon_details
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view surgeon details" ON public.surgeon_details
    FOR SELECT USING (true);

-- RLS Policies for vital_signs
CREATE POLICY "Patients can view their own vital signs" ON public.vital_signs
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own vital signs" ON public.vital_signs
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Healthcare providers can manage vital signs" ON public.vital_signs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('surgeon', 'admin')
        )
    );

-- RLS Policies for surgical_history
CREATE POLICY "Patients can view their own surgical history" ON public.surgical_history
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Surgeons can view and manage surgical history" ON public.surgical_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('surgeon', 'admin')
        )
    );

-- RLS Policies for surgical_cases
CREATE POLICY "Patients can view their own cases" ON public.surgical_cases
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Surgeons can manage their cases" ON public.surgical_cases
    FOR ALL USING (
        auth.uid() = surgeon_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for historical_surgical_data
CREATE POLICY "Admins can manage historical data" ON public.historical_surgical_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Surgeons can view historical data" ON public.historical_surgical_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('surgeon', 'admin')
        )
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample historical data for ML model (this doesn't reference auth.users)
INSERT INTO public.historical_surgical_data (hospital_id, week_number, year, surgical_volume, specialty, season) VALUES
('HOSP001', 1, 2023, 42, 'General Surgery', 'winter'),
('HOSP001', 2, 2023, 45, 'General Surgery', 'winter'),
('HOSP001', 3, 2023, 38, 'General Surgery', 'winter'),
('HOSP001', 4, 2023, 51, 'General Surgery', 'winter'),
('HOSP001', 5, 2023, 47, 'General Surgery', 'winter'),
('HOSP001', 6, 2023, 49, 'General Surgery', 'winter'),
('HOSP001', 7, 2023, 52, 'General Surgery', 'winter'),
('HOSP001', 8, 2023, 48, 'General Surgery', 'winter'),
('HOSP001', 9, 2023, 44, 'General Surgery', 'spring'),
('HOSP001', 10, 2023, 46, 'General Surgery', 'spring'),
('HOSP001', 11, 2023, 50, 'General Surgery', 'spring'),
('HOSP001', 12, 2023, 53, 'General Surgery', 'spring'),
('HOSP001', 13, 2023, 55, 'Orthopedic', 'spring'),
('HOSP001', 14, 2023, 41, 'Orthopedic', 'spring'),
('HOSP001', 15, 2023, 43, 'Orthopedic', 'spring'),
('HOSP001', 16, 2023, 47, 'Orthopedic', 'spring'),
('HOSP001', 17, 2023, 49, 'Orthopedic', 'spring'),
('HOSP001', 18, 2023, 52, 'Orthopedic', 'spring'),
('HOSP001', 19, 2023, 48, 'Orthopedic', 'summer'),
('HOSP001', 20, 2023, 45, 'Orthopedic', 'summer')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON public.vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_created_at ON public.vital_signs(created_at);
CREATE INDEX IF NOT EXISTS idx_surgical_history_patient_id ON public.surgical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_surgical_history_surgeon_id ON public.surgical_history(surgeon_id);
CREATE INDEX IF NOT EXISTS idx_surgical_cases_patient_id ON public.surgical_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_surgical_cases_surgeon_id ON public.surgical_cases(surgeon_id);
CREATE INDEX IF NOT EXISTS idx_surgical_cases_status ON public.surgical_cases(status);
CREATE INDEX IF NOT EXISTS idx_historical_data_hospital_year ON public.historical_surgical_data(hospital_id, year);