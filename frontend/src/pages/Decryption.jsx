import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sendEmail from "../service/emailService";
import "../assets/css/decryption.css"; // Import the external CSS file

function DecryptPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate(); // For navigation

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Function to verify email & token before enabling decryption
  const verifyUser = async () => {
    if (!email || !token) {
      toast.error("Please enter email and token.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("User verified successfully!");
        setIsVerified(true);
      } else {
        toast.error(data.error || "Invalid email or token.");
        setIsVerified(false);
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", email);
    formData.append("token", token);

    try {
      const response = await fetch("http://127.0.0.1:5000/decrypt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Decryption failed.");
      }

      // Convert response to file and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedFile.name.replace(".enc", ""); 
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("File decrypted successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!email || !token) {
        toast.error("Please enter email and token before sending email.");
        return;
      }
      await sendEmail(email, token, selectedFile);
      toast.success("Email sent successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to send email.");
    }
  };

  return (
    <div className="decrypt-page">
      <h1>File Decryption</h1>

      <div className="decrypt-input-container">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="decrypt-input-container">
        <input
          type="text"
          placeholder="Enter your token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      <button onClick={verifyUser} disabled={isVerifying} className="decrypt-button">
        {isVerifying ? "Verifying..." : "Verify User"}
      </button>

      {/* Hide file input and decrypt button until user is verified */}
      {isVerified && (
        <form onSubmit={handleFormSubmit}>
          <div className="decrypt-input-container">
            <input type="file" onChange={handleFileChange} />
          </div>

          <button type="submit" className="decrypt-button">
            Decrypt
          </button>
        </form>
      )}

      {/* Back Button */}
      <button onClick={() => navigate("/home")} className="back-button">
        ⬅ Back
      </button>

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={true} />
    </div>
  );
}

export default DecryptPage;
