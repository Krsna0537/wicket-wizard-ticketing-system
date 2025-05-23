
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
        
        <p className="text-lg mb-8">
          Find answers to common questions about booking cricket match tickets and using our platform.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>General Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Creating an account is easy! Click the "Sign In" button in the top-right corner of the page, then select "Sign Up". Fill in your email address and create a password. You'll receive a verification email to confirm your account.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Is my personal information secure?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Yes, we take data security very seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Which cricket matches are available for booking?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    We offer tickets for a wide range of cricket matches, including international matches, IPL, Big Bash League, and other major cricket tournaments. Browse our home page to see all upcoming matches.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Booking Process</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I book tickets?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    To book tickets, first browse and select a match you're interested in. Then, choose your preferred stand and seat. Add the tickets to your cart and proceed to checkout to complete the payment process.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I book multiple seats?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Yes, you can select multiple seats for a match, depending on availability. This is ideal if you're attending with friends or family.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    We accept all major credit and debit cards, as well as digital payment methods like PayPal. All transactions are processed securely.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tickets & Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-7">
                <AccordionTrigger>How do I receive my tickets?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    After completing your booking, your tickets will be available in your "My Bookings" section. You'll also receive a confirmation email with ticket details. You can either print your tickets or show the digital version on your phone at the stadium.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger>Can I transfer my tickets to someone else?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Yes, you can transfer your tickets to someone else by sharing the ticket details with them. However, the original booking will still be under your name in our records.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger>What happens if a match is cancelled?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    If a match is cancelled or postponed, we'll notify you via email. You'll be eligible for a full refund or tickets to the rescheduled match, depending on the circumstances.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-10">
                <AccordionTrigger>I can't log in to my account</AccordionTrigger>
                <AccordionContent>
                  <p>
                    If you're having trouble logging in, first check that you're using the correct email and password. You can reset your password by clicking the "Forgot Password" link on the sign-in page. If you're still having issues, please contact our support team.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11">
                <AccordionTrigger>I didn't receive my confirmation email</AccordionTrigger>
                <AccordionContent>
                  <p>
                    First, check your spam or junk folder. If you still can't find the email, you can view your booking details by logging into your account and navigating to "My Bookings". If your booking isn't showing up, please contact our support team.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <div className="mt-10 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p>
            If you couldn't find the answer to your question, please contact our customer support team at support@crickettickets.com or call us at +1-123-456-7890. We're here to help!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
