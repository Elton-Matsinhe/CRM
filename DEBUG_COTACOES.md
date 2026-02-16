# 🔍 Guia de Debug - Problema de Cotações Não Aparecendo

## Problemas Identificados e Corrigidos

### 1. ✅ Limite de Paginação
- **Problema**: O limite padrão era 10, então apenas as primeiras 10 cotações apareciam
- **Solução**: Aumentado o limite para 1000 na página de Acompanhamento

### 2. ✅ Filtro por Agente
- **Problema**: Se o usuário não for admin, apenas cotações do próprio agente aparecem
- **Solução**: Verificar se você está logado como admin. Se não, as cotações criadas por outros agentes não aparecerão

### 3. ✅ Logs de Debug Adicionados
- Logs no backend (controller e model)
- Logs no frontend (API service e páginas)
- Verifique o console do navegador e o terminal do backend

## Como Verificar o Problema

### 1. Verificar no Console do Navegador (F12)
Procure por estas mensagens:
- `🔍 [API] Requisição GET: /cotacoes?...`
- `📥 [API] Resposta recebida: ...`
- `✅ [Acompanhamento] Total de cotações formatadas: X`

### 2. Verificar no Terminal do Backend
Procure por estas mensagens:
- `🔍 [Backend] Listando cotações: ...`
- `📊 [Backend] Resultado: ...`
- `🔍 [Model] Query SQL: ...`
- `📊 [Model] Cotações encontradas: X`

### 3. Verificar o Role do Usuário
- Se você não for admin, apenas suas próprias cotações aparecerão
- Verifique no banco de dados: `SELECT * FROM usuarios WHERE email = 'seu_email'`

### 4. Verificar Cotações no Banco
Execute no banco de dados:
```sql
SELECT c.*, u.email as agente_email, u.role as agente_role 
FROM cotacoes c 
LEFT JOIN usuarios u ON c.agente_id = u.id 
ORDER BY c.created_at DESC;
```

## Próximos Passos

1. Abra o console do navegador (F12)
2. Navegue para a página de listagem de cotações
3. Verifique os logs no console
4. Compartilhe os logs se o problema persistir

