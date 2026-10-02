import {
  BloodPressureLog,
  GlucoseContext,
  GlucoseLog,
  HeightLog,
  WeightLog,
} from '../domain/entities';
import {
  IBloodPressureRepository,
  IGlucoseRepository,
  IHeightRepository,
  IWeightRepository,
} from '../domain/repositories/interfaces';
import { HealthClassificationService } from '../domain/services/HealthClassificationService';

export class HealthMetricUseCases {
  constructor(
    private glucoseRepo: IGlucoseRepository,
    private bpRepo: IBloodPressureRepository,
    private weightRepo: IWeightRepository,
    private heightRepo: IHeightRepository
  ) {}

  // ===================== GLICOSE CRUD =====================
  async addGlucose(data: {
    userId: string;
    value: number;
    context: GlucoseContext;
    notes?: string;
    measuredAt?: string;
  }): Promise<GlucoseLog> {
    if (!data.value || isNaN(data.value)) {
      throw new Error('Informe um valor numérico para a glicose.');
    }
    // Dispara validação do domínio
    HealthClassificationService.classifyGlucose(data.value, data.context);

    return await this.glucoseRepo.create({
      userId: data.userId,
      value: Number(data.value),
      context: data.context,
      notes: data.notes?.trim() || undefined,
      measuredAt: data.measuredAt || new Date().toISOString(),
    });
  }

  async updateGlucose(
    id: string,
    data: { value?: number; context?: GlucoseContext; notes?: string; measuredAt?: string }
  ): Promise<GlucoseLog> {
    if (data.value !== undefined) {
      HealthClassificationService.classifyGlucose(data.value, data.context || 'FASTING');
    }
    return await this.glucoseRepo.update(id, data);
  }

  async deleteGlucose(id: string): Promise<void> {
    return await this.glucoseRepo.delete(id);
  }

  async listGlucose(userId: string, startDate?: string, endDate?: string): Promise<GlucoseLog[]> {
    return await this.glucoseRepo.listByUser(userId, startDate, endDate);
  }

  // ===================== PRESSÃO ARTERIAL CRUD =====================
  async addBloodPressure(data: {
    userId: string;
    systolic: number;
    diastolic: number;
    pulse?: number;
    notes?: string;
    measuredAt?: string;
  }): Promise<BloodPressureLog> {
    if (!data.systolic || !data.diastolic) {
      throw new Error('Informe a pressão sistólica e diastólica.');
    }
    // Dispara validação do domínio
    HealthClassificationService.classifyBloodPressure(Number(data.systolic), Number(data.diastolic));

    if (data.pulse !== undefined && data.pulse !== null) {
      const pulseNum = Number(data.pulse);
      if (pulseNum < 30 || pulseNum > 240) {
        throw new Error('Frequência cardíaca fora do intervalo plausível (30-240 bpm).');
      }
    }

    return await this.bpRepo.create({
      userId: data.userId,
      systolic: Number(data.systolic),
      diastolic: Number(data.diastolic),
      pulse: data.pulse ? Number(data.pulse) : undefined,
      notes: data.notes?.trim() || undefined,
      measuredAt: data.measuredAt || new Date().toISOString(),
    });
  }

  async updateBloodPressure(
    id: string,
    data: { systolic?: number; diastolic?: number; pulse?: number; notes?: string; measuredAt?: string }
  ): Promise<BloodPressureLog> {
    if (data.systolic !== undefined && data.diastolic !== undefined) {
      HealthClassificationService.classifyBloodPressure(Number(data.systolic), Number(data.diastolic));
    }
    return await this.bpRepo.update(id, data);
  }

  async deleteBloodPressure(id: string): Promise<void> {
    return await this.bpRepo.delete(id);
  }

  async listBloodPressure(userId: string, startDate?: string, endDate?: string): Promise<BloodPressureLog[]> {
    return await this.bpRepo.listByUser(userId, startDate, endDate);
  }

  // ===================== PESO CRUD =====================
  async addWeight(data: {
    userId: string;
    weightKg: number;
    notes?: string;
    measuredAt?: string;
  }): Promise<WeightLog> {
    const weight = Number(data.weightKg);
    HealthClassificationService.validateWeight(weight);

    return await this.weightRepo.create({
      userId: data.userId,
      weightKg: weight,
      notes: data.notes?.trim() || undefined,
      measuredAt: data.measuredAt || new Date().toISOString(),
    });
  }

  async updateWeight(
    id: string,
    data: { weightKg?: number; notes?: string; measuredAt?: string }
  ): Promise<WeightLog> {
    if (data.weightKg !== undefined) {
      HealthClassificationService.validateWeight(Number(data.weightKg));
    }
    return await this.weightRepo.update(id, data);
  }

  async deleteWeight(id: string): Promise<void> {
    return await this.weightRepo.delete(id);
  }

  async listWeight(userId: string, startDate?: string, endDate?: string): Promise<WeightLog[]> {
    return await this.weightRepo.listByUser(userId, startDate, endDate);
  }

  // ===================== ALTURA CRUD =====================
  async addHeight(data: {
    userId: string;
    heightCm: number;
    notes?: string;
    measuredAt?: string;
  }): Promise<HeightLog> {
    const height = Number(data.heightCm);
    HealthClassificationService.validateHeight(height);

    return await this.heightRepo.create({
      userId: data.userId,
      heightCm: height,
      notes: data.notes?.trim() || undefined,
      measuredAt: data.measuredAt || new Date().toISOString(),
    });
  }

  async updateHeight(
    id: string,
    data: { heightCm?: number; notes?: string; measuredAt?: string }
  ): Promise<HeightLog> {
    if (data.heightCm !== undefined) {
      HealthClassificationService.validateHeight(Number(data.heightCm));
    }
    return await this.heightRepo.update(id, data);
  }

  async deleteHeight(id: string): Promise<void> {
    return await this.heightRepo.delete(id);
  }

  async listHeight(userId: string): Promise<HeightLog[]> {
    return await this.heightRepo.listByUser(userId);
  }

  // ===================== DASHBOARD & SUMMARY =====================
  async getHealthDashboardSummary(userId: string) {
    const [glucoseList, bpList, weightList, heightList] = await Promise.all([
      this.glucoseRepo.listByUser(userId),
      this.bpRepo.listByUser(userId),
      this.weightRepo.listByUser(userId),
      this.heightRepo.listByUser(userId),
    ]);

    const latestGlucose = glucoseList[0] || null;
    const latestBp = bpList[0] || null;
    const latestWeight = weightList[0] || null;
    const latestHeight = heightList[0] || null;

    // Calcular IMC se houver peso e altura
    let bmiResult = null;
    if (latestWeight && latestHeight) {
      bmiResult = HealthClassificationService.calculateBMI(latestWeight.weightKg, latestHeight.heightCm);
    }

    // Médias dos últimos 7 dias
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentGlucose = glucoseList.filter((g) => new Date(g.measuredAt) >= sevenDaysAgo);
    const avgGlucose =
      recentGlucose.length > 0
        ? Math.round(recentGlucose.reduce((acc, curr) => acc + curr.value, 0) / recentGlucose.length)
        : null;

    const recentBp = bpList.filter((b) => new Date(b.measuredAt) >= sevenDaysAgo);
    const avgSystolic =
      recentBp.length > 0
        ? Math.round(recentBp.reduce((acc, curr) => acc + curr.systolic, 0) / recentBp.length)
        : null;
    const avgDiastolic =
      recentBp.length > 0
        ? Math.round(recentBp.reduce((acc, curr) => acc + curr.diastolic, 0) / recentBp.length)
        : null;

    return {
      latestGlucose,
      latestBp,
      latestWeight,
      latestHeight,
      bmiResult,
      averages: {
        glucose7d: avgGlucose,
        systolic7d: avgSystolic,
        diastolic7d: avgDiastolic,
        totalMeasurements: glucoseList.length + bpList.length + weightList.length + heightList.length,
      },
      counts: {
        glucose: glucoseList.length,
        bloodPressure: bpList.length,
        weight: weightList.length,
        height: heightList.length,
      },
    };
  }
}
