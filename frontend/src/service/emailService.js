import emailjs from "@emailjs/browser";

const sendEmail = async (formRef) => {
  if (!formRef.current) {
    throw new Error("Form reference is missing.");
  }

  try {
    // Send the email with EmailJS
    const result = await emailjs.sendForm(
      "YOUR_SERVICE_ID", // Replace with your actual EmailJS service ID
      "YOUR_TEMPLATE_ID", // Replace with your actual EmailJS template ID
      formRef.current, // Pass the actual form element
      "YOUR_PUBLIC_KEY" // Replace with your actual EmailJS public key
    );

    return result;
  } catch (error) {
    throw new Error("Failed to send email: " + error.text);
  }
};

export default sendEmail;
