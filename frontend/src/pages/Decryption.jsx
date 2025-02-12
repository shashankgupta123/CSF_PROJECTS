import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sendEmail from "../service/emailService";  // Import sendEmail from emailService.js

function DecryptPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [email, setEmail] = useState("");  // Email input field for user
  const [token, setToken] = useState("");  // Token input field for user

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
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
            body: formData,  // Don't set headers for FormData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Decryption failed.");
        }

        // Convert response to file and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedFile.name.replace(".enc", ""); // Adjust filename as needed
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
      const result = await sendEmail(email, token, selectedFile);
      toast.success("Email sent successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to send email.");
    }
  };

  return (
    <div className="DecryptPage">
      <h1>File Decryption</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter your token"
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <div>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Decrypt</button>
      </form>

      <button onClick={handleSendEmail}>Send Email with Encrypted File</button>

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={true} />
    </div>
  );
}

export default DecryptPage;
