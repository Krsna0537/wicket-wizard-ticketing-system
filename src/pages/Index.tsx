
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_date: string;
  description?: string;
  stadium: {
    name: string;
    location: string;
  };
}

const Index = () => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          team_a,
          team_b,
          match_date,
          description,
          stadium:stadium_id (
            name,
            location
          )
        `)
        .eq("status", "upcoming")
        .order("match_date");
      
      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        setUpcomingMatches(data || []);
      }
      setIsLoading(false);
    };

    fetchUpcomingMatches();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Upcoming Cricket Matches</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : upcomingMatches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingMatches.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <div className="bg-primary h-2"></div>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{match.team_a}</span>
                  <span>vs</span>
                  <span>{match.team_b}</span>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(match.match_date)} at {formatTime(match.match_date)}</span>
                  </div>
                  <div className="mt-1">{match.stadium.name}, {match.stadium.location}</div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{match.description || "Join us for an exciting cricket match!"}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/match/${match.id}`}>View Tickets</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No upcoming matches</h3>
          <p className="text-muted-foreground">Check back soon for new cricket matches</p>
        </div>
      )}
    </div>
  );
};

export default Index;
