const express = require("express");
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingRequests,
  getUsers,
  getRecommendations,
  searchUsers,
  getFriends,
  updateProfile,
  unfriend
} = require("../controllers/userRequestController.js");

const {protect} = require("../middlewares/auth.js");

// Send a friend request
router.post("/send-request", protect, sendFriendRequest);

// Accept a friend request
router.post("/accept-request", protect, acceptFriendRequest);

// Decline a friend request
router.post("/decline-request", protect, declineFriendRequest);

// Get pending friend requests
router.get("/pending-requests", protect, getPendingRequests);

// Get all users for friend search
router.get("/users", protect, getUsers);

// Get friend recommendations
router.get("/recommendations", protect, getRecommendations);

// Get a user's friendlist
router.get("/friends", protect, getFriends);

//Get search results
router.get("/search-users", protect, searchUsers);

//Update Profile
router.put("/updateProfile", protect, updateProfile);

//Unfriend
router.post("/unfriend", protect, unfriend);


module.exports = router;
