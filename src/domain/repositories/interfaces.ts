// Repository Interfaces (Clean Architecture Ports)
import {
  BloodPressureLog,
  GlucoseLog,
  HeightLog,
  User,
  WeightLog,
} from '../entities';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }): Promise<User>;
  verifyPassword(userEmail: string, plainPassword: string): Promise<User | null>;
}

export interface IGlucoseRepository {
  create(data: Omit<GlucoseLog, 'id' | 'createdAt'>): Promise<GlucoseLog>;
  update(id: string, data: Partial<Omit<GlucoseLog, 'id' | 'userId' | 'createdAt'>>): Promise<GlucoseLog>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<GlucoseLog | null>;
  listByUser(userId: string, startDate?: string, endDate?: string): Promise<GlucoseLog[]>;
}

export interface IBloodPressureRepository {
  create(data: Omit<BloodPressureLog, 'id' | 'createdAt'>): Promise<BloodPressureLog>;
  update(id: string, data: Partial<Omit<BloodPressureLog, 'id' | 'userId' | 'createdAt'>>): Promise<BloodPressureLog>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BloodPressureLog | null>;
  listByUser(userId: string, startDate?: string, endDate?: string): Promise<BloodPressureLog[]>;
}

export interface IWeightRepository {
  create(data: Omit<WeightLog, 'id' | 'createdAt'>): Promise<WeightLog>;
  update(id: string, data: Partial<Omit<WeightLog, 'id' | 'userId' | 'createdAt'>>): Promise<WeightLog>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<WeightLog | null>;
  listByUser(userId: string, startDate?: string, endDate?: string): Promise<WeightLog[]>;
  getLatest(userId: string): Promise<WeightLog | null>;
}

export interface IHeightRepository {
  create(data: Omit<HeightLog, 'id' | 'createdAt'>): Promise<HeightLog>;
  update(id: string, data: Partial<Omit<HeightLog, 'id' | 'userId' | 'createdAt'>>): Promise<HeightLog>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<HeightLog | null>;
  listByUser(userId: string): Promise<HeightLog[]>;
  getLatest(userId: string): Promise<HeightLog | null>;
}
