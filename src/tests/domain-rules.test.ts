// Testes Unitários Abrangentes para Regras de Negócio e Domínio
// Cobre cálculo de IMC, classificação de pressão arterial (SBC/AHA),
// classificação de glicose (SBD/ADA), limites fisiológicos e casos de borda.

import { HealthClassificationService } from '../domain/services/HealthClassificationService';

export interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export function runBusinessRulesTests(): {
  results: TestResult[];
  total: number;
  passed: number;
  failed: number;
  durationTotal: number;
} {
  const results: TestResult[] = [];
  const startTime = performance.now();

  function test(category: string, name: string, fn: () => void) {
    const t0 = performance.now();
    try {
      fn();
      results.push({
        category,
        name,
        passed: true,
        durationMs: Number((performance.now() - t0).toFixed(2)),
      });
    } catch (err: any) {
      results.push({
        category,
        name,
        passed: false,
        error: err?.message || String(err),
        durationMs: Number((performance.now() - t0).toFixed(2)),
      });
    }
  }

  function expect(actual: any) {
    return {
      toBe(expected: any) {
        if (actual !== expected) {
          throw new Error(`Esperado ${JSON.stringify(expected)}, mas recebeu ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected: any) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Esperado ${JSON.stringify(expected)}, mas recebeu ${JSON.stringify(actual)}`);
        }
      },
      toThrow(expectedSubstring?: string) {
        if (typeof actual !== 'function') {
          throw new Error('toThrow requer uma função');
        }
        let threw = false;
        try {
          actual();
        } catch (e: any) {
          threw = true;
          if (expectedSubstring && !e.message.includes(expectedSubstring)) {
            throw new Error(`Mensagem de erro "${e.message}" não contém "${expectedSubstring}"`);
          }
        }
        if (!threw) {
          throw new Error('A função deveria ter disparado um erro, mas executou com sucesso.');
        }
      },
      not: {
        toThrow() {
          if (typeof actual !== 'function') {
            throw new Error('toThrow requer uma função');
          }
          try {
            actual();
          } catch (e: any) {
            throw new Error(`A função não deveria disparar erro, mas disparou: "${e.message}"`);
          }
        },
      },
      toBeCloseTo(expected: number, delta: number = 0.1) {
        if (Math.abs(actual - expected) > delta) {
          throw new Error(`Esperado próximo a ${expected} (±${delta}), mas recebeu ${actual}`);
        }
      },
    };
  }

  // ================= 1. REGRAS DE IMC (OMS) =================
  test('Cálculo de IMC', 'Deve calcular IMC de peso normal corretamente (70kg, 175cm => 22.9)', () => {
    const res = HealthClassificationService.calculateBMI(70, 175);
    expect(res.bmi).toBe(22.9);
    expect(res.category).toBe('Peso normal');
  });

  test('Cálculo de IMC', 'Deve classificar Abaixo do peso para IMC < 18.5 (50kg, 175cm => 16.3)', () => {
    const res = HealthClassificationService.calculateBMI(50, 175);
    expect(res.bmi).toBe(16.3);
    expect(res.category).toBe('Abaixo do peso');
  });

  test('Cálculo de IMC', 'Deve classificar Sobrepeso para IMC entre 25.0 e 29.9 (82kg, 175cm => 26.8)', () => {
    const res = HealthClassificationService.calculateBMI(82, 175);
    expect(res.bmi).toBe(26.8);
    expect(res.category).toBe('Sobrepeso');
  });

  test('Cálculo de IMC', 'Deve classificar Obesidade Grau I para IMC 30.0 a 34.9 (98kg, 175cm => 32.0)', () => {
    const res = HealthClassificationService.calculateBMI(98, 175);
    expect(res.bmi).toBe(32.0);
    expect(res.category).toBe('Obesidade Grau I');
  });

  test('Cálculo de IMC', 'Deve classificar Obesidade Grau II para IMC 35.0 a 39.9 (112kg, 175cm => 36.6)', () => {
    const res = HealthClassificationService.calculateBMI(112, 175);
    expect(res.bmi).toBe(36.6);
    expect(res.category).toBe('Obesidade Grau II');
  });

  test('Cálculo de IMC', 'Deve classificar Obesidade Grau III para IMC >= 40.0 (130kg, 175cm => 42.4)', () => {
    const res = HealthClassificationService.calculateBMI(130, 175);
    expect(res.bmi).toBe(42.4);
    expect(res.category).toBe('Obesidade Grau III');
  });

  test('Cálculo de IMC', 'Deve rejeitar peso zero ou negativo', () => {
    expect(() => HealthClassificationService.calculateBMI(0, 175)).toThrow('Peso inválido');
    expect(() => HealthClassificationService.calculateBMI(-5, 175)).toThrow('Peso inválido');
  });

  test('Cálculo de IMC', 'Deve rejeitar altura zero ou negativa', () => {
    expect(() => HealthClassificationService.calculateBMI(70, 0)).toThrow('Altura inválida');
    expect(() => HealthClassificationService.calculateBMI(70, -170)).toThrow('Altura inválida');
  });

  // ================= 2. REGRAS DE PRESSÃO ARTERIAL (SBC/AHA) =================
  test('Pressão Arterial', 'Deve classificar Pressão Ótima para PAS < 120 e PAD < 80 (115/75 mmHg)', () => {
    const res = HealthClassificationService.classifyBloodPressure(115, 75);
    expect(res.category).toBe('Ótima');
    expect(res.severity).toBe('success');
  });

  test('Pressão Arterial', 'Deve classificar Pressão Normal para 125/82 mmHg', () => {
    const res = HealthClassificationService.classifyBloodPressure(125, 82);
    expect(res.category).toBe('Normal');
  });

  test('Pressão Arterial', 'Deve classificar Pré-hipertensão para 135/85 mmHg', () => {
    const res = HealthClassificationService.classifyBloodPressure(135, 85);
    expect(res.category).toBe('Pré-hipertensão');
  });

  test('Pressão Arterial', 'Deve classificar Hipertensão Estágio 1 para 145/92 mmHg', () => {
    const res = HealthClassificationService.classifyBloodPressure(145, 92);
    expect(res.category).toBe('Hipertensão Estágio 1');
  });

  test('Pressão Arterial', 'Deve classificar Hipertensão Estágio 2 para 165/102 mmHg', () => {
    const res = HealthClassificationService.classifyBloodPressure(165, 102);
    expect(res.category).toBe('Hipertensão Estágio 2');
  });

  test('Pressão Arterial', 'Deve classificar Crise Hipertensiva para PAS >= 180 ou PAD >= 110 (185/115 mmHg)', () => {
    const res = HealthClassificationService.classifyBloodPressure(185, 115);
    expect(res.category).toBe('Crise Hipertensiva');
    expect(res.severity).toBe('critical');
  });

  test('Pressão Arterial', 'Deve rejeitar quando sistólica <= diastólica (inversão fisiológica)', () => {
    expect(() => HealthClassificationService.classifyBloodPressure(80, 120)).toThrow('sistólica deve ser estritamente maior');
    expect(() => HealthClassificationService.classifyBloodPressure(80, 80)).toThrow('sistólica deve ser estritamente maior');
  });

  test('Pressão Arterial', 'Deve rejeitar valores fora dos limites fisiológicos aceitáveis', () => {
    expect(() => HealthClassificationService.classifyBloodPressure(350, 80)).toThrow('fora dos limites');
    expect(() => HealthClassificationService.classifyBloodPressure(120, 15)).toThrow('fora dos limites');
  });

  // ================= 3. REGRAS DE GLICOSE (SBD/ADA) =================
  test('Glicemia', 'Deve classificar Hipoglicemia para valor < 70 mg/dL', () => {
    const res = HealthClassificationService.classifyGlucose(62, 'FASTING');
    expect(res.status).toBe('Hipoglicemia');
  });

  test('Glicemia', 'Deve classificar Glicose Normal em Jejum (70 a 99 mg/dL)', () => {
    const res = HealthClassificationService.classifyGlucose(88, 'FASTING');
    expect(res.status).toBe('Normal');
    expect(res.severity).toBe('success');
  });

  test('Glicemia', 'Deve classificar Pré-diabetes em Jejum (100 a 125 mg/dL)', () => {
    const res = HealthClassificationService.classifyGlucose(110, 'FASTING');
    expect(res.status).toBe('Pré-diabetes / Elevada');
  });

  test('Glicemia', 'Deve classificar Diabetes provável em Jejum (>= 126 mg/dL)', () => {
    const res = HealthClassificationService.classifyGlucose(135, 'FASTING');
    expect(res.status).toBe('Diabetes provável / Alta');
  });

  test('Glicemia', 'Deve classificar Normal Pós-prandial (< 140 mg/dL)', () => {
    const res = HealthClassificationService.classifyGlucose(128, 'POST_MEAL');
    expect(res.status).toBe('Normal');
  });

  test('Glicemia', 'Deve classificar Pré-diabetes/Elevada Pós-prandial (140 a 199 mg/dL)', () => {
    const res = HealthClassificationService.classifyGlucose(165, 'POST_MEAL');
    expect(res.status).toBe('Pré-diabetes / Elevada');
  });

  test('Glicemia', 'Deve classificar Diabetes provável Pós-prandial (>= 200 mg/dL)', () => {
    const res = HealthClassificationService.classifyGlucose(215, 'POST_MEAL');
    expect(res.status).toBe('Diabetes provável / Alta');
  });

  test('Glicemia', 'Deve rejeitar valores negativos ou absurdos (> 700 mg/dL)', () => {
    expect(() => HealthClassificationService.classifyGlucose(-10, 'FASTING')).toThrow('fora dos limites');
    expect(() => HealthClassificationService.classifyGlucose(900, 'FASTING')).toThrow('fora dos limites');
  });

  // ================= 4. VALIDAÇÃO DE PESO E ALTURA =================
  test('Validações Fisiológicas', 'Deve validar peso válido e rejeitar extremos irreais', () => {
    expect(() => HealthClassificationService.validateWeight(75.5)).not.toThrow();
    expect(() => HealthClassificationService.validateWeight(10)).toThrow('entre 20 kg e 450 kg');
    expect(() => HealthClassificationService.validateWeight(500)).toThrow('entre 20 kg e 450 kg');
  });

  test('Validações Fisiológicas', 'Deve validar altura válida e rejeitar extremos irreais', () => {
    expect(() => HealthClassificationService.validateHeight(175)).not.toThrow();
    expect(() => HealthClassificationService.validateHeight(35)).toThrow('entre 50 cm e 280 cm');
    expect(() => HealthClassificationService.validateHeight(300)).toThrow('entre 50 cm e 280 cm');
  });

  const durationTotal = Number((performance.now() - startTime).toFixed(2));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    results,
    total: results.length,
    passed,
    failed,
    durationTotal,
  };
}
