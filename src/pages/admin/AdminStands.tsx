
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Stand {
  id: string;
  stadium_id: string;
  name: string;
  category: string;
  capacity: number;
  base_price: number;
  description?: string;
}

interface Stadium {
  id: string;
  name: string;
  location: string;
}

const AdminStands = () => {
  const { stadiumId } = useParams<{ stadiumId: string }>();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [stands, setStands] = useState<Stand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    capacity: "",
    base_price: "",
    description: ""
  });

  useEffect(() => {
    if (stadiumId) {
      fetchStadiumAndStands();
    }
  }, [stadiumId]);

  const fetchStadiumAndStands = async () => {
    setIsLoading(true);
    
    // Fetch stadium details
    const { data: stadiumData, error: stadiumError } = await supabase
      .from("stadiums")
      .select("id, name, location")
      .eq("id", stadiumId)
      .single();
    
    if (stadiumError) {
      toast.error("Failed to fetch stadium");
      console.error("Error fetching stadium:", stadiumError);
    } else {
      setStadium(stadiumData);
      
      // Fetch stands for this stadium
      const { data: standsData, error: standsError } = await supabase
        .from("stands")
        .select("*")
        .eq("stadium_id", stadiumId)
        .order("name");
      
      if (standsError) {
        toast.error("Failed to fetch stands");
        console.error("Error fetching stands:", standsError);
      } else {
        setStands(standsData || []);
      }
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddStand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, category, capacity, base_price, description } = formData;
    
    if (!name || !category || !capacity || !base_price) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { data, error } = await supabase
      .from("stands")
      .insert([
        {
          stadium_id: stadiumId,
          name,
          category,
          capacity: parseInt(capacity),
          base_price: parseFloat(base_price),
          description: description || null
        }
      ])
      .select();
    
    if (error) {
      toast.error("Failed to add stand");
      console.error("Error adding stand:", error);
    } else {
      toast.success("Stand added successfully");
      setStands([...stands, data[0]]);
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditClick = (stand: Stand) => {
    setSelectedStand(stand);
    setFormData({
      name: stand.name,
      category: stand.category,
      capacity: stand.capacity.toString(),
      base_price: stand.base_price.toString(),
      description: stand.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStand) return;
    
    const { name, category, capacity, base_price, description } = formData;
    
    if (!name || !category || !capacity || !base_price) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { error } = await supabase
      .from("stands")
      .update({
        name,
        category,
        capacity: parseInt(capacity),
        base_price: parseFloat(base_price),
        description: description || null
      })
      .eq("id", selectedStand.id);
    
    if (error) {
      toast.error("Failed to update stand");
      console.error("Error updating stand:", error);
    } else {
      toast.success("Stand updated successfully");
      fetchStadiumAndStands();
      setIsEditDialogOpen(false);
      setSelectedStand(null);
      resetForm();
    }
  };

  const handleDeleteStand = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this stand?")) {
      const { error } = await supabase
        .from("stands")
        .delete()
        .eq("id", id);
      
      if (error) {
        toast.error("Failed to delete stand");
        console.error("Error deleting stand:", error);
      } else {
        toast.success("Stand deleted successfully");
        setStands(stands.filter(s => s.id !== id));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      capacity: "",
      base_price: "",
      description: ""
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/admin" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {stadium ? `Stands Management - ${stadium.name}` : "Stands Management"}
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Stand</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStand} className="space-y-4">
              <div>
                <Label htmlFor="name">Stand Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category*</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="VIP, Premium, General, etc."
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity*</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="base_price">Base Price*</Label>
                <Input
                  id="base_price"
                  name="base_price"
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full">Add Stand</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : stands.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Stands</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stands.map((stand) => (
                  <TableRow key={stand.id}>
                    <TableCell className="font-medium">{stand.name}</TableCell>
                    <TableCell>{stand.category}</TableCell>
                    <TableCell>{stand.capacity}</TableCell>
                    <TableCell>${stand.base_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/stands/${stand.id}/seats`}>
                            Manage Seats
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(stand)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteStand(stand.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No stands added yet</h3>
          <p className="text-muted-foreground mb-4">Add your first stand to get started</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStand} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Stand Name*</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category*</Label>
              <Input
                id="edit-category"
                name="category"
                placeholder="VIP, Premium, General, etc."
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-capacity">Capacity*</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-base_price">Base Price*</Label>
              <Input
                id="edit-base_price"
                name="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full">Update Stand</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStands;
