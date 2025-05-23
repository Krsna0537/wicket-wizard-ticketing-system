
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  amount: number;
  payment_status: string;
  booking_status: string;
  ticket_code: string;
  user_email: string;
  match: {
    team_a: string;
    team_b: string;
    match_date: string;
  };
  seat_info: {
    row_number: string;
    seat_number: string;
    stand_name: string;
    stadium_name: string;
  };
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    
    const { data: bookingsWithDetails, error } = await supabase
      .rpc('get_all_bookings_with_details')
      .order('booking_date', { ascending: false });
    
    if (error) {
      toast.error("Failed to fetch bookings");
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } else {
      setBookings(bookingsWithDetails || []);
    }
    
    setIsLoading(false);
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const { error } = await supabase
        .from("bookings")
        .update({
          booking_status: "cancelled"
        })
        .eq("id", id);
      
      if (error) {
        toast.error("Failed to cancel booking");
        console.error("Error cancelling booking:", error);
      } else {
        toast.success("Booking cancelled successfully");
        fetchBookings();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Booking Management</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : bookings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Code</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.ticket_code}</TableCell>
                    <TableCell>
                      {booking.match.team_a} vs {booking.match.team_b}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(booking.match.match_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      Row {booking.seat_info.row_number}, Seat {booking.seat_info.seat_number}
                      <div className="text-xs text-muted-foreground">
                        {booking.seat_info.stand_name}, {booking.seat_info.stadium_name}
                      </div>
                    </TableCell>
                    <TableCell>{booking.user_email}</TableCell>
                    <TableCell>{formatCurrency(booking.amount)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={`capitalize px-2 py-1 rounded-full text-xs font-semibold text-center ${
                          booking.booking_status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {booking.booking_status}
                        </span>
                        <span className={`capitalize px-2 py-1 rounded-full text-xs font-semibold text-center ${
                          booking.payment_status === "completed" ? "bg-green-100 text-green-800" : 
                          booking.payment_status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-red-100 text-red-800"
                        }`}>
                          {booking.payment_status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.booking_status === "confirmed" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No bookings yet</h3>
          <p className="text-muted-foreground">Bookings will appear here when users purchase tickets</p>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
