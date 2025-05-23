
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_date: string;
  stadium: {
    id: string;
    name: string;
  };
}

interface Stand {
  id: string;
  name: string;
  capacity: number;
  base_price: number;
}

interface Seat {
  id: string;
  row_number: string;
  seat_number: string;
  stand_id: string;
}

interface MatchSeat {
  id?: string; // Optional for new seats
  seat_id: string;
  price: number;
  status: string;
}

const AdminMatchSeats = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [stands, setStands] = useState<Stand[]>([]);
  const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [matchSeats, setMatchSeats] = useState<Record<string, MatchSeat>>({});
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [priceMultiplier, setPriceMultiplier] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);

  useEffect(() => {
    if (match?.stadium?.id) {
      fetchStands(match.stadium.id);
    }
  }, [match]);

  useEffect(() => {
    if (selectedStandId) {
      fetchSeats(selectedStandId);
    }
  }, [selectedStandId]);

  const fetchMatchDetails = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        team_a,
        team_b,
        match_date,
        stadium:stadium_id (
          id,
          name
        )
      `)
      .eq("id", matchId)
      .single();
    
    if (error) {
      toast.error("Failed to fetch match details");
      console.error("Error fetching match:", error);
    } else {
      setMatch(data);
    }
    
    setIsLoading(false);
  };

  const fetchStands = async (stadiumId: string) => {
    const { data, error } = await supabase
      .from("stands")
      .select("id, name, capacity, base_price")
      .eq("stadium_id", stadiumId)
      .order("name");
    
    if (error) {
      toast.error("Failed to fetch stands");
      console.error("Error fetching stands:", error);
    } else {
      setStands(data || []);
      if (data && data.length > 0) {
        setSelectedStandId(data[0].id);
      }
    }
  };

  const fetchSeats = async (standId: string) => {
    const [seatsResult, matchSeatsResult] = await Promise.all([
      // Fetch all seats for this stand
      supabase
        .from("seats")
        .select("id, row_number, seat_number, stand_id")
        .eq("stand_id", standId)
        .order("row_number")
        .order("seat_number"),
      
      // Fetch existing match seats for this match and stand
      supabase
        .from("match_seats")
        .select(`
          id,
          seat_id,
          price,
          status,
          seat:seat_id (
            stand_id
          )
        `)
        .eq("match_id", matchId)
        .filter("seat.stand_id", "eq", standId)
    ]);
    
    if (seatsResult.error) {
      toast.error("Failed to fetch seats");
      console.error("Error fetching seats:", seatsResult.error);
    } else {
      setSeats(seatsResult.data || []);
      
      // Initialize match seats object
      const matchSeatsMap: Record<string, MatchSeat> = {};
      
      // Get stand price
      const currentStand = stands.find(s => s.id === standId);
      const basePrice = currentStand ? currentStand.base_price : 0;
      
      // Set defaults for all seats
      seatsResult.data?.forEach((seat) => {
        matchSeatsMap[seat.id] = {
          seat_id: seat.id,
          price: basePrice,
          status: "available"
        };
      });
      
      // Update with existing match seats
      if (!matchSeatsResult.error) {
        matchSeatsResult.data?.forEach((matchSeat) => {
          matchSeatsMap[matchSeat.seat_id] = {
            id: matchSeat.id,
            seat_id: matchSeat.seat_id,
            price: matchSeat.price,
            status: matchSeat.status
          };
        });
      } else {
        console.error("Error fetching match seats:", matchSeatsResult.error);
      }
      
      setMatchSeats(matchSeatsMap);
    }
  };

  const handleSaveSeats = async () => {
    if (!matchId) return;
    
    setIsSaving(true);
    
    const matchSeatsArray = Object.values(matchSeats);
    const toUpsert = matchSeatsArray.map(seat => ({
      ...seat,
      match_id: matchId
    }));
    
    const { error } = await supabase
      .from("match_seats")
      .upsert(toUpsert);
    
    if (error) {
      toast.error("Failed to save seats");
      console.error("Error saving seats:", error);
    } else {
      toast.success("Seats saved successfully");
      fetchSeats(selectedStandId!);
    }
    
    setIsSaving(false);
  };

  const handleSeatStatusChange = (seatId: string, status: string) => {
    setMatchSeats(prev => ({
      ...prev,
      [seatId]: {
        ...prev[seatId],
        status
      }
    }));
  };

  const handlePriceChange = (seatId: string, price: string) => {
    const numPrice = parseFloat(price);
    if (!isNaN(numPrice) && numPrice >= 0) {
      setMatchSeats(prev => ({
        ...prev,
        [seatId]: {
          ...prev[seatId],
          price: numPrice
        }
      }));
    }
  };

  const applyBulkPricing = () => {
    const stand = stands.find(s => s.id === selectedStandId);
    if (!stand) return;
    
    const basePrice = stand.base_price;
    const newPrice = basePrice * priceMultiplier;
    
    // Update all seat prices
    const updatedMatchSeats = { ...matchSeats };
    Object.keys(updatedMatchSeats).forEach(seatId => {
      updatedMatchSeats[seatId] = {
        ...updatedMatchSeats[seatId],
        price: newPrice
      };
    });
    
    setMatchSeats(updatedMatchSeats);
    setIsPricingDialogOpen(false);
  };

  // Group seats by row for better display
  const groupedSeats = seats.reduce((acc: Record<string, Seat[]>, seat) => {
    const rowNumber = seat.row_number;
    if (!acc[rowNumber]) {
      acc[rowNumber] = [];
    }
    acc[rowNumber].push(seat);
    return acc;
  }, {});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
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
      <div className="mb-6">
        <Link to="/admin" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Admin Dashboard
        </Link>
      </div>
      
      {match && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Match Seat Configuration</CardTitle>
              <CardDescription>
                {match.team_a} vs {match.team_b} - {formatDate(match.match_date)} at {match.stadium.name}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
      
      {stands.length > 0 ? (
        <div className="mb-6">
          <Tabs value={selectedStandId || undefined} onValueChange={setSelectedStandId}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                {stands.map((stand) => (
                  <TabsTrigger key={stand.id} value={stand.id}>
                    {stand.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex gap-2">
                <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Set Pricing</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Pricing for All Seats</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="price-multiplier">Price Multiplier</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="price-multiplier"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={priceMultiplier}
                            onChange={(e) => setPriceMultiplier(parseFloat(e.target.value) || 1)}
                          />
                          <span>x base price</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Base price for this stand: ${stands.find(s => s.id === selectedStandId)?.base_price.toFixed(2)}
                        </div>
                      </div>
                      <Button onClick={applyBulkPricing} className="w-full">Apply to All Seats</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button onClick={handleSaveSeats} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Seats"}
                </Button>
              </div>
            </div>
            
            {stands.map((stand) => (
              <TabsContent key={stand.id} value={stand.id}>
                {Object.keys(groupedSeats).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(groupedSeats).map(([rowNumber, rowSeats]) => (
                      <Card key={rowNumber}>
                        <CardHeader>
                          <CardTitle className="text-lg">Row {rowNumber}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rowSeats.map((seat) => {
                              const matchSeat = matchSeats[seat.id];
                              return matchSeat ? (
                                <div key={seat.id} className="border p-4 rounded-lg">
                                  <div className="font-medium mb-2">Seat {seat.seat_number}</div>
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor={`price-${seat.id}`}>Price</Label>
                                      <div className="flex">
                                        <span className="flex items-center bg-muted px-3 border-y border-l border-input rounded-l-md">$</span>
                                        <Input
                                          id={`price-${seat.id}`}
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={matchSeat.price}
                                          onChange={(e) => handlePriceChange(seat.id, e.target.value)}
                                          className="rounded-l-none"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor={`status-${seat.id}`}>Status</Label>
                                      <Select
                                        value={matchSeat.status}
                                        onValueChange={(value) => handleSeatStatusChange(seat.id, value)}
                                      >
                                        <SelectTrigger id={`status-${seat.id}`}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="available">Available</SelectItem>
                                          <SelectItem value="blocked">Blocked</SelectItem>
                                          <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <p className="text-lg mb-2">No seats found for this stand.</p>
                    <p>Please add seats to this stand first.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-lg mb-2">No stands found for this stadium.</p>
          <p>Please add stands to the stadium first.</p>
        </div>
      )}
    </div>
  );
};

export default AdminMatchSeats;
