---
description: "Audita a base de código para garantir conformidade com Clean Architecture e ausência de lock-in com Vercel/serverless."
---

# Comando: `/check-architecture`

Executa uma auditoria automatizada de conformidade arquitetural no projeto.

## Regras Auditadas:

1. **Regra Sem Vercel:**
   - Nenhum arquivo `vercel.json` ou import de `@vercel/*` deve existir.
   - Nenhuma variável de ambiente de plataformas serverless de terceiros deve estar no código.

2. **Integridade das Camadas da Clean Architecture:**
   - Arquivos dentro de `src/domain/` não podem conter `import ... from 'react'` ou `@prisma/client`.
   - Os UseCases em `src/use-cases/` devem depender apenas de abstrações de repositório (`IHealthRepository`, `IUserRepository`, etc.).
   - Componentes de UI em `src/components/` não devem executar consultas diretas a banco de dados.

3. **Verificação de Tipagem Estrita:**
   - Executa `npm run lint` (`tsc --noEmit`).

Gere um relatório sumário indicando o status de cada camada arquitetural.
