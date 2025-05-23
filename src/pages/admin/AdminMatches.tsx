
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash } from "lucide-react";

interface Stadium {
  id: string;
  name: string;
}

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_date: string;
  description?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  stadium_id: string;
  stadium: {
    name: string;
  };
}

const AdminMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    team_a: "",
    team_b: "",
    match_date: "",
    description: "",
    stadium_id: "",
    status: "upcoming"
  });

  useEffect(() => {
    fetchMatchesAndStadiums();
  }, []);

  const fetchMatchesAndStadiums = async () => {
    setIsLoading(true);
    
    // Fetch stadiums
    const { data: stadiumsData, error: stadiumsError } = await supabase
      .from("stadiums")
      .select("id, name")
      .order("name");
    
    if (stadiumsError) {
      toast.error("Failed to fetch stadiums");
      console.error("Error fetching stadiums:", stadiumsError);
    } else {
      setStadiums(stadiumsData || []);
    }
    
    // Fetch matches
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        team_a,
        team_b,
        match_date,
        description,
        status,
        stadium_id,
        stadium:stadium_id (
          name
        )
      `)
      .order("match_date", { ascending: false });
    
    if (matchesError) {
      toast.error("Failed to fetch matches");
      console.error("Error fetching matches:", matchesError);
    } else {
      setMatches(matchesData || []);
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { team_a, team_b, match_date, description, stadium_id, status } = formData;
    
    if (!team_a || !team_b || !match_date || !stadium_id) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { data, error } = await supabase
      .from("matches")
      .insert([
        {
          team_a,
          team_b,
          match_date,
          description: description || null,
          stadium_id,
          status
        }
      ])
      .select(`
        id,
        team_a,
        team_b,
        match_date,
        description,
        status,
        stadium_id,
        stadium:stadium_id (
          name
        )
      `);
    
    if (error) {
      toast.error("Failed to add match");
      console.error("Error adding match:", error);
    } else {
      toast.success("Match added successfully");
      setMatches([data[0], ...matches]);
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditClick = (match: Match) => {
    setSelectedMatch(match);
    setFormData({
      team_a: match.team_a,
      team_b: match.team_b,
      match_date: new Date(match.match_date).toISOString().substring(0, 16),
      description: match.description || "",
      stadium_id: match.stadium_id,
      status: match.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMatch) return;
    
    const { team_a, team_b, match_date, description, stadium_id, status } = formData;
    
    if (!team_a || !team_b || !match_date || !stadium_id) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const { error } = await supabase
      .from("matches")
      .update({
        team_a,
        team_b,
        match_date,
        description: description || null,
        stadium_id,
        status
      })
      .eq("id", selectedMatch.id);
    
    if (error) {
      toast.error("Failed to update match");
      console.error("Error updating match:", error);
    } else {
      toast.success("Match updated successfully");
      fetchMatchesAndStadiums();
      setIsEditDialogOpen(false);
      setSelectedMatch(null);
      resetForm();
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", id);
      
      if (error) {
        toast.error("Failed to delete match");
        console.error("Error deleting match:", error);
      } else {
        toast.success("Match deleted successfully");
        setMatches(matches.filter(m => m.id !== id));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      team_a: "",
      team_b: "",
      match_date: "",
      description: "",
      stadium_id: "",
      status: "upcoming"
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Match Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Match
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Match</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMatch} className="space-y-4">
              <div>
                <Label htmlFor="team_a">Team A*</Label>
                <Input
                  id="team_a"
                  name="team_a"
                  value={formData.team_a}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="team_b">Team B*</Label>
                <Input
                  id="team_b"
                  name="team_b"
                  value={formData.team_b}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="match_date">Match Date & Time*</Label>
                <Input
                  id="match_date"
                  name="match_date"
                  type="datetime-local"
                  value={formData.match_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stadium_id">Stadium*</Label>
                <Select
                  value={formData.stadium_id}
                  onValueChange={(value) => handleSelectChange("stadium_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stadium" />
                  </SelectTrigger>
                  <SelectContent>
                    {stadiums.map((stadium) => (
                      <SelectItem key={stadium.id} value={stadium.id}>
                        {stadium.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button type="submit" className="w-full">Add Match</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : matches.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teams</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Stadium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">
                      {match.team_a} vs {match.team_b}
                    </TableCell>
                    <TableCell>{formatDate(match.match_date)}</TableCell>
                    <TableCell>{match.stadium.name}</TableCell>
                    <TableCell>
                      <span className={`capitalize px-2 py-1 rounded-full text-xs font-semibold ${
                        match.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                        match.status === "ongoing" ? "bg-green-100 text-green-800" :
                        match.status === "completed" ? "bg-gray-100 text-gray-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {match.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(match)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteMatch(match.id)}>
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
          <h3 className="text-xl font-medium mb-2">No matches added yet</h3>
          <p className="text-muted-foreground mb-4">Add your first match to get started</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMatch} className="space-y-4">
            <div>
              <Label htmlFor="edit-team_a">Team A*</Label>
              <Input
                id="edit-team_a"
                name="team_a"
                value={formData.team_a}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-team_b">Team B*</Label>
              <Input
                id="edit-team_b"
                name="team_b"
                value={formData.team_b}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-match_date">Match Date & Time*</Label>
              <Input
                id="edit-match_date"
                name="match_date"
                type="datetime-local"
                value={formData.match_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-stadium_id">Stadium*</Label>
              <Select
                value={formData.stadium_id}
                onValueChange={(value) => handleSelectChange("stadium_id", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stadiums.map((stadium) => (
                    <SelectItem key={stadium.id} value={stadium.id}>
                      {stadium.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" className="w-full">Update Match</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMatches;
