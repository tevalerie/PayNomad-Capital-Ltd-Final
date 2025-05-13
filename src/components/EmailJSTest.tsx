import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import emailjs from "@emailjs/browser";

const EmailJSTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_id",
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_id",
        formRef.current as HTMLFormElement,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "public_key",
      )
      .then((result) => {
        console.log("Email sent successfully:", result.text);
        setIsSent(true);
      })
      .catch((error) => {
        console.error("Failed to send email:", error.text);
        setError("Failed to send email. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            EmailJS Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">
                Email sent successfully!
              </p>
              <Button onClick={() => setIsSent(false)}>Send Another</Button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user_name">Name</Label>
                  <Input
                    id="user_name"
                    name="user_name"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_email">Email</Label>
                  <Input
                    id="user_email"
                    name="user_email"
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message"
                    rows={4}
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailJSTest;
