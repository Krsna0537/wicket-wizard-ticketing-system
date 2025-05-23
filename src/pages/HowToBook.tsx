
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HowToBook = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">How to Book Cricket Match Tickets</h1>
        
        <p className="text-lg mb-8">
          Booking tickets for cricket matches is quick and easy with our platform. Follow these simple steps to secure your seats for the next exciting cricket match!
        </p>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3">1</div>
                Create an Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click on the "Sign In" button in the top-right corner of the page</li>
                <li>Select "Sign Up" if you don't already have an account</li>
                <li>Fill in your email address and create a secure password</li>
                <li>Verify your email address by clicking on the link sent to your inbox</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3">2</div>
                Browse Available Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Navigate to the home page to view all upcoming cricket matches</li>
                <li>Use filters to find matches by team, venue, or date if needed</li>
                <li>Click on a match to view more details including venue, teams, and date</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3">3</div>
                Select Your Seats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>On the match details page, you'll see the stadium layout with available stands</li>
                <li>Click on a stand to view available seats</li>
                <li>Choose your preferred seat based on location and price</li>
                <li>You can select multiple seats if you're booking for a group</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3">4</div>
                Complete Your Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Review your selected seats and the total cost</li>
                <li>Click on "Book Now" to confirm your selection</li>
                <li>Complete the payment process</li>
                <li>You'll receive a confirmation email with your ticket details</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3">5</div>
                Manage Your Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Navigate to "My Bookings" in the top menu to view all your ticket bookings</li>
                <li>You can view and download your ticket details from this page</li>
                <li>For any changes or cancellations, please refer to our cancellation policy</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-10 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p>
            If you encounter any issues while booking tickets or have questions about the process, please visit our FAQ page or contact our customer support team at support@crickettickets.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToBook;
