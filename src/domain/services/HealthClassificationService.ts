// Domain Service: Regras de negócio puras para classificação de métricas de saúde
import {
  BMICalculationResult,
  BloodPressureCategory,
  GlucoseCategory,
  GlucoseContext,
} from '../entities';

export class HealthClassificationService {
  /**
   * Calcula o Índice de Massa Corporal (IMC) e retorna a classificação da OMS
   * Fórmula: peso (kg) / [altura (m)]²
   */
  static calculateBMI(weightKg: number, heightCm: number): BMICalculationResult {
    if (!weightKg || weightKg <= 0) {
      throw new Error('Peso inválido para cálculo de IMC');
    }
    if (!heightCm || heightCm <= 0) {
      throw new Error('Altura inválida para cálculo de IMC');
    }

    const heightMeters = heightCm / 100;
    const bmi = Number((weightKg / (heightMeters * heightMeters)).toFixed(1));

    if (bmi < 18.5) {
      return {
        bmi,
        category: 'Abaixo do peso',
        color: 'text-amber-500 bg-amber-50 border-amber-200',
        description: 'Abaixo da faixa de peso recomendada pela OMS.',
      };
    } else if (bmi <= 24.9) {
      return {
        bmi,
        category: 'Peso normal',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        description: 'Faixa saudável e ideal de peso para a sua altura.',
      };
    } else if (bmi <= 29.9) {
      return {
        bmi,
        category: 'Sobrepeso',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        description: 'Atenção aos hábitos alimentares e prática de exercícios.',
      };
    } else if (bmi <= 34.9) {
      return {
        bmi,
        category: 'Obesidade Grau I',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        description: 'Recomenda-se acompanhamento médico e nutricional.',
      };
    } else if (bmi <= 39.9) {
      return {
        bmi,
        category: 'Obesidade Grau II',
        color: 'text-red-600 bg-red-50 border-red-200',
        description: 'Risco cardiovascular aumentado. Busque orientação médica.',
      };
    } else {
      return {
        bmi,
        category: 'Obesidade Grau III',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        description: 'Obesidade severa/mórbida. Necessita de cuidados especializados.',
      };
    }
  }

  /**
   * Classifica a pressão arterial segundo as diretrizes da Sociedade Brasileira de Cardiologia (SBC) e AHA
   * Sistólica (PAS) e Diastólica (PAD)
   */
  static classifyBloodPressure(systolic: number, diastolic: number): BloodPressureCategory {
    if (systolic <= diastolic) {
      throw new Error('A pressão sistólica deve ser estritamente maior que a diastólica.');
    }
    if (systolic < 40 || systolic > 300 || diastolic < 30 || diastolic > 200) {
      throw new Error('Valores de pressão arterial fora dos limites fisiológicos aceitáveis.');
    }

    // Crise hipertensiva
    if (systolic >= 180 || diastolic >= 110) {
      return {
        category: 'Crise Hipertensiva',
        severity: 'critical',
        color: 'text-rose-700 bg-rose-100 border-rose-300',
        advice: 'Alerta médico: procure atendimento de urgência ou consulte seu cardiologista imediatamente.',
      };
    }

    // Hipertensão Estágio 2
    if (systolic >= 160 || diastolic >= 100) {
      return {
        category: 'Hipertensão Estágio 2',
        severity: 'danger',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        advice: 'Pressão significativamente elevada. Requer acompanhamento e ajuste terapêutico.',
      };
    }

    // Hipertensão Estágio 1
    if (systolic >= 140 || diastolic >= 90) {
      return {
        category: 'Hipertensão Estágio 1',
        severity: 'warning',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        advice: 'Níveis hipertensivos detectados. Monitore e converse com seu médico.',
      };
    }

    // Pré-hipertensão
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 85 && diastolic <= 89)) {
      return {
        category: 'Pré-hipertensão',
        severity: 'warning',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        advice: 'Níveis limítrofes. Reduza o sal e pratique atividades aeróbicas regulares.',
      };
    }

    // Normal
    if ((systolic >= 120 && systolic <= 129) || (diastolic >= 80 && diastolic <= 84)) {
      return {
        category: 'Normal',
        severity: 'info',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        advice: 'Pressão normal aceitável. Mantenha os bons hábitos.',
      };
    }

    // Ótima
    return {
      category: 'Ótima',
      severity: 'success',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      advice: 'Excelente controle pressórico! Abaixo de 120/80 mmHg.',
    };
  }

  /**
   * Classifica a glicose de acordo com as diretrizes da SBD (Sociedade Brasileira de Diabetes) e ADA
   */
  static classifyGlucose(valueMgDl: number, context: GlucoseContext = 'FASTING'): GlucoseCategory {
    if (valueMgDl <= 0 || valueMgDl > 700) {
      throw new Error('Valor de glicose fora dos limites medíveis comuns.');
    }

    // Hipoglicemia (geral para qualquer momento)
    if (valueMgDl < 70) {
      return {
        status: 'Hipoglicemia',
        severity: 'warning',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        advice: 'Glicemia baixa (<70 mg/dL). Consuma carboidrato de ação rápida (15g) e meça novamente.',
      };
    }

    // Em Jejum
    if (context === 'FASTING') {
      if (valueMgDl <= 99) {
        return {
          status: 'Normal',
          severity: 'success',
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          advice: 'Glicemia de jejum dentro do padrão saudável (< 100 mg/dL).',
        };
      } else if (valueMgDl <= 125) {
        return {
          status: 'Pré-diabetes / Elevada',
          severity: 'amber',
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          advice: 'Glicemia de jejum alterada (100 a 125 mg/dL). Fique atento à dieta e exames complementares.',
        };
      } else {
        return {
          status: 'Diabetes provável / Alta',
          severity: 'danger',
          color: 'text-rose-600 bg-rose-50 border-rose-200',
          advice: 'Glicemia de jejum elevada (≥ 126 mg/dL). Requer avaliação e confirmação médica.',
        };
      }
    }

    // Pós-refeição (1h a 2h após comer)
    if (context === 'POST_MEAL') {
      if (valueMgDl < 140) {
        return {
          status: 'Normal',
          severity: 'success',
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          advice: 'Glicemia pós-prandial excelente (< 140 mg/dL).',
        };
      } else if (valueMgDl < 200) {
        return {
          status: 'Pré-diabetes / Elevada',
          severity: 'amber',
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          advice: 'Glicemia pós-prandial moderadamente elevada (140 a 199 mg/dL).',
        };
      } else {
        return {
          status: 'Diabetes provável / Alta',
          severity: 'danger',
          color: 'text-rose-600 bg-rose-50 border-rose-200',
          advice: 'Glicose pós-prandial muito elevada (≥ 200 mg/dL). Consulte seu médico.',
        };
      }
    }

    // Outros momentos (Casual/Antes de dormir)
    if (valueMgDl <= 140) {
      return {
        status: 'Normal',
        severity: 'success',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        advice: 'Dentro dos parâmetros esperados para o momento.',
      };
    } else if (valueMgDl <= 180) {
      return {
        status: 'Pré-diabetes / Elevada',
        severity: 'amber',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        advice: 'Glicose levemente elevada.',
      };
    } else {
      return {
        status: 'Diabetes provável / Alta',
        severity: 'danger',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        advice: 'Glicose casual alta (≥ 180 mg/dL). Monitore com atenção.',
      };
    }
  }

  /**
   * Validação de consistência do registro de peso
   */
  static validateWeight(weightKg: number): void {
    if (!weightKg || weightKg < 20 || weightKg > 450) {
      throw new Error('O peso deve estar entre 20 kg e 450 kg.');
    }
  }

  /**
   * Validação de consistência do registro de altura
   */
  static validateHeight(heightCm: number): void {
    if (!heightCm || heightCm < 50 || heightCm > 280) {
      throw new Error('A altura deve estar entre 50 cm e 280 cm.');
    }
  }
}
