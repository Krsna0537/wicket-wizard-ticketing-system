
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, MapPin } from "lucide-react";

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_date: string;
  description?: string;
  status: string;
  stadium: {
    id: string;
    name: string;
    location: string;
  };
}

interface Stand {
  id: string;
  name: string;
  category: string;
  capacity: number;
  base_price: number;
  description?: string;
}

interface MatchSeat {
  id: string;
  seat_id: string;
  price: number;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  seat: {
    id: string;
    row_number: string;
    seat_number: string;
    stand_id: string;
  };
}

const Match = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [stands, setStands] = useState<Stand[]>([]);
  const [selectedStand, setSelectedStand] = useState<string | null>(null);
  const [seats, setSeats] = useState<MatchSeat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<MatchSeat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);

  useEffect(() => {
    if (selectedStand) {
      fetchSeatsForStand(selectedStand);
    }
  }, [selectedStand]);

  const fetchMatchDetails = async () => {
    setIsLoading(true);
    
    // Fetch match details
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select(`
        id,
        team_a,
        team_b,
        match_date,
        description,
        status,
        stadium:stadium_id (
          id,
          name,
          location
        )
      `)
      .eq("id", matchId)
      .single();
    
    if (matchError) {
      toast.error("Failed to fetch match details");
      console.error("Error fetching match:", matchError);
    } else if (matchData) {
      setMatch(matchData);
      
      // Fetch stands for this stadium
      const { data: standsData, error: standsError } = await supabase
        .from("stands")
        .select("*")
        .eq("stadium_id", matchData.stadium.id)
        .order("name");
      
      if (standsError) {
        toast.error("Failed to fetch stands");
        console.error("Error fetching stands:", standsError);
      } else {
        setStands(standsData || []);
        if (standsData && standsData.length > 0) {
          setSelectedStand(standsData[0].id);
        }
      }
    }
    
    setIsLoading(false);
  };

  const fetchSeatsForStand = async (standId: string) => {
    if (!matchId) return;
    
    const { data, error } = await supabase
      .from("match_seats")
      .select(`
        id,
        seat_id,
        price,
        status,
        seat:seat_id (
          id,
          row_number,
          seat_number,
          stand_id
        )
      `)
      .eq("match_id", matchId)
      .eq("seat.stand_id", standId);
    
    if (error) {
      toast.error("Failed to fetch seats");
      console.error("Error fetching seats:", error);
    } else {
      setSeats(data || []);
      setSelectedSeat(null);
    }
  };

  const handleBookSeat = async () => {
    if (!user) {
      toast("Please sign in to book tickets", {
        description: "You need to be signed in to book tickets",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/auth"
        }
      });
      return;
    }
    
    if (!selectedSeat || !match) return;
    
    setIsBooking(true);
    
    // Generate a ticket code
    const ticketCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Create a booking
    const { error } = await supabase
      .from("bookings")
      .insert([
        {
          user_id: user.id,
          match_id: match.id,
          match_seat_id: selectedSeat.id,
          amount: selectedSeat.price,
          payment_status: "completed", // For simplicity, assuming payment is completed
          ticket_code: ticketCode
        }
      ]);
    
    if (error) {
      toast.error("Failed to book ticket");
      console.error("Error booking ticket:", error);
    } else {
      toast.success("Ticket booked successfully!");
      
      // Refresh seat data
      if (selectedStand) {
        fetchSeatsForStand(selectedStand);
      }
    }
    
    setIsBooking(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Group seats by row for better display
  const groupedSeats = seats.reduce((acc: Record<string, MatchSeat[]>, seat) => {
    const rowNumber = seat.seat.row_number;
    if (!acc[rowNumber]) {
      acc[rowNumber] = [];
    }
    acc[rowNumber].push(seat);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Match not found</h2>
        <p className="mb-6">The match you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link to="/" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to all matches
        </Link>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">
                  {match.team_a} vs {match.team_b}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(match.match_date)} at {formatTime(match.match_date)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{match.stadium.name}, {match.stadium.location}</span>
                  </div>
                </CardDescription>
              </div>
              <div>
                <span className={`capitalize px-3 py-1 rounded-full text-sm font-semibold ${
                  match.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                  match.status === "ongoing" ? "bg-green-100 text-green-800" :
                  match.status === "completed" ? "bg-gray-100 text-gray-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {match.status}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{match.description || "Join us for this exciting cricket match!"}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>

      {stands.length > 0 ? (
        <>
          <Tabs value={selectedStand || undefined} onValueChange={setSelectedStand} className="mb-6">
            <TabsList className="mb-4">
              {stands.map((stand) => (
                <TabsTrigger key={stand.id} value={stand.id}>
                  {stand.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {stands.map((stand) => (
              <TabsContent key={stand.id} value={stand.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{stand.name}</CardTitle>
                    <CardDescription>
                      {stand.category} - Base price: {formatCurrency(stand.base_price)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stand.description && <p className="mb-4">{stand.description}</p>}
                    
                    {Object.keys(groupedSeats).length > 0 ? (
                      <div className="space-y-6">
                        {Object.entries(groupedSeats).map(([rowNumber, rowSeats]) => (
                          <div key={rowNumber}>
                            <div className="font-medium mb-2">Row {rowNumber}</div>
                            <div className="flex flex-wrap gap-2">
                              {rowSeats.map((seat) => (
                                <button
                                  key={seat.id}
                                  className={`w-12 h-10 text-sm rounded ${
                                    seat.status === "available" 
                                      ? selectedSeat?.id === seat.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary hover:bg-secondary/80"
                                      : seat.status === "booked"
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-red-200 text-red-500 cursor-not-allowed"
                                  }`}
                                  onClick={() => seat.status === "available" && setSelectedSeat(seat)}
                                  disabled={seat.status !== "available"}
                                >
                                  {seat.seat.seat_number}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex items-center gap-4 mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-secondary rounded"></div>
                            <span className="text-sm">Available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-primary rounded"></div>
                            <span className="text-sm">Selected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <span className="text-sm">Booked</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-200 rounded"></div>
                            <span className="text-sm">Unavailable</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p>No seats available for this stand</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
          
          {selectedSeat && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Match:</span>
                    <span>{match.team_a} vs {match.team_b}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(match.match_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{formatTime(match.match_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span>{match.stadium.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stand:</span>
                    <span>{stands.find(s => s.id === selectedStand)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seat:</span>
                    <span>Row {selectedSeat.seat.row_number}, Seat {selectedSeat.seat.seat_number}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Price:</span>
                    <span>{formatCurrency(selectedSeat.price)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleBookSeat}
                  disabled={isBooking}
                >
                  {isBooking ? "Processing..." : "Book Ticket"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-lg mb-2">No seating information available for this match yet.</p>
          <p>Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default Match;
