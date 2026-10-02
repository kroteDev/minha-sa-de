// Repositório de Persistência Local (Clean Architecture Adapter)
// Suporta execução imediata, offline-first e pré-populado com dados clínicos de demonstração

import {
  BloodPressureLog,
  GlucoseLog,
  HeightLog,
  User,
  WeightLog,
} from '../domain/entities';
import {
  IBloodPressureRepository,
  IGlucoseRepository,
  IHeightRepository,
  IUserRepository,
  IWeightRepository,
} from '../domain/repositories/interfaces';

const STORAGE_KEYS = {
  USERS: 'healthtrack_users',
  GLUCOSE: 'healthtrack_glucose',
  BP: 'healthtrack_blood_pressure',
  WEIGHT: 'healthtrack_weight',
  HEIGHT: 'healthtrack_height',
  CURRENT_USER: 'healthtrack_active_user',
};

const SEED_USER_ID = 'usr-demo-01';

export class LocalHealthStorage {
  constructor() {
    this.seedInitialData();
  }

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Falha ao salvar no storage local', e);
    }
  }

  private seedInitialData() {
    try {
      const existingUsers = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
      if (existingUsers.length > 0) return;

      const demoUser: User = {
        id: SEED_USER_ID,
        name: 'Carlos Alberto Silva',
        email: 'usuario@saude.com',
        birthDate: '1985-06-15',
        gender: 'MALE',
        createdAt: new Date().toISOString(),
      };

      const passHash = `hash_${btoa('123456')}`;
      const usersWithHash = [{ ...demoUser, passwordHash: passHash }];
      this.setItem(STORAGE_KEYS.USERS, usersWithHash);

      // Semente de Altura (1.78m)
      const heights: HeightLog[] = [
        {
          id: 'h-1',
          userId: SEED_USER_ID,
          heightCm: 178,
          notes: 'Medição em consulta médica anual',
          measuredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
      this.setItem(STORAGE_KEYS.HEIGHT, heights);

      // Semente de Pesos (Últimos 14 dias em leve declínio saudável)
      const weights: WeightLog[] = [];
      const baseWeight = 82.5;
      for (let i = 14; i >= 0; i -= 2) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        weights.push({
          id: `w-${i}`,
          userId: SEED_USER_ID,
          weightKg: Number((baseWeight - (14 - i) * 0.15 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
          notes: i === 0 ? 'Pesagem matinal em jejum' : undefined,
          measuredAt: date.toISOString(),
          createdAt: date.toISOString(),
        });
      }
      this.setItem(STORAGE_KEYS.WEIGHT, weights.reverse());

      // Semente de Pressão Arterial (Variações diárias)
      const bps: BloodPressureLog[] = [];
      for (let i = 10; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000);
        const sys = 118 + Math.floor(Math.random() * 12);
        const dia = 76 + Math.floor(Math.random() * 8);
        bps.push({
          id: `bp-${i}`,
          userId: SEED_USER_ID,
          systolic: sys,
          diastolic: dia,
          pulse: 68 + Math.floor(Math.random() * 10),
          notes: i === 2 ? 'Após caminhada leve' : 'Aferição em repouso',
          measuredAt: date.toISOString(),
          createdAt: date.toISOString(),
        });
      }
      this.setItem(STORAGE_KEYS.BP, bps.reverse());

      // Semente de Glicose (Jejum e Pós-prandial)
      const glucoses: GlucoseLog[] = [];
      for (let i = 10; i >= 0; i--) {
        const morningDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
        glucoses.push({
          id: `g-m-${i}`,
          userId: SEED_USER_ID,
          value: 88 + Math.floor(Math.random() * 14),
          context: 'FASTING',
          notes: 'Em jejum (8h)',
          measuredAt: morningDate.toISOString(),
          createdAt: morningDate.toISOString(),
        });

        if (i % 2 === 0) {
          const postMealDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000);
          glucoses.push({
            id: `g-p-${i}`,
            userId: SEED_USER_ID,
            value: 120 + Math.floor(Math.random() * 25),
            context: 'POST_MEAL',
            notes: '2h após o almoço',
            measuredAt: postMealDate.toISOString(),
            createdAt: postMealDate.toISOString(),
          });
        }
      }
      this.setItem(STORAGE_KEYS.GLUCOSE, glucoses.reverse());
    } catch {
      // Ignora em caso de indisponibilidade
    }
  }
}

export const sharedStorage = new LocalHealthStorage();

export class LocalStorageUserRepository implements IUserRepository {
  constructor(private storage: LocalHealthStorage = sharedStorage) {}

  async findByEmail(email: string): Promise<User | null> {
    const users = this.storage.getItem<(User & { passwordHash: string })[]>(STORAGE_KEYS.USERS, []);
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;
    const { passwordHash: _, ...cleanUser } = found;
    return cleanUser;
  }

  async findById(id: string): Promise<User | null> {
    const users = this.storage.getItem<(User & { passwordHash: string })[]>(STORAGE_KEYS.USERS, []);
    const found = users.find((u) => u.id === id);
    if (!found) return null;
    const { passwordHash: _, ...cleanUser } = found;
    return cleanUser;
  }

  async create(data: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }): Promise<User> {
    const users = this.storage.getItem<(User & { passwordHash: string })[]>(STORAGE_KEYS.USERS, []);
    const newUser = {
      ...data,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.storage.setItem(STORAGE_KEYS.USERS, users);
    const { passwordHash: _, ...cleanUser } = newUser;
    return cleanUser;
  }

  async verifyPassword(email: string, plainPassword: string): Promise<User | null> {
    const users = this.storage.getItem<(User & { passwordHash: string })[]>(STORAGE_KEYS.USERS, []);
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;

    const expectedHash = `hash_${btoa(plainPassword)}`;
    if (found.passwordHash === expectedHash) {
      const { passwordHash: _, ...cleanUser } = found;
      return cleanUser;
    }
    return null;
  }
}

export class LocalStorageGlucoseRepository implements IGlucoseRepository {
  constructor(private storage: LocalHealthStorage = sharedStorage) {}

  async create(data: Omit<GlucoseLog, 'id' | 'createdAt'>): Promise<GlucoseLog> {
    const items = this.storage.getItem<GlucoseLog[]>(STORAGE_KEYS.GLUCOSE, []);
    const newItem: GlucoseLog = {
      ...data,
      id: `glu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.storage.setItem(STORAGE_KEYS.GLUCOSE, items);
    return newItem;
  }

  async update(id: string, data: Partial<Omit<GlucoseLog, 'id' | 'userId' | 'createdAt'>>): Promise<GlucoseLog> {
    const items = this.storage.getItem<GlucoseLog[]>(STORAGE_KEYS.GLUCOSE, []);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Registro de glicose não encontrado.');
    const updated = { ...items[index], ...data };
    items[index] = updated;
    this.storage.setItem(STORAGE_KEYS.GLUCOSE, items);
    return updated;
  }

  async delete(id: string): Promise<void> {
    let items = this.storage.getItem<GlucoseLog[]>(STORAGE_KEYS.GLUCOSE, []);
    items = items.filter((i) => i.id !== id);
    this.storage.setItem(STORAGE_KEYS.GLUCOSE, items);
  }

  async findById(id: string): Promise<GlucoseLog | null> {
    const items = this.storage.getItem<GlucoseLog[]>(STORAGE_KEYS.GLUCOSE, []);
    return items.find((i) => i.id === id) || null;
  }

  async listByUser(userId: string, startDate?: string, endDate?: string): Promise<GlucoseLog[]> {
    let items = this.storage.getItem<GlucoseLog[]>(STORAGE_KEYS.GLUCOSE, []).filter((i) => i.userId === userId);
    if (startDate) items = items.filter((i) => new Date(i.measuredAt) >= new Date(startDate));
    if (endDate) items = items.filter((i) => new Date(i.measuredAt) <= new Date(endDate));
    return items.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  }
}

export class LocalStorageBloodPressureRepository implements IBloodPressureRepository {
  constructor(private storage: LocalHealthStorage = sharedStorage) {}

  async create(data: Omit<BloodPressureLog, 'id' | 'createdAt'>): Promise<BloodPressureLog> {
    const items = this.storage.getItem<BloodPressureLog[]>(STORAGE_KEYS.BP, []);
    const newItem: BloodPressureLog = {
      ...data,
      id: `bp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.storage.setItem(STORAGE_KEYS.BP, items);
    return newItem;
  }

  async update(id: string, data: Partial<Omit<BloodPressureLog, 'id' | 'userId' | 'createdAt'>>): Promise<BloodPressureLog> {
    const items = this.storage.getItem<BloodPressureLog[]>(STORAGE_KEYS.BP, []);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Registro de pressão não encontrado.');
    const updated = { ...items[index], ...data };
    items[index] = updated;
    this.storage.setItem(STORAGE_KEYS.BP, items);
    return updated;
  }

  async delete(id: string): Promise<void> {
    let items = this.storage.getItem<BloodPressureLog[]>(STORAGE_KEYS.BP, []);
    items = items.filter((i) => i.id !== id);
    this.storage.setItem(STORAGE_KEYS.BP, items);
  }

  async findById(id: string): Promise<BloodPressureLog | null> {
    const items = this.storage.getItem<BloodPressureLog[]>(STORAGE_KEYS.BP, []);
    return items.find((i) => i.id === id) || null;
  }

  async listByUser(userId: string, startDate?: string, endDate?: string): Promise<BloodPressureLog[]> {
    let items = this.storage.getItem<BloodPressureLog[]>(STORAGE_KEYS.BP, []).filter((i) => i.userId === userId);
    if (startDate) items = items.filter((i) => new Date(i.measuredAt) >= new Date(startDate));
    if (endDate) items = items.filter((i) => new Date(i.measuredAt) <= new Date(endDate));
    return items.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  }
}

export class LocalStorageWeightRepository implements IWeightRepository {
  constructor(private storage: LocalHealthStorage = sharedStorage) {}

  async create(data: Omit<WeightLog, 'id' | 'createdAt'>): Promise<WeightLog> {
    const items = this.storage.getItem<WeightLog[]>(STORAGE_KEYS.WEIGHT, []);
    const newItem: WeightLog = {
      ...data,
      id: `wt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.storage.setItem(STORAGE_KEYS.WEIGHT, items);
    return newItem;
  }

  async update(id: string, data: Partial<Omit<WeightLog, 'id' | 'userId' | 'createdAt'>>): Promise<WeightLog> {
    const items = this.storage.getItem<WeightLog[]>(STORAGE_KEYS.WEIGHT, []);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Registro de peso não encontrado.');
    const updated = { ...items[index], ...data };
    items[index] = updated;
    this.storage.setItem(STORAGE_KEYS.WEIGHT, items);
    return updated;
  }

  async delete(id: string): Promise<void> {
    let items = this.storage.getItem<WeightLog[]>(STORAGE_KEYS.WEIGHT, []);
    items = items.filter((i) => i.id !== id);
    this.storage.setItem(STORAGE_KEYS.WEIGHT, items);
  }

  async findById(id: string): Promise<WeightLog | null> {
    const items = this.storage.getItem<WeightLog[]>(STORAGE_KEYS.WEIGHT, []);
    return items.find((i) => i.id === id) || null;
  }

  async listByUser(userId: string, startDate?: string, endDate?: string): Promise<WeightLog[]> {
    let items = this.storage.getItem<WeightLog[]>(STORAGE_KEYS.WEIGHT, []).filter((i) => i.userId === userId);
    if (startDate) items = items.filter((i) => new Date(i.measuredAt) >= new Date(startDate));
    if (endDate) items = items.filter((i) => new Date(i.measuredAt) <= new Date(endDate));
    return items.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  }

  async getLatest(userId: string): Promise<WeightLog | null> {
    const list = await this.listByUser(userId);
    return list[0] || null;
  }
}

export class LocalStorageHeightRepository implements IHeightRepository {
  constructor(private storage: LocalHealthStorage = sharedStorage) {}

  async create(data: Omit<HeightLog, 'id' | 'createdAt'>): Promise<HeightLog> {
    const items = this.storage.getItem<HeightLog[]>(STORAGE_KEYS.HEIGHT, []);
    const newItem: HeightLog = {
      ...data,
      id: `ht-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.storage.setItem(STORAGE_KEYS.HEIGHT, items);
    return newItem;
  }

  async update(id: string, data: Partial<Omit<HeightLog, 'id' | 'userId' | 'createdAt'>>): Promise<HeightLog> {
    const items = this.storage.getItem<HeightLog[]>(STORAGE_KEYS.HEIGHT, []);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Registro de altura não encontrado.');
    const updated = { ...items[index], ...data };
    items[index] = updated;
    this.storage.setItem(STORAGE_KEYS.HEIGHT, items);
    return updated;
  }

  async delete(id: string): Promise<void> {
    let items = this.storage.getItem<HeightLog[]>(STORAGE_KEYS.HEIGHT, []);
    items = items.filter((i) => i.id !== id);
    this.storage.setItem(STORAGE_KEYS.HEIGHT, items);
  }

  async findById(id: string): Promise<HeightLog | null> {
    const items = this.storage.getItem<HeightLog[]>(STORAGE_KEYS.HEIGHT, []);
    return items.find((i) => i.id === id) || null;
  }

  async listByUser(userId: string): Promise<HeightLog[]> {
    const items = this.storage.getItem<HeightLog[]>(STORAGE_KEYS.HEIGHT, []).filter((i) => i.userId === userId);
    return items.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  }

  async getLatest(userId: string): Promise<HeightLog | null> {
    const list = await this.listByUser(userId);
    return list[0] || null;
  }
}

// Instâncias para injeção de dependência na aplicação
export const userRepo = new LocalStorageUserRepository(sharedStorage);
export const glucoseRepo = new LocalStorageGlucoseRepository(sharedStorage);
export const bpRepo = new LocalStorageBloodPressureRepository(sharedStorage);
export const weightRepo = new LocalStorageWeightRepository(sharedStorage);
export const heightRepo = new LocalStorageHeightRepository(sharedStorage);
