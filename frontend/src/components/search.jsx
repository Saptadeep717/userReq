import React, { useState } from "react";
import axios from "axios";

const SearchUsers = ({isCount,setIsCount}) => {
  const [query, setQuery] = useState(""); 
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if a search was performed

  // Handle input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear search results if query is empty
    if (!value.trim()) {
      setUsers([]);
      setSearchPerformed(false); // Reset search state
    }
  };

  // Fetch users based on search query
  const handleSearch = async () => {
    if (!query.trim()) return; // Prevent empty searches

    setLoading(true);
    setSearchPerformed(true); // Mark that a search has been performed
    const loggedInUserName = sessionStorage.getItem("username");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/search-users`,
        {
          params: { query },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true, // For sending cookies with request if necessary
        }
      );

        const filteredUsers = response.data.filter(
          (userStatus) => userStatus.user.name !== loggedInUserName
        );

      setUsers(filteredUsers); // Set the response data to users state
    } catch (err) {
      console.error(err.message);
      setUsers([]); // Clear results in case of an error
    }
    setLoading(false);
  };

  // Handle adding a friend
  const handleAddFriend = async (userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/send-request`,

        { receiverId: userId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setQuery("");
      setIsCount(isCount + 1);
      setUsers([]);
      alert("Friend request sent!");
      //handleSearch(); // Refresh the search results
    } catch (err) {
      console.error(err.message);
      alert("Failed to send friend request.");
    }
  };

  // Handle unfriending a user
  const handleUnfriend = async (userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/unfriend`,
        { friendId: userId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setQuery("");
      setIsCount(isCount + 1);
      setUsers([]);
      alert("Unfriended successfully!");
      //handleSearch(); // Refresh the search results
      
    } catch (err) {
      console.error(err.message);
      alert("Failed to unfriend.");
    }
  };

  return (
    <div className="search-users-container">
      <h2 style={{ textAlign: "center" }}>Search Users by Name</h2>
      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Search by name..."
      />
      <button onClick={handleSearch}>Search</button>

      {loading && <p>Loading...</p>}

      <div className="user-list">
        {searchPerformed && users.length === 0 ? (
          <p style={{ color: "#000", textAlign: "center" }}>No users found</p>
        ) : (
          users.map((userStatus) => (
            <div key={userStatus.user._id} className="user-item">
              <h3 style={{ color: "#000", textAlign: "center" }}>
                {userStatus.user.name}
              </h3>

              {userStatus.requestStatus === "You are friends." ? (
                <button
                  onClick={() => handleUnfriend(userStatus.user._id)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  Unfriend
                </button>
              ) : userStatus.requestStatus === "Not friends" ? (
                <button
                  onClick={() => handleAddFriend(userStatus.user._id)}
                  style={{ backgroundColor: "green", color: "white" }}
                >
                  Add Friend
                </button>
              ) : (
                <p style={{ color: "gray" }}>{userStatus.requestStatus}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchUsers;

