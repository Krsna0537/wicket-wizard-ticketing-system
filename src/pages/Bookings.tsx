
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Ticket, MapPin } from "lucide-react";

interface Booking {
  id: string;
  booking_date: string;
  amount: number;
  payment_status: string;
  booking_status: string;
  ticket_code: string;
  match: {
    id: string;
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

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .rpc('get_user_bookings_with_details')
      .order('booking_date', { ascending: false });
    
    if (error) {
      toast.error("Failed to fetch bookings");
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } else {
      setBookings(data || []);
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {bookings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className={booking.booking_status === "cancelled" ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {booking.match.team_a} vs {booking.match.team_b}
                  </CardTitle>
                  <span className={`capitalize px-2 py-1 rounded-full text-xs font-semibold ${
                    booking.booking_status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {booking.booking_status}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="pb-0">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 shrink-0" />
                    <span>{formatDate(booking.match.match_date)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                    <span>
                      {booking.seat_info.stadium_name}
                      <br />
                      {booking.seat_info.stand_name}, Row {booking.seat_info.row_number}, Seat {booking.seat_info.seat_number}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Ticket className="h-4 w-4 mt-1 shrink-0" />
                    <div>
                      <div className="font-medium">{booking.ticket_code}</div>
                      <div className="text-muted-foreground text-sm">Ticket Code</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(booking.amount)}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      Payment: {booking.payment_status}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4">
                {booking.booking_status === "confirmed" ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to={`/match/${booking.match.id}`}>Book Again</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No bookings found</h3>
          <p className="text-muted-foreground mb-6">You haven't booked any tickets yet.</p>
          <Button asChild>
            <Link to="/">Browse Matches</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
