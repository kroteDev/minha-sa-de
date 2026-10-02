// Serviço de Exportação de Relatórios (PDF e Excel/CSV)
// Gera arquivos estruturados para documentação médica e análise

import {
  BloodPressureLog,
  GlucoseLog,
  HeightLog,
  User,
  WeightLog,
} from '../domain/entities';
import { HealthClassificationService } from '../domain/services/HealthClassificationService';

export class ReportExportService {
  /**
   * Exporta os dados consolidados de saúde no formato CSV compatível com Microsoft Excel (com UTF-8 BOM e ponto-e-vírgula)
   */
  static exportToExcel(
    user: User,
    glucose: GlucoseLog[],
    bp: BloodPressureLog[],
    weight: WeightLog[],
    height: HeightLog[]
  ): void {
    let csv = '\uFEFF'; // BOM para que o Excel abra acentuação em português corretamente

    // Cabeçalho do Paciente
    csv += `RELATÓRIO DE MONITORAMENTO DE SAÚDE - HEALTHTRACK\r\n`;
    csv += `Paciente;${user.name}\r\n`;
    csv += `Email;${user.email}\r\n`;
    csv += `Data de Emissão;${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\r\n\r\n`;

    // 1. Glicose
    csv += `--- REGISTROS DE GLICOSE ---\r\n`;
    csv += `Data/Hora;Valor (mg/dL);Momento;Classificação;Observações\r\n`;
    glucose.forEach((g) => {
      const cls = HealthClassificationService.classifyGlucose(g.value, g.context);
      const dateStr = new Date(g.measuredAt).toLocaleString('pt-BR');
      const contextStr =
        g.context === 'FASTING'
          ? 'Jejum'
          : g.context === 'POST_MEAL'
          ? 'Pós-refeição'
          : g.context === 'PRE_MEAL'
          ? 'Pré-refeição'
          : g.context === 'BEDTIME'
          ? 'Antes de dormir'
          : 'Casual';
      csv += `"${dateStr}";${g.value};"${contextStr}";"${cls.status}";"${g.notes || '-'}"\r\n`;
    });
    csv += `\r\n`;

    // 2. Pressão Arterial
    csv += `--- REGISTROS DE PRESSÃO ARTERIAL ---\r\n`;
    csv += `Data/Hora;Sistólica (mmHg);Diastólica (mmHg);Pulso (bpm);Classificação;Observações\r\n`;
    bp.forEach((b) => {
      let clsName = 'Não classificada';
      try {
        clsName = HealthClassificationService.classifyBloodPressure(b.systolic, b.diastolic).category;
      } catch {
        // Ignora erros em registros incompletos
      }
      const dateStr = new Date(b.measuredAt).toLocaleString('pt-BR');
      csv += `"${dateStr}";${b.systolic};${b.diastolic};${b.pulse || '-'};"${clsName}";"${b.notes || '-'}"\r\n`;
    });
    csv += `\r\n`;

    // 3. Peso & IMC
    const latestHeight = height[0]?.heightCm || null;
    csv += `--- REGISTROS DE PESO & IMC ---\r\n`;
    csv += `Data/Hora;Peso (kg);Altura Ref. (cm);IMC;Classificação OMS;Observações\r\n`;
    weight.forEach((w) => {
      let imcStr = '-';
      let imcCls = '-';
      if (latestHeight) {
        const bmiCalc = HealthClassificationService.calculateBMI(w.weightKg, latestHeight);
        imcStr = bmiCalc.bmi.toFixed(1).replace('.', ',');
        imcCls = bmiCalc.category;
      }
      const dateStr = new Date(w.measuredAt).toLocaleString('pt-BR');
      csv += `"${dateStr}";${w.weightKg.toString().replace('.', ',')};${latestHeight || '-'};${imcStr};"${imcCls}";"${w.notes || '-'}"\r\n`;
    });
    csv += `\r\n`;

    // 4. Altura
    csv += `--- HISTÓRICO DE ALTURA ---\r\n`;
    csv += `Data/Hora;Altura (cm);Observações\r\n`;
    height.forEach((h) => {
      const dateStr = new Date(h.measuredAt).toLocaleString('pt-BR');
      csv += `"${dateStr}";${h.heightCm.toString().replace('.', ',')};"${h.notes || '-'}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedName = user.name.toLowerCase().replace(/\s+/g, '_');
    link.download = `relatorio_saude_${sanitizedName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
