# Arena Sports Management - API Documentation

## Base URL
```
https://your-api-domain.com/api/v1
```

## Authentication
Todas as rotas (exceto cadastro público) requerem autenticação via JWT Bearer token.

```
Authorization: Bearer <jwt_token>
```

---

## Autenticação

### POST /auth/login
Realiza login do usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@email.com",
      "role": "admin"
    },
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha incorretos"
  }
}
```

### POST /auth/logout
Realiza logout do usuário.

**Response 200:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### POST /auth/refresh
Renova o token de acesso.

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token",
    "expires_in": 3600
  }
}
```

---

## Alunos

### GET /alunos
Lista todos os alunos. **Requer role: admin**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | int | Página (default: 1) |
| limit | int | Itens por página (default: 20, max: 100) |
| situacao | string | Filtrar por situação: em_dia, pendente, atrasado |
| search | string | Buscar por nome ou email |
| modalidade | string | Filtrar por modalidade |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "nome": "João Silva",
        "email": "joao@email.com",
        "cpf": "123.456.789-00",
        "celular": "(11) 99999-9999",
        "data_nascimento": "1990-05-15",
        "situacao": "em_dia",
        "modalidades": [
          {
            "id": "uuid",
            "modalidade": "Beach Tennis",
            "plano": "2x por semana",
            "valor": 250.00
          }
        ],
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

### GET /alunos/:id
Retorna detalhes de um aluno específico.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid or null",
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "123.456.789-00",
    "celular": "(11) 99999-9999",
    "data_nascimento": "1990-05-15",
    "endereco": "Rua das Flores, 123",
    "contato_emergencia": "(11) 88888-8888",
    "tipo_sanguineo": "O+",
    "doencas": null,
    "alergias": null,
    "observacoes": null,
    "autoriza_imagem": true,
    "situacao": "em_dia",
    "pin": "1234",
    "modalidades": [
      {
        "id": "uuid",
        "modalidade": "Beach Tennis",
        "plano": "2x por semana",
        "valor": 250.00
      }
    ],
    "cronograma": [
      {
        "id": "uuid",
        "modalidade": "Beach Tennis",
        "dia_semana": 1,
        "horario": "18:00",
        "local": "Quadra 1",
        "professor": "Carlos",
        "periodo": "noite"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Aluno não encontrado"
  }
}
```

### POST /alunos
Cria um novo aluno. **Público para cadastro inicial**

**Request Body:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "cpf": "987.654.321-00",
  "celular": "(11) 97777-7777",
  "data_nascimento": "1995-08-20",
  "endereco": "Av. Paulista, 1000",
  "contato_emergencia": "(11) 96666-6666",
  "tipo_sanguineo": "A+",
  "doencas": null,
  "alergias": "Amendoim",
  "observacoes": null,
  "autoriza_imagem": true,
  "modalidades": [
    {
      "modalidade": "Vôlei Adulto Noite",
      "plano": "Mensal",
      "valor": 180.00
    }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Cadastro realizado com sucesso. Aguarde aprovação."
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      { "field": "email", "message": "Email já cadastrado" }
    ]
  }
}
```

### PUT /alunos/:id
Atualiza dados de um aluno. **Requer role: admin ou próprio aluno**

**Request Body:** (campos parciais aceitos)
```json
{
  "nome": "Maria Santos Silva",
  "celular": "(11) 95555-5555",
  "situacao": "em_dia"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "updated_at": "2024-01-21T10:00:00Z"
  }
}
```

### DELETE /alunos/:id
Remove um aluno. **Requer role: admin**

**Response 200:**
```json
{
  "success": true,
  "message": "Aluno removido com sucesso"
}
```

---

## Modalidades do Aluno

### GET /alunos/:id/modalidades
Lista modalidades de um aluno.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "modalidade": "Beach Tennis",
      "plano": "2x por semana",
      "valor": 250.00,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /alunos/:id/modalidades
Adiciona modalidade a um aluno. **Requer role: admin**

**Request Body:**
```json
{
  "modalidade": "Funcional",
  "plano": "Mensal",
  "valor": 150.00
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

### DELETE /alunos/:id/modalidades/:modalidade_id
Remove modalidade de um aluno. **Requer role: admin**

**Response 200:**
```json
{
  "success": true,
  "message": "Modalidade removida com sucesso"
}
```

---

## Cronograma de Aulas

### GET /alunos/:id/cronograma
Retorna cronograma de aulas do aluno.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "modalidade": "Beach Tennis",
      "dia_semana": 1,
      "dia_semana_label": "Segunda-feira",
      "horario": "18:00",
      "local": "Quadra 1",
      "professor": "Carlos",
      "periodo": "noite"
    },
    {
      "id": "uuid",
      "modalidade": "Beach Tennis",
      "dia_semana": 3,
      "dia_semana_label": "Quarta-feira",
      "horario": "18:00",
      "local": "Quadra 1",
      "professor": "Carlos",
      "periodo": "noite"
    }
  ]
}
```

### POST /alunos/:id/cronograma
Adiciona aula ao cronograma. **Requer role: admin**

**Request Body:**
```json
{
  "modalidade": "Beach Tennis",
  "dia_semana": 5,
  "horario": "19:00",
  "local": "Quadra 2",
  "professor": "Carlos",
  "periodo": "noite"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

### DELETE /cronograma/:id
Remove aula do cronograma. **Requer role: admin**

**Response 200:**
```json
{
  "success": true,
  "message": "Aula removida do cronograma"
}
```

---

## Aulas Recorrentes (Grade Horária)

### GET /aulas-recorrentes
Lista todas as aulas da grade.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| dia_semana | int | Filtrar por dia (0-6) |
| modalidade | string | Filtrar por modalidade |
| professor | string | Filtrar por professor |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "modalidade": "Beach Tennis",
      "professor": "Carlos",
      "dia_semana": 1,
      "dia_semana_label": "Segunda-feira",
      "horario_inicio": "07:00",
      "horario_fim": "08:00",
      "max_alunos": 8
    }
  ]
}
```

### POST /aulas-recorrentes
Cria nova aula na grade. **Requer role: admin**

**Request Body:**
```json
{
  "modalidade": "Vôlei Teen",
  "professor": "Ana",
  "dia_semana": 2,
  "horario_inicio": "14:00",
  "horario_fim": "15:00",
  "max_alunos": 12
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

### PUT /aulas-recorrentes/:id
Atualiza aula da grade. **Requer role: admin**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

### DELETE /aulas-recorrentes/:id
Remove aula da grade. **Requer role: admin**

**Response 200:**
```json
{
  "success": true,
  "message": "Aula removida com sucesso"
}
```

---

## Dashboard Admin

### GET /dashboard/stats
Retorna estatísticas do dashboard administrativo. **Requer role: admin**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reservas_hoje": 12,
    "usuarios_ativos": 48,
    "horas_reservadas": 86,
    "taxa_ocupacao": 78,
    "tendencia_reservas": "+3",
    "tendencia_usuarios": "+5",
    "tendencia_horas": "+12h",
    "tendencia_ocupacao": "+8%"
  }
}
```

### GET /dashboard/reservas-do-dia
Retorna todas as reservas de uma data específica. **Requer role: admin**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| data | date | Data desejada (YYYY-MM-DD) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "aluno_id": "uuid",
      "aluno": {
        "id": "uuid",
        "nome": "João Silva",
        "email": "joao@email.com",
        "celular": "11999999999"
      },
      "data": "2024-01-25",
      "horario_inicio": "14:00",
      "horario_fim": "15:00",
      "status": "confirmada",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### GET /dashboard/ocupacao
Retorna dados de ocupação por período. **Requer role: admin**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| data_inicio | date | Data inicial (YYYY-MM-DD) |
| data_fim | date | Data final (YYYY-MM-DD) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_slots": 450,
    "slots_ocupados": 351,
    "taxa_ocupacao_media": 78,
    "por_dia": [
      { "data": "2024-01-20", "ocupacao": 75 },
      { "data": "2024-01-21", "ocupacao": 82 }
    ]
  }
}
```

---

## Reservas

### GET /reservas
Lista reservas. **Admin vê todas, aluno vê as suas**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| data_inicio | date | Data inicial (YYYY-MM-DD) |
| data_fim | date | Data final (YYYY-MM-DD) |
| status | string | pendente, confirmada, cancelada, concluida |
| aluno_id | uuid | Filtrar por aluno (admin only) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "aluno_id": "uuid",
      "aluno_nome": "João Silva",
      "data": "2024-01-25",
      "horario_inicio": "14:00",
      "horario_fim": "15:00",
      "status": "confirmada",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### GET /reservas/disponibilidade
Retorna horários disponíveis para uma data.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| data | date | Data desejada (YYYY-MM-DD) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "data": "2024-01-25",
    "horarios_disponiveis": [
      { "inicio": "09:00", "fim": "10:00" },
      { "inicio": "10:00", "fim": "11:00" },
      { "inicio": "14:00", "fim": "15:00" }
    ],
    "horarios_ocupados": [
      { 
        "inicio": "07:00", 
        "fim": "08:00", 
        "tipo": "aula_recorrente",
        "descricao": "Beach Tennis - Carlos"
      },
      { 
        "inicio": "18:00", 
        "fim": "19:00", 
        "tipo": "reserva",
        "descricao": "Reserva confirmada"
      }
    ]
  }
}
```

### POST /reservas
Cria nova reserva.

**Request Body:**
```json
{
  "data": "2024-01-25",
  "horario_inicio": "14:00",
  "horario_fim": "15:00"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pendente",
    "message": "Reserva criada. Aguardando confirmação."
  }
}
```

**Response 409:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Horário não disponível"
  }
}
```

### PUT /reservas/:id
Atualiza status da reserva. **Requer role: admin ou próprio aluno**

**Request Body:**
```json
{
  "status": "cancelada"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelada"
  }
}
```

### DELETE /reservas/:id
Cancela/remove reserva. **Requer role: admin**

**Response 200:**
```json
{
  "success": true,
  "message": "Reserva removida"
}
```

---

## Usuários e Perfis

### GET /me
Retorna dados do usuário logado.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "usuario@email.com",
    "role": "aluno",
    "profile": {
      "id": "uuid",
      "nome": "João Silva"
    },
    "aluno": {
      "id": "uuid",
      "situacao": "em_dia"
    }
  }
}
```

### PUT /me/profile
Atualiza perfil do usuário logado.

**Request Body:**
```json
{
  "nome": "João da Silva"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "updated_at": "2024-01-21T10:00:00Z"
  }
}
```

---

## Códigos de Erro

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Dados inválidos |
| UNAUTHORIZED | 401 | Token inválido ou expirado |
| FORBIDDEN | 403 | Sem permissão para o recurso |
| NOT_FOUND | 404 | Recurso não encontrado |
| CONFLICT | 409 | Conflito (ex: email duplicado) |
| INTERNAL_ERROR | 500 | Erro interno do servidor |

---

## Tipos de Dados

### Situação do Aluno (situacao_aluno)
- `em_dia` - Mensalidade em dia
- `pendente` - Aguardando pagamento/aprovação
- `atrasado` - Mensalidade atrasada

### Status da Reserva (status_reserva)
- `pendente` - Aguardando confirmação
- `confirmada` - Reserva confirmada
- `cancelada` - Reserva cancelada
- `concluida` - Reserva concluída

### Período da Aula (periodo_aula)
- `manhã` - 06:00 às 12:00
- `tarde` - 12:00 às 18:00
- `noite` - 18:00 às 22:00

### Papéis (app_role)
- `admin` - Administrador do sistema
- `aluno` - Aluno matriculado
- `lanchonete` - Operador da lanchonete

### Modalidades Disponíveis
- Beach Tennis
- Vôlei Adulto Noite
- Vôlei Adulto Manhã
- Vôlei Teen
- Futevôlei
- Funcional

### Planos Disponíveis
- Mensal
- Trimestral
- 1x por semana
- 2x por semana
- 3x por semana
- Aula Avulsa

### Tipos Sanguíneos
- A+, A-, AB+, AB-, B+, B-, O+, O-

### Dias da Semana
| Valor | Abreviação | Nome Completo |
|-------|------------|---------------|
| 0 | Dom | Domingo |
| 1 | Seg | Segunda-feira |
| 2 | Ter | Terça-feira |
| 3 | Qua | Quarta-feira |
| 4 | Qui | Quinta-feira |
| 5 | Sex | Sexta-feira |
| 6 | Sab | Sábado |
