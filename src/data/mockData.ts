// Dados mockados centralizados - simula o banco de dados PostgreSQL

import { 
  Court, 
  OperatingHours, 
  PricingRule, 
  RecurringClass, 
  SingleBooking 
} from "@/types/booking";

// === QUADRAS ===
export const courts: Court[] = [
  {
    id: "court-1",
    name: "Quadra 1",
    sport_type: "beach_tennis",
    is_active: true,
    created_at: new Date("2024-01-01"),
  },
  {
    id: "court-2",
    name: "Quadra 2",
    sport_type: "volei",
    is_active: true,
    created_at: new Date("2024-01-01"),
  },
];

// === HORÁRIOS DE FUNCIONAMENTO ===
// Dias úteis: 07:00 - 22:00
// Sábado: 08:00 - 22:00
// Domingo: 08:00 - 20:00
export const operatingHours: OperatingHours[] = [
  // Quadra 1
  { id: "oh-1", court_id: "court-1", day_of_week: 0, start_hour: 8, end_hour: 20, is_active: true },
  { id: "oh-2", court_id: "court-1", day_of_week: 1, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-3", court_id: "court-1", day_of_week: 2, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-4", court_id: "court-1", day_of_week: 3, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-5", court_id: "court-1", day_of_week: 4, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-6", court_id: "court-1", day_of_week: 5, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-7", court_id: "court-1", day_of_week: 6, start_hour: 8, end_hour: 22, is_active: true },
  // Quadra 2
  { id: "oh-8", court_id: "court-2", day_of_week: 0, start_hour: 8, end_hour: 20, is_active: true },
  { id: "oh-9", court_id: "court-2", day_of_week: 1, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-10", court_id: "court-2", day_of_week: 2, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-11", court_id: "court-2", day_of_week: 3, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-12", court_id: "court-2", day_of_week: 4, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-13", court_id: "court-2", day_of_week: 5, start_hour: 7, end_hour: 22, is_active: true },
  { id: "oh-14", court_id: "court-2", day_of_week: 6, start_hour: 8, end_hour: 22, is_active: true },
];

// === PREÇOS ===
export const pricingRules: PricingRule[] = [
  { id: "price-1", court_id: "court-1", duration_hours: 1, price: 60, is_active: true },
  { id: "price-2", court_id: "court-1", duration_hours: 2, price: 120, is_active: true },
  { id: "price-3", court_id: "court-2", duration_hours: 1, price: 60, is_active: true },
  { id: "price-4", court_id: "court-2", duration_hours: 2, price: 120, is_active: true },
];

// === AULAS RECORRENTES (MENSAIS) ===
export const recurringClasses: RecurringClass[] = [
  {
    id: "rc-1",
    court_id: "court-1",
    class_type: "Beach Tennis",
    instructor_name: "Prof. Carlos",
    days_of_week: [1, 3, 5], // seg, qua, sex
    start_time: "07:00",
    end_time: "08:00",
    is_active: true,
    created_at: new Date("2024-06-01"),
  },
  {
    id: "rc-2",
    court_id: "court-2",
    class_type: "Vôlei",
    instructor_name: "Prof. Ana",
    days_of_week: [2, 4], // ter, qui
    start_time: "18:00",
    end_time: "19:00",
    is_active: true,
    created_at: new Date("2024-06-01"),
  },
];

// === RESERVAS AVULSAS ===
export const singleBookings: SingleBooking[] = [
  {
    id: "sb-1",
    court_id: "court-1",
    user_id: "user-1",
    client_name: "João Silva",
    date: new Date(2025, 11, 15),
    start_time: "09:00",
    end_time: "10:00",
    duration_hours: 1,
    price: 60,
    status: "confirmed",
    payment_status: "paid",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "sb-2",
    court_id: "court-2",
    user_id: "user-1",
    client_name: "João Silva",
    date: new Date(2025, 11, 18),
    start_time: "14:00",
    end_time: "16:00",
    duration_hours: 2,
    price: 120,
    status: "confirmed",
    payment_status: "paid",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "sb-3",
    court_id: "court-1",
    user_id: "user-1",
    client_name: "João Silva",
    date: new Date(2025, 11, 10),
    start_time: "10:00",
    end_time: "11:00",
    duration_hours: 1,
    price: 60,
    status: "completed",
    payment_status: "paid",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "sb-4",
    court_id: "court-2",
    user_id: "user-1",
    client_name: "João Silva",
    date: new Date(2025, 11, 5),
    start_time: "15:00",
    end_time: "17:00",
    duration_hours: 2,
    price: 120,
    status: "completed",
    payment_status: "paid",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "sb-5",
    court_id: "court-1",
    user_id: undefined,
    client_name: "Maria Oliveira",
    client_phone: "(11) 99999-0000",
    date: new Date(2025, 11, 20),
    start_time: "10:00",
    end_time: "11:00",
    duration_hours: 1,
    price: 60,
    status: "confirmed",
    payment_status: "pending",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Tipos de aulas disponíveis
export const CLASS_TYPES = [
  "Funcional",
  "Vôlei Adulto Noite",
  "Vôlei Teen",
  "Vôlei Adulto Manhã",
  "Beach Tennis",
  "Futevôlei",
];

// Dias da semana
export const DAYS_OF_WEEK = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
];
