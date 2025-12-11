# Estrutura do Firestore - Arena Sports

Este documento descreve a estrutura de coleções e documentos do Firestore para o sistema Arena Sports.

## Visão Geral das Coleções

```
firestore-root/
├── users/                    # Usuários autenticados
├── profiles/                 # Perfis de usuários
├── alunos/                   # Alunos cadastrados
├── aulas_recorrentes/        # Aulas recorrentes/fixas
├── reservas/                 # Reservas de quadra
├── produtos_estoque/         # Estoque da arena
├── lanchonete_produtos/      # Produtos da lanchonete
├── lanchonete_itens_preparo/ # Itens de preparo da lanchonete
├── lanchonete_pedidos/       # Pedidos da lanchonete
├── modalidade_precos/        # Preços por modalidade
├── aulas_avulsas_precos/     # Preços de aulas avulsas
└── configuracoes/            # Configurações do sistema
```

---

## 1. Coleção: `users`

Usuários autenticados no sistema.

```typescript
interface User {
  uid: string;           // ID do Firebase Auth
  email: string;
  role: 'admin' | 'aluno' | 'lanchonete';
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

**Documento exemplo:**
```json
{
  "uid": "abc123xyz",
  "email": "usuario@email.com",
  "role": "aluno",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## 2. Coleção: `profiles`

Perfis públicos dos usuários.

```typescript
interface Profile {
  user_id: string;       // Referência ao users/uid
  nome: string;
  email: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 3. Coleção: `alunos`

Alunos cadastrados no sistema.

```typescript
interface Aluno {
  id: string;                    // ID do documento
  user_id?: string;              // Referência ao users/uid (opcional)
  nome: string;
  email: string;
  cpf?: string;
  celular?: string;
  data_nascimento?: string;      // Formato: "YYYY-MM-DD"
  endereco?: string;
  contato_emergencia?: string;
  tipo_sanguineo?: string;       // "A+", "A-", "AB+", "AB-", "B+", "B-", "O+", "O-"
  doencas?: string;
  alergias?: string;
  observacoes?: string;
  autoriza_imagem: boolean;
  situacao: 'em_dia' | 'pendente' | 'atrasado';
  pin?: string;                  // PIN de acesso
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Subcoleção: `alunos/{alunoId}/modalidades`

```typescript
interface AlunoModalidade {
  id: string;
  modalidade: string;    // "Beach Tennis", "Vôlei Adulto Noite", etc.
  plano: string;         // "Mensal", "Trimestral", etc.
  valor: number;
  created_at: Timestamp;
}
```

### Subcoleção: `alunos/{alunoId}/cronograma`

```typescript
interface CronogramaAula {
  id: string;
  modalidade: string;
  dia_semana: number;           // 0-6 (Domingo-Sábado)
  horario: string;              // "HH:mm"
  local: string;
  professor?: string;
  periodo: 'manha' | 'tarde' | 'noite';
  created_at: Timestamp;
}
```

---

## 4. Coleção: `aulas_recorrentes`

Aulas fixas/recorrentes do sistema.

```typescript
interface AulaRecorrente {
  id: string;
  modalidade: string;
  professor: string;
  dia_semana: number;           // 0-6 (Domingo-Sábado)
  horario_inicio: string;       // "HH:mm"
  horario_fim: string;          // "HH:mm"
  max_alunos?: number;
  created_at: Timestamp;
}
```

---

## 5. Coleção: `reservas`

Reservas de quadra.

```typescript
interface Reserva {
  id: string;
  aluno_id: string;             // Referência ao alunos/id
  data: string;                 // Formato: "YYYY-MM-DD"
  horario_inicio: string;       // "HH:mm"
  horario_fim: string;          // "HH:mm"
  status: 'pendente' | 'confirmada' | 'cancelada' | 'concluida';
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 6. Coleção: `produtos_estoque`

Estoque geral da arena.

```typescript
interface ProdutoEstoque {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 7. Coleção: `lanchonete_produtos`

Produtos disponíveis na lanchonete.

```typescript
interface LanchoneteProduto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria?: string;           // "Bebidas", "Salgados", "Açaí", etc.
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 8. Coleção: `lanchonete_itens_preparo`

Itens usados no preparo de produtos.

```typescript
interface ItemPreparo {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;              // "un", "kg", "L", etc.
  estoque_minimo: number;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 9. Coleção: `lanchonete_pedidos`

Pedidos da lanchonete.

```typescript
interface LanchonetePedido {
  id: string;
  cliente_nome: string;
  total: number;
  status: 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';
  observacoes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Subcoleção: `lanchonete_pedidos/{pedidoId}/itens`

```typescript
interface PedidoItem {
  id: string;
  produto_id: string;           // Referência ao lanchonete_produtos/id
  quantidade: number;
  preco_unitario: number;
  created_at: Timestamp;
}
```

---

## 10. Coleção: `modalidade_precos`

Tabela de preços por modalidade e plano.

```typescript
interface ModalidadePreco {
  id: string;
  modalidade: string;
  plano: string;
  valor: number;
  descricao?: string;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 11. Coleção: `aulas_avulsas_precos`

Preços de aulas avulsas.

```typescript
interface AulaAvulsaPreco {
  id: string;
  modalidade: string;
  valor: number;
  is_active: boolean;
  created_at: Timestamp;
}
```

---

## 12. Coleção: `configuracoes`

Configurações gerais do sistema.

```typescript
interface Configuracao {
  id: string;                   // Usar a chave como ID
  chave: string;
  valor: any;                   // JSON/objeto
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## Regras de Segurança Sugeridas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função auxiliar para verificar se é admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Função auxiliar para verificar se é lanchonete
    function isLanchonete() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'lanchonete';
    }
    
    // Função auxiliar para verificar autenticação
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Users - apenas leitura própria e admin gerencia
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
    }
    
    // Profiles
    match /profiles/{profileId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == resource.data.user_id;
    }
    
    // Alunos
    match /alunos/{alunoId} {
      allow read: if isAuthenticated();
      allow create: if true; // Cadastro público
      allow update, delete: if isAdmin() || request.auth.uid == resource.data.user_id;
      
      // Subcoleções
      match /modalidades/{modId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
      match /cronograma/{cronId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }
    
    // Aulas Recorrentes
    match /aulas_recorrentes/{aulaId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Reservas
    match /reservas/{reservaId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // Estoque
    match /produtos_estoque/{produtoId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Lanchonete Produtos
    match /lanchonete_produtos/{produtoId} {
      allow read: if true;
      allow write: if isAdmin() || isLanchonete();
    }
    
    // Lanchonete Itens Preparo
    match /lanchonete_itens_preparo/{itemId} {
      allow read: if true;
      allow write: if isAdmin() || isLanchonete();
    }
    
    // Lanchonete Pedidos
    match /lanchonete_pedidos/{pedidoId} {
      allow read: if true;
      allow write: if isAdmin() || isLanchonete();
      
      match /itens/{itemId} {
        allow read: if true;
        allow write: if isAdmin() || isLanchonete();
      }
    }
    
    // Preços
    match /modalidade_precos/{precoId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /aulas_avulsas_precos/{precoId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Configurações
    match /configuracoes/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## Índices Recomendados

Crie os seguintes índices compostos no Console do Firebase:

1. **reservas**: `aluno_id` (ASC) + `data` (ASC)
2. **reservas**: `data` (ASC) + `status` (ASC)
3. **aulas_recorrentes**: `dia_semana` (ASC) + `horario_inicio` (ASC)
4. **lanchonete_pedidos**: `status` (ASC) + `created_at` (DESC)
5. **produtos_estoque**: `is_active` (ASC) + `nome` (ASC)
6. **lanchonete_produtos**: `is_active` (ASC) + `categoria` (ASC)

---

## Migração de Dados

Para migrar os dados do Supabase para o Firestore:

1. **Exportar dados do Supabase** via SQL ou API
2. **Transformar formato** para JSON compatível com Firestore
3. **Importar via Admin SDK** ou Console do Firebase

### Script de Exemplo (Node.js com Admin SDK):

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateAlunos(alunosData) {
  const batch = db.batch();
  
  alunosData.forEach((aluno) => {
    const docRef = db.collection('alunos').doc(aluno.id);
    batch.set(docRef, {
      ...aluno,
      created_at: admin.firestore.Timestamp.fromDate(new Date(aluno.created_at)),
      updated_at: admin.firestore.Timestamp.fromDate(new Date(aluno.updated_at))
    });
  });
  
  await batch.commit();
  console.log('Alunos migrados com sucesso!');
}
```

---

## Notas Importantes

1. **Timestamps**: Use `serverTimestamp()` para `created_at` e `updated_at`
2. **IDs**: O Firestore pode gerar IDs automáticos ou você pode definir manualmente
3. **Referências**: Use strings de ID ao invés de DocumentReference para simplicidade
4. **Subcoleções vs Arrays**: Prefira subcoleções para listas que podem crescer muito
5. **Desnormalização**: Considere duplicar alguns dados para evitar múltiplas queries
