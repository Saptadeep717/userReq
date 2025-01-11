import React, { useEffect, useState } from "react";
import axios from "axios";
import PendingRequests from "./pendingRequest";
import FriendsList from "./friendList";
import UpdateProfile from "./updateProfile";
import RecommendedFriends from "./recommendedFriends";
import SearchUsers from "./search";

const HomePage = ({user}) => {
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [recommendedFriends, setRecommendedFriends] = useState([]);
  const [isCount, setIsCount] = useState(0);

  useEffect(() => {
    getFriendList();
    getRecommendedFriendList();
    getPendingRequestList();
  }, []);

  useEffect(() => {
    getFriendList();
    getRecommendedFriendList();
    getPendingRequestList();
  }, [isCount]);
  const getFriendList = async () => {
    try {
      const getFriends = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/friends`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include Bearer token in the Authorization header
          },
          withCredentials: true, // Optional, depending on how you're handling cookies
        }
      );
      setFriends(getFriends.data.friends);
    } catch (error) {
      console.error(error);
    }
  };

  const getRecommendedFriendList = async () => {
    try {
      const getRecommendedFriends = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/recommendations`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include Bearer token in the Authorization header
          },
          withCredentials: true, // Optional, depending on how you're handling cookies
        }
      );
      setRecommendedFriends(getRecommendedFriends.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getPendingRequestList = async () => {
    try {
      const getPendingRequests = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/pending-requests`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setPendingRequests(getPendingRequests.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="home-container">
        {/* {user && ( */}
        <>
          <h1 className="user-title">
            Welcome, {sessionStorage.getItem("username")}
          </h1>
          <SearchUsers isCount={isCount} setIsCount={setIsCount} />
          <UpdateProfile />
          <PendingRequests
            requests={pendingRequests}
            isCount={isCount}
            setIsCount={setIsCount}
          />
          <FriendsList
            friends={friends}
            isCount={isCount}
            setIsCount={setIsCount}
          />

          <RecommendedFriends
            recommendations={recommendedFriends}
            isCount={isCount}
            setIsCount={setIsCount}
          />
        </>
        {/* )} */}
      </div>
    </div>
  );
};

export default HomePage;
