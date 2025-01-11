const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

// User Signup
exports.signup = async (req, res) => {

  const { name, password, location, interests } = req.body;

  if (!name || !password) {
    return res.status(403).send({
      success: false,
      message: "Name , password  are required",
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 6 characters.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const existingUser = await User.findOne({ name });
     if (existingUser) {
       // Distinguish between the same user signing up again or a new user trying to use the same name
       const isSameUser = await bcrypt.compare(password, existingUser.password);

       if (isSameUser) {
         return res.status(400).json({
           success: false,
           message: "You are already registered. Please login instead.",
         });
       } else {
         return res.status(400).json({
           success: false,
           message:
             "This name is already taken. If you are registered, please login. Otherwise, choose another name.",
         });
       }
     }

    const user = await User.create({
      name,
      password: hashedPassword,
      location,
      interests,
    });
    user.password = undefined;
    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// User Login
exports.login = async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({
      success: false,
      message: `Please Fill up All the Required Fields, name and password`,
    });
  }
  try {
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign(
        {
          name: user.name,
          id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "None",
        secure: false,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
      //res.status(200).json({success: true, token,user,message: `User Login Success`});
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};
