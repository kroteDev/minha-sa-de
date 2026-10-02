// Domain Entities & Types

export type GlucoseContext = 'FASTING' | 'PRE_MEAL' | 'POST_MEAL' | 'BEDTIME' | 'RANDOM';

export interface User {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt: string;
}

export interface GlucoseLog {
  id: string;
  userId: string;
  value: number; // mg/dL
  context: GlucoseContext;
  notes?: string;
  measuredAt: string; // ISO string
  createdAt: string;
}

export interface BloodPressureLog {
  id: string;
  userId: string;
  systolic: number; // mmHg
  diastolic: number; // mmHg
  pulse?: number; // bpm
  notes?: string;
  measuredAt: string;
  createdAt: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weightKg: number; // kg
  notes?: string;
  measuredAt: string;
  createdAt: string;
}

export interface HeightLog {
  id: string;
  userId: string;
  heightCm: number; // cm
  notes?: string;
  measuredAt: string;
  createdAt: string;
}

export interface BMICalculationResult {
  bmi: number;
  category: 'Abaixo do peso' | 'Peso normal' | 'Sobrepeso' | 'Obesidade Grau I' | 'Obesidade Grau II' | 'Obesidade Grau III';
  color: string; // Tailwind color token
  description: string;
}

export interface BloodPressureCategory {
  category: 'Ótima' | 'Normal' | 'Pré-hipertensão' | 'Hipertensão Estágio 1' | 'Hipertensão Estágio 2' | 'Crise Hipertensiva';
  severity: 'success' | 'info' | 'warning' | 'danger' | 'critical';
  color: string;
  advice: string;
}

export interface GlucoseCategory {
  status: 'Hipoglicemia' | 'Normal' | 'Pré-diabetes / Elevada' | 'Diabetes provável / Alta';
  severity: 'warning' | 'success' | 'amber' | 'danger';
  color: string;
  advice: string;
}
