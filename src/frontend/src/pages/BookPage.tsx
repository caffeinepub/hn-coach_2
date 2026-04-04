import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Loader2,
  Video,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "../backend";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
  useBookAppointment,
  useCancelBooking,
  useGetAvailableTimeSlots,
  useGetUserBookings,
} from "../hooks/useQueries";

export function BookPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const { data: slots, isLoading: slotsLoading } =
    useGetAvailableTimeSlots(dateStr);
  const { data: bookings, isLoading: bookingsLoading } = useGetUserBookings();
  const bookAppointment = useBookAppointment();
  const cancelBooking = useCancelBooking();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleConfirmBooking = async () => {
    if (!dateStr || !selectedSlot) return;

    try {
      await bookAppointment.mutateAsync({
        date: dateStr,
        timeSlot: selectedSlot,
      });
      toast.success("Appointment booked successfully!");
      setSelectedSlot(null);
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  const handleCancelBooking = async (bookingId: bigint) => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled");
    } catch (err) {
      console.error("Cancel failed:", err);
      toast.error("Failed to cancel booking");
    }
  };

  const upcomingBookings =
    bookings?.filter((b) => b.status === BookingStatus.booked) || [];

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#0B2232" }}
      >
        <NavBar />

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,106,0,0.15)" }}
              >
                <CalendarCheck
                  className="w-5 h-5"
                  style={{ color: "#FF6A00" }}
                />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">
                  Book an Appointment
                </h1>
                <p className="text-sm" style={{ color: "#A8B6C3" }}>
                  Schedule a 40-minute coaching session · Available 6am – 10pm
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Calendar */}
              <div
                className="rounded-2xl p-6 border border-hnc-border shadow-card"
                style={{ background: "#112A3A" }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-wide mb-5"
                  style={{ color: "#A8B6C3" }}
                >
                  Select a Date
                </h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => isPastDate(date)}
                  className="rounded-xl w-full"
                  classNames={{
                    months: "flex flex-col",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-semibold text-white",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                      "text-hnc-muted rounded-md w-9 font-normal text-xs flex-1 text-center",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative flex-1 focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 mx-auto p-0 font-normal text-white aria-selected:opacity-100 hover:bg-white/10 rounded-full transition-colors",
                    day_selected: "text-white font-semibold rounded-full",
                    day_today: "font-bold",
                    day_outside: "opacity-30",
                    day_disabled: "opacity-25 cursor-not-allowed",
                  }}
                  styles={{
                    day_selected: { background: "#FF6A00" },
                    day_today: { border: "1px solid #FF6A00" },
                  }}
                  data-ocid="book.calendar.panel"
                />
              </div>

              {/* Time slots */}
              <div
                className="rounded-2xl p-6 border border-hnc-border shadow-card"
                style={{ background: "#112A3A" }}
              >
                <h2
                  className="text-sm font-semibold uppercase tracking-wide mb-5"
                  style={{ color: "#A8B6C3" }}
                >
                  {selectedDate
                    ? `Available Slots — ${format(selectedDate, "MMMM d")}`
                    : "Available Slots"}
                </h2>

                {!selectedDate ? (
                  <div
                    className="flex flex-col items-center justify-center h-48 text-center"
                    data-ocid="book.slots.empty_state"
                  >
                    <CalendarDays
                      className="w-10 h-10 mb-3 opacity-30"
                      style={{ color: "#FF6A00" }}
                    />
                    <p className="text-sm" style={{ color: "#A8B6C3" }}>
                      Select a date to see available time slots
                    </p>
                  </div>
                ) : slotsLoading ? (
                  <div
                    className="flex items-center justify-center h-48"
                    data-ocid="book.slots.loading_state"
                  >
                    <Loader2
                      className="w-6 h-6 animate-spin"
                      style={{ color: "#FF6A00" }}
                    />
                  </div>
                ) : !slots || slots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Clock
                      className="w-10 h-10 mb-3 opacity-30"
                      style={{ color: "#FF6A00" }}
                    />
                    <p className="text-sm" style={{ color: "#A8B6C3" }}>
                      No slots available for this date
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                      data-ocid="book.slots.panel"
                    >
                      {slots.map(([time, available], i) => (
                        <button
                          key={time}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedSlot(time)}
                          className={`px-2 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                            !available
                              ? "opacity-40 cursor-not-allowed"
                              : selectedSlot === time
                                ? "text-white border-transparent"
                                : "text-white border-hnc-border hover:border-orange-400"
                          }`}
                          style={{
                            background:
                              selectedSlot === time
                                ? "#FF6A00"
                                : available
                                  ? "#1A3A4F"
                                  : "#1A3A4F",
                            borderColor:
                              selectedSlot === time ? "#FF6A00" : undefined,
                          }}
                          data-ocid={`book.slots.item.${i + 1}`}
                        >
                          <Clock className="w-3 h-3 inline mr-1 opacity-70" />
                          {time}
                        </button>
                      ))}
                    </div>

                    {selectedSlot && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl border border-hnc-border"
                        style={{
                          background: "rgba(255,106,0,0.08)",
                          borderColor: "rgba(255,106,0,0.3)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Video
                            className="w-4 h-4"
                            style={{ color: "#FF6A00" }}
                          />
                          <span className="text-sm font-semibold text-white">
                            {format(selectedDate, "MMMM d, yyyy")} at{" "}
                            {selectedSlot}
                          </span>
                        </div>
                        <p
                          className="text-xs mb-3"
                          style={{ color: "#A8B6C3" }}
                        >
                          40-minute coaching session with your coach
                        </p>
                        <Button
                          onClick={handleConfirmBooking}
                          disabled={bookAppointment.isPending}
                          className="w-full h-10 font-semibold text-white rounded-xl"
                          style={{ background: "#FF6A00" }}
                          data-ocid="book.confirm.primary_button"
                        >
                          {bookAppointment.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                              Booking...
                            </>
                          ) : (
                            "Confirm Booking"
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming bookings */}
            <div
              className="rounded-2xl p-6 border border-hnc-border shadow-card"
              style={{ background: "#112A3A" }}
            >
              <h2
                className="text-sm font-semibold uppercase tracking-wide mb-5"
                style={{ color: "#A8B6C3" }}
              >
                Upcoming Sessions
              </h2>

              {bookingsLoading ? (
                <div
                  className="flex items-center justify-center h-16"
                  data-ocid="book.bookings.loading_state"
                >
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div
                  className="flex flex-col items-center py-8 text-center"
                  data-ocid="book.bookings.empty_state"
                >
                  <CalendarDays
                    className="w-10 h-10 mb-3 opacity-30"
                    style={{ color: "#FF6A00" }}
                  />
                  <p className="text-sm" style={{ color: "#A8B6C3" }}>
                    No upcoming sessions. Book your first one above!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking, i) => (
                    <motion.div
                      key={booking.id.toString()}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-hnc-border"
                      style={{ background: "#1A3A4F" }}
                      data-ocid={`book.bookings.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255,106,0,0.15)" }}
                        >
                          <Video
                            className="w-5 h-5"
                            style={{ color: "#FF6A00" }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {booking.date} · {booking.timeSlot}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#A8B6C3" }}
                          >
                            40-min coaching session
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className="text-xs font-medium"
                          style={{
                            background: "rgba(34,197,94,0.15)",
                            color: "#4ade80",
                            border: "1px solid rgba(34,197,94,0.3)",
                          }}
                        >
                          Booked
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancelBooking.isPending}
                          className="w-8 h-8 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          style={{ color: "#A8B6C3" }}
                          data-ocid={`book.bookings.delete_button.${i + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
