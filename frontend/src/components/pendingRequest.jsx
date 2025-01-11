import React from "react";
import axios from "axios";

const PendingRequests = ({ requests = [], isCount, setIsCount}) => {
  const handleAccept = async (requestId) => {
    try {
      const acceptFriendRequest = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/accept-request`,
        { requestId: requestId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include Bearer token in the Authorization header
          },
          withCredentials: true, // Optional, depending on how you're handling cookies
        }
      );

      setIsCount(isCount + 1);
      alert("Request Accepted");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const declineFriendRequest = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/decline-request`,
        { requestId: requestId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setIsCount(isCount + 1);
      alert("Request Declined");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="requests-container">
      <h2>Pending Friend Requests</h2>
      {!requests?.length>0 && <h4 style={{color:"#000",textAlign:"center"}}>No Pending Friend Requests</h4>}
      {requests?.map((request) => (
        <div key={request._id} className="request-item">
          <p>{request.sender.name}</p>
          <div className="action-container">
            <button onClick={() => handleAccept(request._id)}>Accept</button>
            <button onClick={() => handleDecline(request._id)}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingRequests;
