
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash } from "lucide-react";

interface Stadium {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  image_url?: string;
}

const AdminStadiums = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("stadiums")
      .select("*")
      .order("name");
    
    if (error) {
      toast.error("Failed to fetch stadiums");
      console.error("Error fetching stadiums:", error);
    } else {
      setStadiums(data || []);
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

  const handleAddStadium = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, location, capacity, description, image_url } = formData;
    
    if (!name || !location || !capacity) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { data, error } = await supabase
      .from("stadiums")
      .insert([
        {
          name,
          location,
          capacity: parseInt(capacity),
          description: description || null,
          image_url: image_url || null
        }
      ])
      .select();
    
    if (error) {
      toast.error("Failed to add stadium");
      console.error("Error adding stadium:", error);
    } else {
      toast.success("Stadium added successfully");
      setStadiums([...stadiums, data[0]]);
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditClick = (stadium: Stadium) => {
    setSelectedStadium(stadium);
    setFormData({
      name: stadium.name,
      location: stadium.location,
      capacity: stadium.capacity.toString(),
      description: stadium.description || "",
      image_url: stadium.image_url || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStadium = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStadium) return;
    
    const { name, location, capacity, description, image_url } = formData;
    
    if (!name || !location || !capacity) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { error } = await supabase
      .from("stadiums")
      .update({
        name,
        location,
        capacity: parseInt(capacity),
        description: description || null,
        image_url: image_url || null
      })
      .eq("id", selectedStadium.id);
    
    if (error) {
      toast.error("Failed to update stadium");
      console.error("Error updating stadium:", error);
    } else {
      toast.success("Stadium updated successfully");
      fetchStadiums();
      setIsEditDialogOpen(false);
      setSelectedStadium(null);
      resetForm();
    }
  };

  const handleDeleteStadium = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this stadium?")) {
      const { error } = await supabase
        .from("stadiums")
        .delete()
        .eq("id", id);
      
      if (error) {
        toast.error("Failed to delete stadium");
        console.error("Error deleting stadium:", error);
      } else {
        toast.success("Stadium deleted successfully");
        setStadiums(stadiums.filter(s => s.id !== id));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      capacity: "",
      description: "",
      image_url: ""
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Stadium Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stadium
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Stadium</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStadium} className="space-y-4">
              <div>
                <Label htmlFor="name">Stadium Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full">Add Stadium</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : stadiums.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Stadiums</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stadiums.map((stadium) => (
                  <TableRow key={stadium.id}>
                    <TableCell className="font-medium">{stadium.name}</TableCell>
                    <TableCell>{stadium.location}</TableCell>
                    <TableCell>{stadium.capacity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(stadium)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteStadium(stadium.id)}>
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
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No stadiums added yet</h3>
          <p className="text-muted-foreground mb-4">Add your first stadium to get started</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stadium</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStadium} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Stadium Name*</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location*</Label>
              <Input
                id="edit-location"
                name="location"
                value={formData.location}
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
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input
                id="edit-image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full">Update Stadium</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStadiums;
