const User = require("../models/user.model");
const FriendRequest = require("../models/request.model");

// Send Friend Request
exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;
  console.log("senderId",senderId);
  console.log("receiverId",receiverId);
  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ msg: "Receiver not found" });
    }

     if (senderId === receiverId) {
       return res.status(400).json({
         msg: "You cannot send a friend request to yourself.",
       });
     }else{
       // Check if already friends
       if (sender.friends.includes(receiverId)) {
         return res
           .status(400)
           .json({ msg: "You are already friends with this user" });
       }

       // Check for existing friend request (both directions)
       const existingRequest = await FriendRequest.findOne({
         $or: [
           { sender: senderId, receiver: receiverId, status: "pending" },
           { sender: receiverId, receiver: senderId, status: "pending" },
         ],
       });

       if (existingRequest) {
         return res.status(400).json({ msg: "Friend request already exists" });
       }

       const friendRequest = new FriendRequest({
         sender: senderId,
         receiver: receiverId,
       });

       await friendRequest.save();
       res.json({ msg: "Friend request sent successfully", friendRequest });
     }

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


// Accept Friend Request
exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.id;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ msg: "Friend request not found" });
    }

    if (request.receiver.toString() !== userId) {
      return res
        .status(403)
        .json({ msg: "You are not the recipient of this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ msg: "Friend request is already processed" });
    }

    request.status = "accepted";
    await request.save();

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    sender.friends.push(receiver.id);
    receiver.friends.push(sender.id);

    await sender.save();
    await receiver.save();

    res.json({ msg: "Friend request accepted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Decline Friend Request
exports.declineFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.id;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ msg: "Friend request not found" });
    }

    if (request.receiver.toString() !== userId) {
      return res
        .status(403)
        .json({ msg: "You are not the recipient of this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ msg: "Friend request is already processed" });
    }

    request.status = "declined";
    await request.save();

    res.json({ msg: "Friend request declined" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get Pending Friend Requests
exports.getPendingRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name");

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get all users for searching friends
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get friend recommendations (based on mutual friends,interest and location )
exports.getRecommendations = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch the current user and populate their friends list
    const user = await User.findById(userId).populate(
      "friends",
      "name location interests"
    );

    // Fetch all users from the database
    //const allUsers = await User.find();
    const allUsers = await User.find().populate(
      "friends",
      "name location interests"
    );

    const friendRequests = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    // Collect IDs of users involved in pending friend requests
    const pendingRequestIds = friendRequests
      .filter((req) => req.status === "pending")
      .map((req) =>
        req.sender.toString() === userId
          ? req.receiver.toString()
          : req.sender.toString()
      );
    // Collect IDs of users involved in pending friend requests
    const declinedRequestIds = friendRequests
      .filter((req) => req.status === "declined")
      .map((req) =>
        req.sender.toString() === userId
          ? req.receiver.toString()
          : req.sender.toString()
      );

    // Function to calculate recommendation score
    const calculateRecommendationScore = (targetUser) => {
      let score = 0;

      // Check for mutual friends
      const mutualFriends = targetUser.friends.filter((friend) =>
        user.friends.some(
          (userFriend) => userFriend.id.toString() === friend.id.toString()
        )
      );

      score += mutualFriends.length; // Increase score by the number of mutual friends

      // Check if they share the same location
      if (
        targetUser.location &&
        user.location &&
        targetUser.location.toLowerCase() === user.location.toLowerCase()
      ) {
        score += 2; // Give more weight if the location matches
      }

      // Check if they share any common interests
      const commonInterests = targetUser.interests.filter((interest) =>
        user.interests.some(
          (userInterest) =>
            userInterest.toLowerCase() === interest.toLowerCase()
        )
      );
      score += commonInterests.length; // Increase score by the number of common interests
       if (declinedRequestIds.includes(targetUser.id.toString())) {
         score -= 1000; // Apply a large penalty to push them to the bottom
       }


      return score;
    };

    // Map users to their recommendation score and sort them based on the score
    const recommendations = allUsers
      .filter(
        (u) =>
          u.id !== userId &&
          !user.friends.some(
            (friend) => friend.id.toString() === u.id.toString()
          ) &&
          !pendingRequestIds.includes(u.id)
      ) // Exclude the current user
      .map((u) => {
        u.password = undefined;
        const score = calculateRecommendationScore(u);
        return {
          user: u,
          score: score,
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by the score in descending order

    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


exports.getFriends = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate(
      "friends",
      "name location interests"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ 
      //user: user,
      friends: user.friends });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};






// Update User Profile (location and interests)
exports.updateProfile = async (req, res) => {
  const userId = req.user.id; // Get the userId from the JWT token

  // Destructure location and interests from the request body
  const { location, interests } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update the user's location and interests
    if (location && typeof location === "string") user.location = location; // Update location if provided
    if (interests && Array.isArray(interests)) user.interests = interests; // Update interests if provided

    // Save the updated user
    await user.save();

    res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


// Unfriend a friend
exports.unfriend = async (req, res) => {
  const { friendId } = req.body; // The friend's ID you want to unfriend
  const userId = req.user.id;    // The logged-in user's ID

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ msg: "User or friend not found" });
    }

    // Remove the friend from both users' friends lists
    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    // Save the updated users
    await user.save();
    await friend.save();

    res.json({ msg: "Unfriended successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


exports.searchUsers = async (req, res) => {
  const userId = req.user.id; // Logged-in user's ID

  try {
    const { query } = req.query; // Search query (can be name, email, etc.)

    // Search for users by name or other criteria
    const users = await User.find({
      name: { $regex: query, $options: "i" }, // Case-insensitive search
    }).select("name location interests friends"); // Select relevant fields

    // Check the status of each user (friend, pending request, etc.)
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if the logged-in user is friends with the searched user
        const isFriend = user.friends.includes(userId);

        // Check for pending friend requests (both incoming and outgoing)
        const pendingRequest = await FriendRequest.findOne({
          $or: [
            { sender: userId, receiver: user._id, status: "pending" }, // Outgoing request
            { sender: user._id, receiver: userId, status: "pending" }, // Incoming request
          ],
        });

        // Determine if it's an outgoing request or incoming request
        let requestStatus = "Not friends"; // Default status
        if (isFriend) {
          requestStatus = "You are friends."; // Already friends
        } else if (pendingRequest) {
          if (pendingRequest.sender.toString() === userId.toString()) {
            // Outgoing request (user sent the request)
            requestStatus = "Request Sent Already";
          } else {
            // Incoming request (user received the request)
            requestStatus = "Friend request pending.";
          }
        }

        return {
          user,
          requestStatus, // This will contain the correct status message
        };
      })
    );

    res.json(usersWithStatus); // Return the users with friend status
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

