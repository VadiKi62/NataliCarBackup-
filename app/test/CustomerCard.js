// CustomerCard.jsx
import React from "react";

const CustomerCard = ({ customer }) => {
  const style = {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    margin: "8px",
    backgroundColor: "#f9f9f9",
    transition: "box-shadow 0.3s",
    cursor: "pointer",
  };

  const hoverStyle = {
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  };

  if (!customer) return null;
  return (
    <div style={style}>
      <h3>{customer.name}</h3>
      <p>Email: {customer.email}</p>
      <p>Phone: {customer.phone}</p>
      <p>Address: {customer.address}</p>
    </div>
  );
};

export default CustomerCard;
