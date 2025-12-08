// Tipos centralizados para modelagem de reservas - prontos para PostgreSQL

// Representa uma quadra esportiva
export interface Court {
  id: string;
  name: string;
  sport_type: string; // beach_tennis, volei, futevolei, etc.
  is_active: boolean;
  created_at: Date;
}

// Horário de funcionamento por dia da semana
export interface OperatingHours {
  id: string;
  court_id: string;
  day_of_week: number; // 0 = domingo, 6 = sábado
  start_hour: number;
  end_hour: number;
  is_active: boolean;
}

// Preços por duração
export interface PricingRule {
  id: string;
  court_id: string;
  duration_hours: number;
  price: number;
  is_active: boolean;
}

// Aula recorrente mensal (admin)
export interface RecurringClass {
  id: string;
  court_id: string;
  class_type: string; // Pilates, Beach Tennis, Vôlei, etc.
  instructor_name?: string;
  days_of_week: number[]; // [1, 3, 5] = seg, qua, sex
  start_time: string; // "07:00"
  end_time: string; // "08:00"
  is_active: boolean;
  created_at: Date;
}

// Reserva avulsa (aluno ou admin)
export interface SingleBooking {
  id: string;
  court_id: string;
  user_id?: string; // null se for feita pelo admin
  client_name: string;
  client_phone?: string;
  date: Date;
  start_time: string; // "09:00"
  end_time: string; // "10:00"
  duration_hours: number;
  price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export type BookingStatus = 
  | "pending" // aguardando confirmação
  | "confirmed" // confirmada
  | "completed" // concluída
  | "cancelled"; // cancelada

export type PaymentStatus = 
  | "pending" // aguardando pagamento
  | "paid" // pago
  | "refunded"; // reembolsado

// Tipo unificado para exibição no calendário (admin)
export interface CalendarSlot {
  time: string; // "07:00 - 08:00"
  status: SlotStatus;
  label?: string;
  booking?: SingleBooking | RecurringClass;
}

export type SlotStatus = "free" | "recurring" | "single";

// Slot disponível para reserva (aluno)
export interface AvailableSlot {
  id: string;
  court_id: string;
  court_name: string;
  date: Date;
  start_time: string;
  end_time: string;
  is_available: boolean;
}
