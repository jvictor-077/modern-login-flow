// Firebase Hooks - Export centralizado
// Use estes hooks no lugar dos hooks Supabase para migração para Firestore

export { FirebaseAuthProvider, useFirebaseAuth } from './useFirebaseAuth';
export { useFirestoreEstoque } from './useFirestoreEstoque';
export { 
  useFirestoreLanchoneteProdutos, 
  useFirestoreLanchonetePreparos, 
  useFirestoreLanchonetePedidos 
} from './useFirestoreLanchonete';
export { useFirestoreAlunos, useFirestoreAlunoByUserId } from './useFirestoreAlunos';
export { 
  useFirestoreReservas, 
  useFirestoreReservasPorData, 
  useFirestoreReservasPorAluno 
} from './useFirestoreReservas';
export { useFirestoreAulasRecorrentes } from './useFirestoreAulasRecorrentes';
export { 
  useFirestoreModalidadePrecos, 
  useFirestoreAulasAvulsasPrecos,
  useFirestoreConfiguracoes 
} from './useFirestorePrecos';

// Tipos
export type { ProdutoEstoque } from './useFirestoreEstoque';
export type { ProdutoLanchonete, ItemPreparo, Pedido, PedidoItem } from './useFirestoreLanchonete';
export type { AlunoFirestore } from './useFirestoreAlunos';
export type { ReservaFirestore, ReservaComAluno, StatusReserva } from './useFirestoreReservas';
export type { AulaRecorrenteFirestore } from './useFirestoreAulasRecorrentes';
export type { ModalidadePrecoFirestore, AulaAvulsaPrecoFirestore, ConfiguracaoFirestore } from './useFirestorePrecos';
