import React, { useState } from "react";
import "../assets/css/register.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Col, Container, Row } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user.password) {
      alert("Please enter a password to continue.");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",  // 🔥 Fix CORS issues
        body: JSON.stringify(user),
      });
  
      const data = await response.json(); // Ensure JSON response
      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        alert(data.error || "Failed to register.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration.");
    }
  };
  

  return (
    <>
      <Helmet>
        <title>Register - GIP</title>
      </Helmet>
      <section className="registerBG">
        <Container>
          <Row className="registerContainer m-0 p-0">
            <Col md={4}>
              <div className="registerInnerContainer">
                <h1>Create an Account</h1>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={user.name}
                      onChange={handleInput}
                      placeholder="Enter your name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleInput}
                      placeholder="Enter email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={user.password}
                      onChange={handleInput}
                      placeholder="Password"
                      required
                    />
                  </Form.Group>

                  <Button type="submit">Register</Button>

                  {/* Link to login page */}
                  <p className="loginRedirect">
                    Already have an account? <Link to="/login">Login here</Link>
                  </p>

                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Register;
