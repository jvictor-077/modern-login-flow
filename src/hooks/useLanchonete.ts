// Re-export Firestore hooks for compatibility
export { 
  useFirestoreLanchoneteProdutos as useLanchoneteProdutos,
  useFirestoreLanchonetePreparos as useLanchonetePreparos,
  useFirestoreLanchonetePedidos as useLanchonetePedidos,
  type ProdutoLanchonete,
  type ItemPreparo,
  type Pedido,
  type PedidoItem 
} from './firebase/useFirestoreLanchonete';
