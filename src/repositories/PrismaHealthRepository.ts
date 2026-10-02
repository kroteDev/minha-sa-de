// Prisma Repository Implementation (PostgreSQL via Prisma Client)
// Utilizado no ambiente Next.js / Node com conexão PostgreSQL via Docker

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

interface PrismaClientType {
  user: any;
  glucoseLog: any;
  bloodPressureLog: any;
  weightLog: any;
  heightLog: any;
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClientType) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    const { passwordHash: _, ...rest } = user;
    return rest as User;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { passwordHash: _, ...rest } = user;
    return rest as User;
  }

  async create(data: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        gender: data.gender || 'OTHER',
      },
    });
    const { passwordHash: _, ...rest } = user;
    return rest as User;
  }

  async verifyPassword(email: string, plainPassword: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return null;
    const expectedHash = `hash_${btoa(plainPassword)}`;
    if (user.passwordHash === expectedHash) {
      const { passwordHash: _, ...rest } = user;
      return rest as User;
    }
    return null;
  }
}

export class PrismaGlucoseRepository implements IGlucoseRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Omit<GlucoseLog, 'id' | 'createdAt'>): Promise<GlucoseLog> {
    const record = await this.prisma.glucoseLog.create({
      data: {
        userId: data.userId,
        value: data.value,
        context: data.context as any,
        notes: data.notes,
        measuredAt: new Date(data.measuredAt),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async update(id: string, data: Partial<Omit<GlucoseLog, 'id' | 'userId' | 'createdAt'>>): Promise<GlucoseLog> {
    const record = await this.prisma.glucoseLog.update({
      where: { id },
      data: {
        ...(data.value !== undefined && { value: data.value }),
        ...(data.context !== undefined && { context: data.context }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.measuredAt && { measuredAt: new Date(data.measuredAt) }),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.glucoseLog.delete({ where: { id } });
  }

  async findById(id: string): Promise<GlucoseLog | null> {
    const record = await this.prisma.glucoseLog.findUnique({ where: { id } });
    if (!record) return null;
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async listByUser(userId: string, startDate?: string, endDate?: string): Promise<GlucoseLog[]> {
    const records = await this.prisma.glucoseLog.findMany({
      where: {
        userId,
        ...(startDate || endDate
          ? {
              measuredAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}),
      },
      orderBy: { measuredAt: 'desc' },
    });
    return records.map((r: any) => ({
      ...r,
      measuredAt: r.measuredAt.toISOString(),
      createdAt: recordCreatedAt(r),
    }));
  }
}

export class PrismaBloodPressureRepository implements IBloodPressureRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Omit<BloodPressureLog, 'id' | 'createdAt'>): Promise<BloodPressureLog> {
    const record = await this.prisma.bloodPressureLog.create({
      data: {
        userId: data.userId,
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse,
        notes: data.notes,
        measuredAt: new Date(data.measuredAt),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async update(id: string, data: Partial<Omit<BloodPressureLog, 'id' | 'userId' | 'createdAt'>>): Promise<BloodPressureLog> {
    const record = await this.prisma.bloodPressureLog.update({
      where: { id },
      data: {
        ...(data.systolic !== undefined && { systolic: data.systolic }),
        ...(data.diastolic !== undefined && { diastolic: data.diastolic }),
        ...(data.pulse !== undefined && { pulse: data.pulse }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.measuredAt && { measuredAt: new Date(data.measuredAt) }),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bloodPressureLog.delete({ where: { id } });
  }

  async findById(id: string): Promise<BloodPressureLog | null> {
    const record = await this.prisma.bloodPressureLog.findUnique({ where: { id } });
    if (!record) return null;
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async listByUser(userId: string, startDate?: string, endDate?: string): Promise<BloodPressureLog[]> {
    const records = await this.prisma.bloodPressureLog.findMany({
      where: {
        userId,
        ...(startDate || endDate
          ? {
              measuredAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}),
      },
      orderBy: { measuredAt: 'desc' },
    });
    return records.map((r: any) => ({
      ...r,
      measuredAt: r.measuredAt.toISOString(),
      createdAt: recordCreatedAt(r),
    }));
  }
}

export class PrismaWeightRepository implements IWeightRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Omit<WeightLog, 'id' | 'createdAt'>): Promise<WeightLog> {
    const record = await this.prisma.weightLog.create({
      data: {
        userId: data.userId,
        weightKg: data.weightKg,
        notes: data.notes,
        measuredAt: new Date(data.measuredAt),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async update(id: string, data: Partial<Omit<WeightLog, 'id' | 'userId' | 'createdAt'>>): Promise<WeightLog> {
    const record = await this.prisma.weightLog.update({
      where: { id },
      data: {
        ...(data.weightKg !== undefined && { weightKg: data.weightKg }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.measuredAt && { measuredAt: new Date(data.measuredAt) }),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.weightLog.delete({ where: { id } });
  }

  async findById(id: string): Promise<WeightLog | null> {
    const record = await this.prisma.weightLog.findUnique({ where: { id } });
    if (!record) return null;
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async listByUser(userId: string, startDate?: string, endDate?: string): Promise<WeightLog[]> {
    const records = await this.prisma.weightLog.findMany({
      where: {
        userId,
        ...(startDate || endDate
          ? {
              measuredAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}),
      },
      orderBy: { measuredAt: 'desc' },
    });
    return records.map((r: any) => ({
      ...r,
      measuredAt: r.measuredAt.toISOString(),
      createdAt: recordCreatedAt(r),
    }));
  }

  async getLatest(userId: string): Promise<WeightLog | null> {
    const record = await this.prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
    });
    if (!record) return null;
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: recordCreatedAt(record),
    };
  }
}

export class PrismaHeightRepository implements IHeightRepository {
  constructor(private prisma: PrismaClientType) {}

  async create(data: Omit<HeightLog, 'id' | 'createdAt'>): Promise<HeightLog> {
    const record = await this.prisma.heightLog.create({
      data: {
        userId: data.userId,
        heightCm: data.heightCm,
        notes: data.notes,
        measuredAt: new Date(data.measuredAt),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async update(id: string, data: Partial<Omit<HeightLog, 'id' | 'userId' | 'createdAt'>>): Promise<HeightLog> {
    const record = await this.prisma.heightLog.update({
      where: { id },
      data: {
        ...(data.heightCm !== undefined && { heightCm: data.heightCm }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.measuredAt && { measuredAt: new Date(data.measuredAt) }),
      },
    });
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.heightLog.delete({ where: { id } });
  }

  async findById(id: string): Promise<HeightLog | null> {
    const record = await this.prisma.heightLog.findUnique({ where: { id } });
    if (!record) return null;
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  async listByUser(userId: string): Promise<HeightLog[]> {
    const records = await this.prisma.heightLog.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
    });
    return records.map((r: any) => ({
      ...r,
      measuredAt: r.measuredAt.toISOString(),
      createdAt: recordCreatedAt(r),
    }));
  }

  async getLatest(userId: string): Promise<HeightLog | null> {
    const record = await this.prisma.heightLog.findFirst({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
    });
    if (!record) return null;
    return {
      ...record,
      measuredAt: record.measuredAt.toISOString(),
      createdAt: recordCreatedAt(record),
    };
  }
}

function recordCreatedAt(record: any): string {
  return record.createdAt ? record.createdAt.toISOString() : new Date().toISOString();
}
