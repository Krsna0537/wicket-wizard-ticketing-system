
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash, ArrowLeft } from "lucide-react";

interface Stand {
  id: string;
  name: string;
  stadium_id: string;
  stadium_name: string;
}

interface Seat {
  id: string;
  stand_id: string;
  row_number: string;
  seat_number: string;
  status: string;
}

const AdminSeats = () => {
  const { standId } = useParams<{ standId: string }>();
  const [stand, setStand] = useState<Stand | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [formData, setFormData] = useState({
    row_number: "",
    seat_number: "",
    status: "available"
  });
  const [bulkFormData, setBulkFormData] = useState({
    row_prefix: "",
    start_row: "1",
    end_row: "10",
    seats_per_row: "20",
    status: "available"
  });

  useEffect(() => {
    if (standId) {
      fetchStandAndSeats();
    }
  }, [standId]);

  const fetchStandAndSeats = async () => {
    setIsLoading(true);
    
    // Fetch stand details
    const { data: standData, error: standError } = await supabase
      .rpc('get_stand_with_stadium_name', { stand_id: standId })
      .single();
    
    if (standError) {
      toast.error("Failed to fetch stand");
      console.error("Error fetching stand:", standError);
    } else {
      setStand(standData);
      
      // Fetch seats for this stand
      const { data: seatsData, error: seatsError } = await supabase
        .from("seats")
        .select("*")
        .eq("stand_id", standId)
        .order("row_number")
        .order("seat_number");
      
      if (seatsError) {
        toast.error("Failed to fetch seats");
        console.error("Error fetching seats:", seatsError);
      } else {
        setSeats(seatsData || []);
      }
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleBulkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBulkFormData({
      ...bulkFormData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleBulkSelectChange = (name: string, value: string) => {
    setBulkFormData({
      ...bulkFormData,
      [name]: value
    });
  };

  const handleAddSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { row_number, seat_number, status } = formData;
    
    if (!row_number || !seat_number) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { data, error } = await supabase
      .from("seats")
      .insert([
        {
          stand_id: standId,
          row_number,
          seat_number,
          status
        }
      ])
      .select();
    
    if (error) {
      toast.error("Failed to add seat");
      console.error("Error adding seat:", error);
    } else {
      toast.success("Seat added successfully");
      setSeats([...seats, data[0]]);
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleBulkAddSeats = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { row_prefix, start_row, end_row, seats_per_row, status } = bulkFormData;
    
    if (!seats_per_row) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const startRowNum = parseInt(start_row);
    const endRowNum = parseInt(end_row);
    const seatsPerRow = parseInt(seats_per_row);
    
    if (isNaN(startRowNum) || isNaN(endRowNum) || isNaN(seatsPerRow) || startRowNum > endRowNum || seatsPerRow <= 0) {
      toast.error("Invalid input values");
      return;
    }
    
    const bulkSeats = [];
    for (let row = startRowNum; row <= endRowNum; row++) {
      const rowLabel = row_prefix + row;
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        bulkSeats.push({
          stand_id: standId,
          row_number: rowLabel,
          seat_number: seat.toString(),
          status
        });
      }
    }
    
    // Insert in batches of 100 to avoid request size limits
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < bulkSeats.length; i += batchSize) {
      const batch = bulkSeats.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from("seats")
        .insert(batch);
      
      if (error) {
        toast.error(`Failed to add some seats: ${error.message}`);
        console.error("Error adding seats:", error);
        break;
      } else {
        successCount += batch.length;
      }
    }
    
    if (successCount > 0) {
      toast.success(`${successCount} seats added successfully`);
      fetchStandAndSeats();
      setIsBulkAddDialogOpen(false);
      resetBulkForm();
    }
  };

  const handleEditClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setFormData({
      row_number: seat.row_number,
      seat_number: seat.seat_number,
      status: seat.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSeat) return;
    
    const { row_number, seat_number, status } = formData;
    
    if (!row_number || !seat_number) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { error } = await supabase
      .from("seats")
      .update({
        row_number,
        seat_number,
        status
      })
      .eq("id", selectedSeat.id);
    
    if (error) {
      toast.error("Failed to update seat");
      console.error("Error updating seat:", error);
    } else {
      toast.success("Seat updated successfully");
      fetchStandAndSeats();
      setIsEditDialogOpen(false);
      setSelectedSeat(null);
      resetForm();
    }
  };

  const handleDeleteSeat = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this seat?")) {
      const { error } = await supabase
        .from("seats")
        .delete()
        .eq("id", id);
      
      if (error) {
        toast.error("Failed to delete seat");
        console.error("Error deleting seat:", error);
      } else {
        toast.success("Seat deleted successfully");
        setSeats(seats.filter(s => s.id !== id));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      row_number: "",
      seat_number: "",
      status: "available"
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      row_prefix: "",
      start_row: "1",
      end_row: "10",
      seats_per_row: "20",
      status: "available"
    });
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        {stand && (
          <Link to={`/admin/stadiums/${stand.stadium_id}/stands`} className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Stands
          </Link>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {stand ? `Seats Management - ${stand.name} (${stand.stadium_name})` : "Seats Management"}
        </h2>
        <div className="flex gap-2">
          <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Bulk Add Seats
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Add Seats</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBulkAddSeats} className="space-y-4">
                <div>
                  <Label htmlFor="row_prefix">Row Prefix (Optional)</Label>
                  <Input
                    id="row_prefix"
                    name="row_prefix"
                    placeholder="e.g., R for R1, R2, etc."
                    value={bulkFormData.row_prefix}
                    onChange={handleBulkInputChange}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="start_row">Start Row*</Label>
                    <Input
                      id="start_row"
                      name="start_row"
                      type="number"
                      min="1"
                      value={bulkFormData.start_row}
                      onChange={handleBulkInputChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="end_row">End Row*</Label>
                    <Input
                      id="end_row"
                      name="end_row"
                      type="number"
                      min="1"
                      value={bulkFormData.end_row}
                      onChange={handleBulkInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="seats_per_row">Seats Per Row*</Label>
                  <Input
                    id="seats_per_row"
                    name="seats_per_row"
                    type="number"
                    min="1"
                    value={bulkFormData.seats_per_row}
                    onChange={handleBulkInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-status">Status</Label>
                  <Select
                    value={bulkFormData.status}
                    onValueChange={(value) => handleBulkSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add Seats</Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Single Seat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Seat</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSeat} className="space-y-4">
                <div>
                  <Label htmlFor="row_number">Row Number*</Label>
                  <Input
                    id="row_number"
                    name="row_number"
                    value={formData.row_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seat_number">Seat Number*</Label>
                  <Input
                    id="seat_number"
                    name="seat_number"
                    value={formData.seat_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add Seat</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : Object.keys(groupedSeats).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedSeats).map(([rowNumber, rowSeats]) => (
            <Card key={rowNumber}>
              <CardHeader>
                <CardTitle className="text-lg">Row {rowNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {rowSeats.map((seat) => (
                    <div key={seat.id} className="relative">
                      <button
                        className={`w-14 h-14 rounded border flex items-center justify-center font-medium ${
                          seat.status === "available" 
                            ? "bg-secondary border-secondary"
                            : seat.status === "blocked"
                            ? "bg-gray-300 border-gray-300 text-gray-500"
                            : "bg-red-200 border-red-200 text-red-500"
                        }`}
                        onClick={() => handleEditClick(seat)}
                      >
                        {seat.seat_number}
                      </button>
                      <button 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => handleDeleteSeat(seat.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No seats added yet</h3>
          <p className="text-muted-foreground mb-4">Add seats to this stand using the buttons above</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Seat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSeat} className="space-y-4">
            <div>
              <Label htmlFor="edit-row_number">Row Number*</Label>
              <Input
                id="edit-row_number"
                name="row_number"
                value={formData.row_number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-seat_number">Seat Number*</Label>
              <Input
                id="edit-seat_number"
                name="seat_number"
                value={formData.seat_number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Update Seat</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSeats;
