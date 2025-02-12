import React, { useState } from "react";
import "../assets/css/login.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Col, Container, Row } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { Helmet } from "react-helmet";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", user.email);

        if (data.message === "User already exists, no need to save.") {
          toast.info("User already registered. Redirecting...");
          navigate("/register");
        } else {
          toast.success("User saved successfully! Redirecting...");
          navigate("/encrypt");
        }
      } else {
        const error = await response.json();
        console.error(error);
        toast.error("Failed to save user details. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while saving user details. Please try again.");
    }
  };

  return (
    <>
      <Helmet>
        <title>Login to GIP</title>
      </Helmet>
      <section className="loginBG">
        <Container>
          <Row className="loginContainer m-0 p-0">
            <Col md={4}>
              <div className="logininnerContainer">
                <h1>Welcome To File Encryption System</h1>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
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

                  <Form.Group className="mb-3" controlId="formBasicPassword">
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

                  <Button type="submit">Submit</Button>

                  {/* Link to registration page */}
                  <p className="registerRedirect">
                    Don't have an account? <Link to="/">Create one here</Link>
                  </p>

                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Toast container to display toasts */}
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={true} />
    </>
  );
};

export default Login;
