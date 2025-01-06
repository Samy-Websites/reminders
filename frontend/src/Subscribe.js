import React, { useState } from "react";
import { SUBSCRIBERS_URL } from "./Config";

const Subscribe = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState(""); // For deletion

  const handleSubmit = () => {
    console.log("Subscription confirmed."); // Log when subscription starts
    setIsPending(true);

    const subscriptionData = { name, email };
    console.log("Sending data to backend:", subscriptionData); // Log data being sent

    // Send data to the backend
    fetch(SUBSCRIBERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriptionData),
    })
      .then((response) => {
        console.log("Response received:", response); // Log the raw response

        if (!response.ok) {
          console.error("Failed response:", response.statusText); // Log failed response
          return response.json().then((data) => {
            throw new Error(data.error || "Failed to subscribe");
          });
        }

        return response.json(); // Parse JSON if response is OK
      })
      .then((data) => {
        console.log("Subscription successful:", data); // Log the success response
        alert("Subscription successful! Check your email.");
        setName("");
        setEmail("");
      })
      .catch((error) => {
        console.error("Error occurred during subscription:", error.message); // Log errors
        alert(`Error: ${error.message}`);
      })
      .finally(() => {
        console.log("Subscription process completed."); // Log when the process ends
        setIsPending(false);
        setShowConfirm(false);
      });
  };

  const handleDelete = () => {
    console.log("Deletion requested for email:", deleteEmail); // Log deletion request
    setIsPending(true);

    // Send DELETE request to the backend
    fetch(`${SUBSCRIBERS_URL}/${deleteEmail}`, {
      method: "DELETE",
    })
      .then((response) => {
        console.log("Delete response received:", response); // Log delete response

        if (!response.ok) {
          console.error("Failed to delete:", response.statusText); // Log failed deletion
          return response.json().then((data) => {
            throw new Error(data.error || "Failed to delete email");
          });
        }

        return response.json(); // Parse JSON if response is OK
      })
      .then((data) => {
        console.log("Deletion successful:", data); // Log success
        alert("Email successfully removed from the database.");
        setDeleteEmail("");
      })
      .catch((error) => {
        console.error("Error during deletion:", error.message); // Log errors
        alert(`Error: ${error.message}`);
      })
      .finally(() => {
        console.log("Deletion process completed."); // Log when the process ends
        setIsPending(false);
      });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with name:", name, "and email:", email); // Log form submission
    setShowConfirm(true); // Show confirmation dialog
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
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <label>Your Email:</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
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
            <button
              onClick={() => {
                console.log("Subscription canceled."); // Log cancellation
                setShowConfirm(false);
              }}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <br />
      <hr /> <br />
      <h2>Delete Subscription</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleDelete();
        }}
      >
        <label>Enter your email to delete subscription:</label>
        <input
          type="email"
          required
          value={deleteEmail}
          onChange={(e) => {
            setDeleteEmail(e.target.value);
          }}
        />
        {!isPending && <button>Delete</button>}
        {isPending && <button disabled>Deleting...</button>}
      </form>
    </div>
  );
};

export default Subscribe;
