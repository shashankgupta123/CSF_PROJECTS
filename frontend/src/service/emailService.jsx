import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EmailSender() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const userToken = localStorage.getItem("token"); // Fetch token from localStorage

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!recipientEmail) {
      toast.error("Please enter a recipient email.");
      return;
    }

    const templateParams = {
      to_email: recipientEmail, // Receiver email
      user_token: userToken, // Send token
    };

    try {
      await emailjs.send(
        "your_service_id", // Replace with Email.js Service ID
        "your_template_id", // Replace with Email.js Template ID
        templateParams,
        "your_public_key" // Replace with Email.js Public Key
      );

      toast.success("Email sent successfully!");
    } catch (error) {
      console.error("Email send error:", error);
      toast.error("Failed to send email.");
    }
  };

  return (
    <div className="EmailSender">
      <h2>Send Token via Email</h2>
      <form onSubmit={handleSendEmail}>
        <input
          type="email"
          placeholder="Recipient Email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          required
        />
        <button type="submit">Send Email</button>
      </form>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
}

export default EmailSender;
