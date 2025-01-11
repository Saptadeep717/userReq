import React, { useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
const UpdateProfile = () => {
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");

  const handleAddInterest = () => {
    setInterests((prev) => [...prev, newInterest]);
    setNewInterest("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/updateProfile`,
        { location, interests },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          withCredentials: true, 
        }
      );
      setLocation("");
      setInterests([]);
      alert("Profile Updated");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveBadge = (text) =>{
    const filteredData = interests.filter(e=> e !== text)
    setInterests(filteredData)
  }
  return (
    <div className="update-profile-container">
      <h2>Update Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Add Interest"
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
        />
        <button type="button" onClick={handleAddInterest}>
          Add Interests
        </button>
        <div className="interests-list">
          {interests?.map((interest, idx) => (
            <div class="badge-container">
              <div class="badge">
                {interest}
                <span class="close-btn" onClick={()=> handleRemoveBadge(interest)}>&times;</span>
              </div>
            </div>
          ))}
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default UpdateProfile;
