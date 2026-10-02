---
name: clinical-guidelines-validation
description: "Tabelas e regras clínicas oficiais (SBC/AHA para Pressão Arterial, SBD/ADA para Glicemia e OMS para IMC). Orienta validações fisiológicas, consistência de dados e mensagens de alerta clínico."
---

# 🩺 Skill: Validação de Padrões Clínicos e Regras Fisiológicas

O HealthTrack diferencia-se por utilizar regras médicas chanceladas por entidades oficiais de cardiologia, endocrinologia e saúde pública. Esta skill serve como referência canônica para implementar ou auditar regras clínicas.

---

## 1. Pressão Arterial (SBC / AHA)

Diretrizes da **Sociedade Brasileira de Cardiologia (SBC)** e **American Heart Association (AHA)**:

| Classificação | Pressão Sistólica (PAS) | Condição | Pressão Diastólica (PAD) | Cor / Badge no App |
|---|---|---|---|---|
| **Ótima** | < 120 mmHg | E | < 80 mmHg | `emerald` |
| **Normal** | 120 a 129 mmHg | E/OU | 80 a 84 mmHg | `teal` |
| **Pré-hipertensão** | 130 a 139 mmHg | E/OU | 85 a 89 mmHg | `amber` |
| **Hipertensão Estágio 1** | 140 a 159 mmHg | E/OU | 90 a 99 mmHg | `orange` |
| **Hipertensão Estágio 2** | 160 a 179 mmHg | E/OU | 100 a 109 mmHg | `rose` |
| **Crise Hipertensiva** | ≥ 180 mmHg | E/OU | ≥ 110 mmHg | `red / pulsed` |

### ⚠️ Inversão Fisiológica (Erro Físico):
- Se `PAS <= PAD`, a medição é **fisiologicamente impossível** em seres vivos. O sistema deve rejeitar ou emitir alerta de erro imediato no formulário.

---

## 2. Glicemia Capilar e Venosa (SBD / ADA)

Diretrizes da **Sociedade Brasileira de Diabetes (SBD)** e **American Diabetes Association (ADA)**:

### 2.1 Em Jejum (Fasting - mínimo 8h):
- **Hipoglicemia:** < 70 mg/dL (Alerta vermelho: risco de choque hipoglicêmico, orientar consumo imediato de carboidratos rápidos).
- **Normal:** 70 a 99 mg/dL
- **Pré-diabetes (Glicemia de Jejum Alterada):** 100 a 125 mg/dL
- **Diabetes Provável:** ≥ 126 mg/dL

### 2.2 Pós-prandial (2 horas após refeição):
- **Normal:** < 140 mg/dL
- **Tolerância Diminuída à Glicose:** 140 a 199 mg/dL
- **Diabetes Provável:** ≥ 200 mg/dL

### 2.3 Casual / Aleatória (A qualquer hora):
- **Normal:** < 140 mg/dL
- **Elevada:** 140 a 199 mg/dL
- **Sintomática / Alerta:** ≥ 200 mg/dL

---

## 3. Índice de Massa Corporal - IMC (OMS)

Fórmula: `Peso (kg) / [Altura (m)]²`

| Faixa de IMC | Classificação da OMS |
|---|---|
| `< 18.5` | Baixo Peso (Abaixo do peso ideal) |
| `18.5 – 24.9` | Eutrófico (Peso normal / saudável) |
| `25.0 – 29.9` | Sobrepeso (Pré-obesidade) |
| `30.0 – 34.9` | Obesidade Grau I |
| `35.0 – 39.9` | Obesidade Grau II (Severa) |
| `≥ 40.0` | Obesidade Grau III (Mórbida) |
