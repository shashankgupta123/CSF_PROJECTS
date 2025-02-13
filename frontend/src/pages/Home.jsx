import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/home.css"; // Import the external CSS file

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Title */}
      <h1 className="homepage-title">Secure File Encryption & Decryption</h1>

      {/* Description */}
      <p className="homepage-description">
        Protect your sensitive data with advanced encryption technology. 
        Encrypt your files before sharing and decrypt them securely with 
        a unique token. Ensure privacy and security with our cutting-edge 
        encryption system.
      </p>

      {/* Buttons */}
      <div className="homepage-buttons">
        <button onClick={() => navigate("/encrypt")} className="homepage-button homepage-encrypt-btn">
          Encrypt File 🔒
        </button>

        <button onClick={() => navigate("/decrypt")} className="homepage-button homepage-decrypt-btn">
          Decrypt File 🔓
        </button>
      </div>
    </div>
  );
}

export default HomePage;
