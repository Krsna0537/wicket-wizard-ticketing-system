
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Define the type for a Stand
interface Stand {
  id: string;
  name: string;
  category: string;
  capacity: number;
  base_price: number;
  description: string;
}

// Define the type for a Seat
interface Seat {
  id: string;
  stand_id: string;
  row_number: string;
  seat_number: string;
  status: string;
}

const AdminSeats = () => {
  const { standId } = useParams<{ standId: string }>();
  const queryClient = useQueryClient();
  
  const [stand, setStand] = useState<Stand>({
    id: "",
    name: "",
    category: "",
    capacity: 0,
    base_price: 0,
    description: ""
  });
  
  const [newSeat, setNewSeat] = useState({
    row_number: "",
    seat_number: ""
  });

  // Fetch stand details
  const { isLoading: isLoadingStand } = useQuery({
    queryKey: ["stand", standId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stands")
        .select("*")
        .eq("id", standId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setStand(data as Stand);
      }
      
      return data;
    }
  });

  // Fetch seats for this stand
  const { data: seats, isLoading: isLoadingSeats } = useQuery({
    queryKey: ["seats", standId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seats")
        .select("*")
        .eq("stand_id", standId)
        .order("row_number", { ascending: true })
        .order("seat_number", { ascending: true });
        
      if (error) throw error;
      return data as Seat[];
    }
  });

  // Add new seat mutation
  const addSeatMutation = useMutation({
    mutationFn: async (newSeatData: { stand_id: string; row_number: string; seat_number: string }) => {
      const { data, error } = await supabase
        .from("seats")
        .insert([newSeatData])
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seats", standId] });
      setNewSeat({ row_number: "", seat_number: "" });
      toast.success("Seat added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding seat: ${error.message}`);
    }
  });

  // Delete seat mutation
  const deleteSeatMutation = useMutation({
    mutationFn: async (seatId: string) => {
      const { error } = await supabase
        .from("seats")
        .delete()
        .eq("id", seatId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seats", standId] });
      toast.success("Seat deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting seat: ${error.message}`);
    }
  });

  const handleAddSeat = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSeat.row_number || !newSeat.seat_number) {
      toast.error("Please fill in all fields");
      return;
    }
    
    addSeatMutation.mutate({
      stand_id: standId!,
      row_number: newSeat.row_number,
      seat_number: newSeat.seat_number
    });
  };

  const handleDeleteSeat = (seatId: string) => {
    if (window.confirm("Are you sure you want to delete this seat?")) {
      deleteSeatMutation.mutate(seatId);
    }
  };

  if (isLoadingStand || isLoadingSeats) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Seats for {stand.name}</h1>
        <Button asChild>
          <Link to="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Stand Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-sm">Name:</p>
              <p>{stand.name}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Category:</p>
              <p>{stand.category}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Base Price:</p>
              <p>${stand.base_price}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Capacity:</p>
              <p>{stand.capacity}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-sm">Description:</p>
              <p>{stand.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Seat</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddSeat}>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="row_number" className="block text-sm font-medium mb-1">Row Number</label>
                <Input
                  id="row_number"
                  value={newSeat.row_number}
                  onChange={(e) => setNewSeat({ ...newSeat, row_number: e.target.value })}
                  placeholder="e.g. A, B, C"
                />
              </div>
              <div>
                <label htmlFor="seat_number" className="block text-sm font-medium mb-1">Seat Number</label>
                <Input
                  id="seat_number"
                  value={newSeat.seat_number}
                  onChange={(e) => setNewSeat({ ...newSeat, seat_number: e.target.value })}
                  placeholder="e.g. 1, 2, 3"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={addSeatMutation.isPending}>
                {addSeatMutation.isPending ? "Adding..." : "Add Seat"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Seats</CardTitle>
          </CardHeader>
          <CardContent>
            {seats && seats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Row</th>
                      <th className="text-left py-2">Seat</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seats.map((seat) => (
                      <tr key={seat.id} className="border-b hover:bg-muted/50">
                        <td className="py-2">{seat.row_number}</td>
                        <td className="py-2">{seat.seat_number}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            seat.status === "available" ? "bg-green-100 text-green-800" :
                            seat.status === "booked" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {seat.status}
                          </span>
                        </td>
                        <td className="py-2">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteSeat(seat.id)}
                            disabled={seat.status !== "available"}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No seats added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSeats;
