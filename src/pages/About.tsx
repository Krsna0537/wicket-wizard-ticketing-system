
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Cricket Tickets</h1>
        
        <div className="prose max-w-none mb-10">
          <p className="text-lg mb-6">
            Cricket Tickets is your premier destination for booking seats to the most exciting cricket matches around the world. We provide a secure, convenient platform for cricket enthusiasts to purchase tickets and enjoy the thrill of live matches.
          </p>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>Bringing cricket fans closer to the action</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Our mission is to make the ticket booking process seamless and enjoyable, ensuring that cricket fans never miss out on watching their favorite teams and players in action. We believe in transparency, fairness, and providing the best customer experience possible.
              </p>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Secure Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Our platform ensures that all transactions are secure and your personal information is protected. Book with confidence knowing that your data is safe with us.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Our system updates seat availability in real-time, so you'll always know which seats are available for booking. No more disappointments or double bookings!
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interactive Seating</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Choose your preferred seats using our interactive seating maps. Get a clear view of the stadium layout and select the best seats based on your preference and budget.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Digital Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Receive your tickets instantly after booking. No need to wait for physical tickets to arrive by mail. Simply show your digital ticket at the stadium entrance.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          
          <ol className="list-decimal pl-6 mb-8 space-y-3">
            <li>Browse upcoming cricket matches</li>
            <li>Select a match you want to attend</li>
            <li>Choose your preferred stand and seat</li>
            <li>Complete the booking process</li>
            <li>Receive your ticket confirmation with all the details</li>
            <li>Enjoy the match!</li>
          </ol>
          
          <p className="text-lg">
            We're constantly working to improve our services and provide the best possible experience for cricket fans. If you have any questions or suggestions, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
