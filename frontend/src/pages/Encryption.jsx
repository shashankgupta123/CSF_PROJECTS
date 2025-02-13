import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/encryption.css"; // Import the external CSS file

function EncryptPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [encryptionSuccess, setEncryptionSuccess] = useState(false);
  const navigate = useNavigate(); // React Router hook for navigation
  const userEmail = localStorage.getItem("email");
  const userToken = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleEncrypt = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", userEmail);
    formData.append("token", userToken);

    try {
      const response = await fetch("http://127.0.0.1:5000/encrypt", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("File encrypted successfully!");
        setEncryptionSuccess(true);
      } else {
        toast.error(data.error || "An error occurred.");
      }
    } catch (error) {
      toast.error("An error occurred while processing the file.");
    }
  };

  const sendEmail = async () => {
    if (!recipientEmail) {
      toast.error("Please enter the recipient email.");
      return;
    }

    const templateParams = {
      to_email: recipientEmail,
      from_name: userEmail,
      user_token: userToken,
    };

    try {
      await emailjs.send(
        "service_9d0vkl5",
        "template_pxam1fc",
        templateParams,
        "nJ9Wi4028UfQqBbCi"
      );

      toast.success("Email sent successfully!");
    } catch (error) {
      console.error("Email send error:", error);
      toast.error("Failed to send email.");
    }
  };

  return (
    <div className="encrypt-page">
      <h1>File Encryption</h1>

      <form>
        <input type="file" onChange={handleFileChange} className="encrypt-file-input" />
        <div className="encrypt-buttons">
          <button type="button" onClick={handleEncrypt} className="encrypt-button">
            Encrypt
          </button>
        </div>
      </form>

      {encryptionSuccess && (
        <>
          <input
            type="email"
            placeholder="Recipient Email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="encrypt-email-input"
            required
          />
          <button type="button" onClick={sendEmail} className="send-email-button">
            Send Email
          </button>
        </>
      )}

      {/* Back Button */}
      <button onClick={() => navigate("/home")} className="back-button">
        ← Back
      </button>

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar />
    </div>
  );
}

export default EncryptPage;
