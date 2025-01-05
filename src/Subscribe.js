import React, { useState } from "react";

const Subscribe = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    setIsPending(true);

    // Simulate subscription process
    setTimeout(() => {
      console.log("User subscribed:", { name, email });
      setName("");
      setEmail("");
      setIsPending(false);
      setShowConfirm(false);
      alert("Thank you for subscribing!");
    }, 1000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true); // Open confirmation dialog
  };

  return (
    <div className="create">
      <h2>Subscribe</h2>
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
        <label>Your Email:</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!isPending && <button>Subscribe</button>}
        {isPending && <button disabled>Subscribing...</button>}
      </form>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>Confirm Subscription</h3>
            <p>Are you sure you want to subscribe to reminders?</p>
            <button onClick={handleSubmit} disabled={isPending}>
              Yes, Subscribe
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

export default Subscribe;
