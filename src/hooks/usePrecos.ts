// Re-export Firestore hook for compatibility
export { 
  useFirestorePrecos as usePrecos,
  formatarPreco,
  type ModalidadePreco,
  type AulaAvulsaPreco,
  type Configuracao 
} from './firebase/useFirestorePrecos';
