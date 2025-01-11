import React from "react";
import axios from "axios";

const FriendsList = ({ friends = [], isCount, setIsCount }) => {
  const handleUnfriend = async (friendId) => {
    try {
      const friendRequest = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/unfriend`,
        { friendId: friendId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      setIsCount(isCount + 1);
      alert("Do you want to unfriend?");
    } catch (error) {
      console.error(error);
    }
  };
console.log(friends)
  return (
    <div className="friends-container">
      <h2>Your Friends</h2>
      {!friends?.length > 0 && (
        <h4 style={{ color: "#000", textAlign: "center" }}>
          You don't have friends...Connect with peopele
        </h4>
      )}
      {friends?.map((friend) => (
        <div key={friend._id} className="friend-item">
          <p>{friend.name}</p>
          <button onClick={() => handleUnfriend(friend._id)}>Unfriend</button>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;
