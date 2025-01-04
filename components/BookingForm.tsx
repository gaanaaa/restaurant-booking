import React, { useState, useEffect } from "react";

interface BookingData {
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
}

interface Booking {
  id: string;
  date: string;
  time: string;
}

// Custom Alert Component
const CustomAlert = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive";
}) => {
  const baseStyles = "p-4 rounded-md mb-4";
  const variantStyles = {
    default: "bg-blue-50 text-blue-700",
    destructive: "bg-red-50 text-red-700",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]}`}>{children}</div>
  );
};

const BookingForm = () => {
  // ... [Previous state definitions remain the same]
  const [bookingData, setBookingData] = useState<BookingData>({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    date: "",
    time: "12:00",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const baseTimeSlots = [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
  ];

  // ... [Previous useEffect and helper functions remain the same]
  useEffect(() => {
    const fetchBookings = async () => {
      if (!bookingData.date) return;

      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/api/bookings");
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        setExistingBookings(data);
      } catch (err) {
        setError("Failed to load availability. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [bookingData.date]);

  const getAvailableTimeSlots = () => {
    if (!bookingData.date) return baseTimeSlots;

    const bookedSlots = existingBookings
      .filter((booking) => booking.date === bookingData.date)
      .map((booking) => booking.time);

    return baseTimeSlots.filter((slot) => !bookedSlots.includes(slot));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "date") {
      setBookingData((prev) => ({
        ...prev,
        time: getAvailableTimeSlots()[0] || "12:00",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Booking failed");
      }

      setShowConfirmation(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking. Please try again."
      );
    }
  };

  if (showConfirmation) {
    return (
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Booking Confirmed!</h3>
          <p className="mb-2">Date: {bookingData.date}</p>
          <p className="mb-2">Time: {bookingData.time}</p>
          <p className="mb-2">Guests: {bookingData.guests}</p>
          <p className="mb-4">Name: {bookingData.name}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowConfirmation(false)}
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Book a Table</h2>

      {loading && <CustomAlert>Loading availability...</CustomAlert>}

      {bookingData.date && !loading && availableTimeSlots.length === 0 && (
        <CustomAlert variant="destructive">
          No time slots available for this date. Please select another date.
        </CustomAlert>
      )}

      {/* ... [Rest of the form JSX remains the same] ... */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={bookingData.name}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={bookingData.email}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={bookingData.phone}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Guests
          </label>
          <input
            type="number"
            name="guests"
            min="1"
            max="10"
            value={bookingData.guests}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={bookingData.date}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Time{" "}
            {availableTimeSlots.length > 0 &&
              `(${availableTimeSlots.length} slots available)`}
          </label>
          <select
            name="time"
            value={bookingData.time}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
            disabled={availableTimeSlots.length === 0}
          >
            {availableTimeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        {error && <CustomAlert variant="destructive">{error}</CustomAlert>}

        <button
          type="submit"
          disabled={availableTimeSlots.length === 0}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Book Table
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
