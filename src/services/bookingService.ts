// Serviço de reservas - lógica de negócio centralizada
// Conectado ao Firestore

import { format, isSameDay, isBefore, isToday } from "date-fns";
import { 
  AvailableSlot, 
  CalendarSlot, 
  RecurringClass, 
  SingleBooking,
  SlotStatus
} from "@/types/booking";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Constantes
const COURT_ID = "court-1";
const COURT_NAME = "Quadra Principal";

// Dados locais para operações síncronas (cache)
let localRecurringClasses: RecurringClass[] = [];
let localSingleBookings: SingleBooking[] = [];

// Horários de funcionamento padrão
const defaultOperatingHours = [
  { day_of_week: 0, start_hour: 8, end_hour: 18 }, // Domingo
  { day_of_week: 1, start_hour: 7, end_hour: 22 }, // Segunda
  { day_of_week: 2, start_hour: 7, end_hour: 22 }, // Terça
  { day_of_week: 3, start_hour: 7, end_hour: 22 }, // Quarta
  { day_of_week: 4, start_hour: 7, end_hour: 22 }, // Quinta
  { day_of_week: 5, start_hour: 7, end_hour: 22 }, // Sexta
  { day_of_week: 6, start_hour: 8, end_hour: 20 }, // Sábado
];

// Preços padrão
const defaultPricingRules = [
  { duration_hours: 1, price: 60 },
  { duration_hours: 2, price: 100 },
];

// === QUADRA ===
export function getCourt() {
  return { id: COURT_ID, name: COURT_NAME, sport_type: "beach_tennis", is_active: true, created_at: new Date() };
}

export function getCourtId() {
  return COURT_ID;
}

export function getCourtName() {
  return COURT_NAME;
}

export function getCourts() {
  return [getCourt()];
}

export function getCourtById(courtId: string) {
  if (courtId === COURT_ID) return getCourt();
  return undefined;
}

// === HORÁRIOS DE FUNCIONAMENTO ===
export function getOperatingHoursForDay(dayOfWeek: number) {
  return defaultOperatingHours.filter(oh => oh.day_of_week === dayOfWeek);
}

export function generateTimeSlots(date: Date): string[] {
  const dayOfWeek = date.getDay();
  const hours = getOperatingHoursForDay(dayOfWeek);
  
  if (hours.length === 0) return [];
  
  const startHour = Math.min(...hours.map(h => h.start_hour));
  const endHour = Math.max(...hours.map(h => h.end_hour));
  
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour.toString().padStart(2, "0")}:00`;
    const end = `${(hour + 1).toString().padStart(2, "0")}:00`;
    slots.push(`${start} - ${end}`);
  }
  
  return slots;
}

export function getValidTimesForDay(dayOfWeek: number): string[] {
  const hours = getOperatingHoursForDay(dayOfWeek);
  if (hours.length === 0) return [];
  
  const startHour = Math.min(...hours.map(h => h.start_hour));
  const endHour = Math.max(...hours.map(h => h.end_hour));
  
  const times: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return times;
}

export function getAllValidTimes(): string[] {
  const times: string[] = [];
  for (let hour = 7; hour < 22; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return times;
}

// === PREÇOS ===
export function getPrice(courtId?: string, durationHours: number = 1): number {
  const rule = defaultPricingRules.find(p => p.duration_hours === durationHours);
  return rule?.price ?? durationHours * 60;
}

export function getPricingRules() {
  return defaultPricingRules;
}

// === AULAS RECORRENTES (do Firestore) ===
export async function fetchRecurringClasses(): Promise<RecurringClass[]> {
  const aulasQuery = query(
    collection(db, "aulas_recorrentes"),
    orderBy("horario_inicio")
  );
  const snapshot = await getDocs(aulasQuery);

  const classes: RecurringClass[] = snapshot.docs.map(doc => {
    const aula = doc.data();
    return {
      id: doc.id,
      court_id: COURT_ID,
      class_type: aula.modalidade,
      instructor_name: aula.professor,
      days_of_week: [aula.dia_semana],
      start_time: aula.horario_inicio?.slice(0, 5) || aula.horario_inicio,
      end_time: aula.horario_fim?.slice(0, 5) || aula.horario_fim,
      is_active: true,
      created_at: aula.created_at?.toDate?.() || new Date(),
      enrolled_students: [],
    };
  });

  localRecurringClasses = classes;
  return classes;
}

export function getRecurringClasses(): RecurringClass[] {
  return localRecurringClasses.filter(rc => rc.is_active);
}

export function getRecurringClassesForStudent(userId: string): RecurringClass[] {
  return localRecurringClasses.filter(
    rc => rc.is_active && rc.enrolled_students?.includes(userId)
  );
}

export function addRecurringClass(classData: Omit<RecurringClass, "id" | "created_at">): RecurringClass {
  const newClass: RecurringClass = {
    ...classData,
    id: `rc-${Date.now()}`,
    created_at: new Date(),
  };
  localRecurringClasses.push(newClass);
  return newClass;
}

export function deleteRecurringClass(classId: string): boolean {
  const index = localRecurringClasses.findIndex(rc => rc.id === classId);
  if (index !== -1) {
    localRecurringClasses[index].is_active = false;
    return true;
  }
  return false;
}

export function enrollStudent(classId: string, userId: string): boolean {
  const index = localRecurringClasses.findIndex(rc => rc.id === classId);
  if (index !== -1) {
    if (!localRecurringClasses[index].enrolled_students) {
      localRecurringClasses[index].enrolled_students = [];
    }
    if (!localRecurringClasses[index].enrolled_students!.includes(userId)) {
      localRecurringClasses[index].enrolled_students!.push(userId);
    }
    return true;
  }
  return false;
}

export function unenrollStudent(classId: string, userId: string): boolean {
  const index = localRecurringClasses.findIndex(rc => rc.id === classId);
  if (index !== -1 && localRecurringClasses[index].enrolled_students) {
    localRecurringClasses[index].enrolled_students = 
      localRecurringClasses[index].enrolled_students!.filter(id => id !== userId);
    return true;
  }
  return false;
}

// === RESERVAS AVULSAS ===
export function getSingleBookings(userId?: string): SingleBooking[] {
  if (userId) {
    return localSingleBookings.filter(sb => sb.user_id === userId);
  }
  return localSingleBookings;
}

export function getSingleBookingsForDate(date: Date): SingleBooking[] {
  return localSingleBookings.filter(sb => 
    isSameDay(sb.date, date) && 
    sb.status !== "cancelled"
  );
}

export function addSingleBooking(bookingData: Omit<SingleBooking, "id" | "created_at" | "updated_at">): SingleBooking {
  const newBooking: SingleBooking = {
    ...bookingData,
    id: `sb-${Date.now()}`,
    created_at: new Date(),
    updated_at: new Date(),
  };
  localSingleBookings.push(newBooking);
  return newBooking;
}

export function cancelBooking(bookingId: string): boolean {
  const index = localSingleBookings.findIndex(sb => sb.id === bookingId);
  if (index !== -1) {
    localSingleBookings[index].status = "cancelled";
    localSingleBookings[index].updated_at = new Date();
    return true;
  }
  return false;
}

// === VERIFICAÇÃO DE CONFLITOS ===
export function checkTimeConflict(
  date: Date,
  startTime: string,
  courtId: string,
  excludeBookingId?: string
): { hasConflict: boolean; conflictType?: "recurring" | "single"; conflictLabel?: string } {
  const dayOfWeek = date.getDay();
  const dateStr = format(date, "yyyy-MM-dd");
  
  for (const rc of localRecurringClasses) {
    if (!rc.is_active) continue;
    if (rc.court_id !== courtId) continue;
    if (rc.start_time === startTime && rc.days_of_week.includes(dayOfWeek)) {
      return { 
        hasConflict: true, 
        conflictType: "recurring", 
        conflictLabel: rc.class_type 
      };
    }
  }
  
  for (const sb of localSingleBookings) {
    if (sb.status === "cancelled") continue;
    if (sb.id === excludeBookingId) continue;
    if (sb.court_id !== courtId) continue;
    if (sb.start_time === startTime && format(sb.date, "yyyy-MM-dd") === dateStr) {
      return { 
        hasConflict: true, 
        conflictType: "single", 
        conflictLabel: sb.client_name 
      };
    }
  }
  
  return { hasConflict: false };
}

export function checkRecurringConflict(
  daysOfWeek: number[],
  startTime: string,
  courtId: string,
  excludeClassId?: string
): { hasConflict: boolean; conflictDay?: number; conflictLabel?: string } {
  for (const rc of localRecurringClasses) {
    if (!rc.is_active) continue;
    if (rc.id === excludeClassId) continue;
    if (rc.court_id !== courtId) continue;
    if (rc.start_time === startTime) {
      const conflictDay = daysOfWeek.find(d => rc.days_of_week.includes(d));
      if (conflictDay !== undefined) {
        return {
          hasConflict: true,
          conflictDay,
          conflictLabel: rc.class_type,
        };
      }
    }
  }
  return { hasConflict: false };
}

// === SLOTS DO CALENDÁRIO ===
export function getCalendarSlotsForDate(date: Date, courtId?: string): CalendarSlot[] {
  const timeSlots = generateTimeSlots(date);
  const dayOfWeek = date.getDay();
  const dateStr = format(date, "yyyy-MM-dd");
  
  return timeSlots.map(slot => {
    const slotTime = slot.split(" - ")[0];
    
    for (const rc of localRecurringClasses) {
      if (!rc.is_active) continue;
      if (courtId && rc.court_id !== courtId) continue;
      if (rc.start_time === slotTime && rc.days_of_week.includes(dayOfWeek)) {
        return {
          time: slot,
          status: "recurring" as SlotStatus,
          label: rc.class_type,
          booking: rc,
        };
      }
    }
    
    for (const sb of localSingleBookings) {
      if (sb.status === "cancelled") continue;
      if (courtId && sb.court_id !== courtId) continue;
      if (sb.start_time === slotTime && format(sb.date, "yyyy-MM-dd") === dateStr) {
        return {
          time: slot,
          status: "single" as SlotStatus,
          label: sb.client_name,
          booking: sb,
        };
      }
    }
    
    return {
      time: slot,
      status: "free" as SlotStatus,
    };
  });
}

// === SLOTS DISPONÍVEIS ===
export function getAvailableSlotsForDate(date: Date): AvailableSlot[] {
  if (isBefore(date, new Date()) && !isToday(date)) {
    return [];
  }
  
  const activeCourts = getCourts();
  const slots: AvailableSlot[] = [];
  
  for (const court of activeCourts) {
    const calendarSlots = getCalendarSlotsForDate(date, court.id);
    
    for (const calSlot of calendarSlots) {
      const [startTime, endTime] = calSlot.time.split(" - ");
      
      slots.push({
        id: `${court.id}-${format(date, "yyyy-MM-dd")}-${startTime}`,
        court_id: court.id,
        court_name: court.name,
        date,
        start_time: startTime,
        end_time: endTime,
        is_available: calSlot.status === "free",
      });
    }
  }
  
  return slots;
}

export function hasAvailableSlotsForDate(date: Date): boolean {
  const slots = getAvailableSlotsForDate(date);
  return slots.some(s => s.is_available);
}

// === UTILITÁRIOS ===
export function calculateEndTime(startTime: string, durationHours: number): string {
  const [hour] = startTime.split(":");
  const endHour = parseInt(hour) + durationHours;
  return `${endHour.toString().padStart(2, "0")}:00`;
}

export function isTimeValidForDay(time: string, dayOfWeek: number): boolean {
  const validTimes = getValidTimesForDay(dayOfWeek);
  return validTimes.includes(time);
}
