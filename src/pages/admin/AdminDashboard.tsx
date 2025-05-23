
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStadiums from "./AdminStadiums";
import AdminMatches from "./AdminMatches";
import AdminBookings from "./AdminBookings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stadiums");
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="stadiums" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="stadiums">Stadiums</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stadiums">
          <AdminStadiums />
        </TabsContent>
        
        <TabsContent value="matches">
          <AdminMatches />
        </TabsContent>
        
        <TabsContent value="bookings">
          <AdminBookings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
