import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { TimeSlotGrid } from "@/components/admin/TimeSlotGrid";
import { NewBookingModal, Booking } from "@/components/admin/NewBookingModal";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleAddBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  const stats = [
    { label: "Reservas Hoje", value: "12", icon: CalendarDays, trend: "+3" },
    { label: "Usuários Ativos", value: "48", icon: Users, trend: "+5" },
    { label: "Horas Reservadas", value: "86h", icon: Clock, trend: "+12h" },
    { label: "Taxa de Ocupação", value: "78%", icon: TrendingUp, trend: "+8%" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-lg font-display font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-display font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content - Calendar + Time Slots */}
            <div className="grid lg:grid-cols-[380px_1fr] gap-6">
              {/* Calendar Section */}
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Calendário
                    </CardTitle>
                    <NewBookingModal bookings={bookings} onAddBooking={handleAddBooking} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ptBR}
                    className="rounded-lg border border-border/50 p-3 pointer-events-auto"
                  />
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Data selecionada:</p>
                    <p className="font-display font-semibold text-foreground">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots Section */}
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 h-full">
                  <TimeSlotGrid selectedDate={selectedDate} bookings={bookings} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
