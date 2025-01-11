import React from "react";
import axios from "axios";
const RecommendedFriends = ({ recommendations = [], isCount, setIsCount }) => {
  const handleAddfriend = async (receiverId) => {
    try {
      const recommendedFriendRequest = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/send-request`,
        { receiverId: receiverId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      setIsCount(isCount + 1);
      alert("Request Sent");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="recommendations-container">
      <h2>Recommended Friends</h2>
      {recommendations?.map((recommendation) => (
        <div key={recommendation.user._id} className="recommendation-item">
          <p>{recommendation.user.name}</p>
          <button onClick={() => handleAddfriend(recommendation.user._id)}>
            Add friend
          </button>
        </div>
      ))}
    </div>
  );
};

export default RecommendedFriends;
