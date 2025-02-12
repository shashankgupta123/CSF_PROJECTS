import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EncryptPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email")); // Assuming email is stored in localStorage after login
  const [userToken, setUserToken] = useState(localStorage.getItem("token")); // Assuming token is stored in localStorage after login

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
    formData.append("email", userEmail);
    formData.append("token", userToken); // Send the token along with the email and file

    try {
      const response = await fetch("http://127.0.0.1:5000/encrypt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "An error occurred.");
      }
    } catch (error) {
      toast.error("An error occurred while processing the file.");
    }
  };

  return (
    <div className="EncryptPage">
      <h1>File Encryption</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Encrypt</button>
      </form>

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={true} />
    </div>
  );
}

export default EncryptPage;
