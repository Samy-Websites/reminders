import React, { useState, useEffect } from "react";
import { SUBSCRIBERS_URL } from "./Config";

const Subscribe = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState(""); // For deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Delete confirmation
  const [subscribers, setSubscribers] = useState([]); // List of subscribers

  useEffect(() => {
    // Fetch the list of subscribers
    fetch(SUBSCRIBERS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setSubscribers(data);
      })
      .catch((error) => console.error("Error fetching subscribers:", error));
  }, []);

  const handleSubmit = () => {
    setIsPending(true);
    const subscriptionData = { name, email };

    fetch(SUBSCRIBERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriptionData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Failed to subscribe");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Subscription successful. Preview URL:", data.previewUrl);
        alert("Subscription successful! Check your email.");
        setSubscribers((prevSubscribers) => [
          ...prevSubscribers,
          subscriptionData,
        ]);
        setName("");
        setEmail("");
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      })
      .finally(() => {
        setIsPending(false);
        setShowConfirm(false);
      });
  };

  const handleDelete = () => {
    setIsPending(true);

    fetch(`${SUBSCRIBERS_URL}/${deleteEmail}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Failed to delete email");
          });
        }
        return response.json();
      })
      .then(() => {
        alert("Email successfully removed from the database.");
        setSubscribers((prevSubscribers) =>
          prevSubscribers.filter(
            (subscriber) => subscriber.email !== deleteEmail
          )
        );

        // Send farewell email
        return fetch(`${SUBSCRIBERS_URL}/send-farewell`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: deleteEmail }),
        });
      })
      .then((response) => response.json())
      .then((emailData) => {
        console.log("Farewell email sent. Preview URL:", emailData.previewUrl);
        alert("Farewell email sent!");
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      })
      .finally(() => {
        setIsPending(false);
        setShowDeleteConfirm(false);
        setDeleteEmail("");
      });
  };

  return (
    <div className="create">
      <h2>Subscribe</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirm(true);
        }}
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
      <br />
      <hr />
      <h2>Delete Subscription</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowDeleteConfirm(true);
        }}
      >
        <label>Enter your email to delete subscription:</label>
        <input
          type="email"
          required
          value={deleteEmail}
          onChange={(e) => setDeleteEmail(e.target.value)}
        />
        {!isPending && <button>Delete</button>}
        {isPending && <button disabled>Processing...</button>}
      </form>
      {showDeleteConfirm && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the subscription for{" "}
              <strong>{deleteEmail}</strong>?
            </p>
            <button onClick={handleDelete} disabled={isPending}>
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <br />
      <hr />
      <h2>Subscribers List</h2>
      <ul>
        {subscribers.map((subscriber) => (
          <li key={subscriber.email}>
            <strong>{subscriber.name}</strong>: {subscriber.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subscribe;
