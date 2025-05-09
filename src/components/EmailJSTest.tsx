import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

const EmailJSTest: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const sendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsLoading(true);
    setStatus(null);

    try {
      // Log the form data for debugging
      const formData = new FormData(formRef.current);
      console.log("Form data being sent:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Send the test email
      const result = await emailjs.sendForm(
        "service_x5m3npv",
        "template_idsnrqj",
        formRef.current,
        "0Smk56TSivW-wtEJp",
      );

      console.log("EmailJS result:", result);
      setStatus(
        `Success! Email sent with status: ${result.status}. Check console for details.`,
      );
    } catch (error: any) {
      console.error("EmailJS error:", error);
      setStatus(`Error: ${error.message || "Failed to send email"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">EmailJS Test Tool</h1>

      <Card className="p-6 max-w-md mx-auto bg-white">
        <form ref={formRef} onSubmit={sendTestEmail} className="space-y-4">
          <div>
            <Label htmlFor="to_name">To Name (for template)</Label>
            <Input
              id="to_name"
              name="to_name"
              defaultValue="PayNomad Support"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="from_name">From Name</Label>
            <Input
              id="from_name"
              name="from_name"
              defaultValue="Test User"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="reply_to">Reply To (Your Email)</Label>
            <Input
              id="reply_to"
              name="reply_to"
              type="email"
              defaultValue="test@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              defaultValue="This is a test email from the EmailJS Test Tool"
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2c3e50] hover:bg-[#0077be]"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Test Email"}
          </Button>
        </form>

        {status && (
          <div
            className={`mt-4 p-3 rounded ${status.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {status}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p className="font-medium">Debugging Tips:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Check the browser console for detailed logs</li>
            <li>
              Verify that your EmailJS template variables match the form field
              names
            </li>
            <li>
              Ensure your EmailJS service is active and properly configured
            </li>
            <li>Check spam/junk folders for test emails</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default EmailJSTest;
