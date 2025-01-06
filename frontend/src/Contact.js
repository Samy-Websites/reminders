import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const history = useNavigate();

  const handleSubmit = () => {
    // e.preventDefault() // Not sure if I need this

    const serviceId = "service_fbk5nvr";
    const templateId = "template_kmg7w1a";
    const publicKey = "aiS3EMuigPfAk1yPD";

    const templateParams = {
      from_name: name,
      from_email: email,
      to_name: "Administrator",
      message: message,
    };

    setIsPending(true);

    // Simulate backend processing

    emailjs
      .send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log("Email Message sent:", response);
        setName("");
        setEmail("");
        setMessage("");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });
    setIsPending(false);
    setShowConfirm(false);
    history.push("/");

    // setTimeout(() => {
    //   setIsPending(false);
    //   alert("Your message has been sent!");
    //   setName("");
    //   setEmail("");
    //   setMessage("");
    //   setShowConfirm(false);
    //   history.push("/");
    // }, 1000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true); // Open confirmation dialog
  };

  return (
    <div className="create">
      <h2>Contact Me</h2>
      <form
        onSubmit={handleFormSubmit}
        style={{ filter: showConfirm ? "blur(4px)" : "none" }}
      >
        <label>Your Name:</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Your Email (Optional):</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Your Message:</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        {!isPending && <button>Send Message</button>}
        {isPending && <button disabled>Sending Message...</button>}
      </form>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>Confirm Submission</h3>
            <p>Are you sure you want to send this message?</p>
            <button onClick={handleSubmit} disabled={isPending}>
              Yes, Send
            </button>
            <button onClick={() => setShowConfirm(false)} disabled={isPending}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
