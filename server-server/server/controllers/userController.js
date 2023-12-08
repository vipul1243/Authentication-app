const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");

const fs = require("fs/promises");
const path = require("path");

exports.verifyUser = async (req, res, next) => {
  try {
    const { username } = req.method === "GET" ? req.query : req.body;
    let exist = await User.findOne({ username: username });
    if (!exist) {
      return res.status(389).send({
        success: false,
        message: "Can't find User!",
      });
    }
    next();
  } catch (error) {
    return res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

exports.register = async (req, res) => {
  try {
    if (req.file === undefined) {
      return res.send({
        success: false,
        message: "Please select Profile Image",
      });
    }

    const usernameExists = await User.findOne({ username: req.body.username });
    if (usernameExists) {
      const filePath = path.join(__dirname, "../../public", req.file.filename);
      await fs.unlink(filePath);
      return res.send({
        success: false,
        message: "Please use unique username",
      });
    }

    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      const filePath = path.join(__dirname, "../../public", req.file.filename);
      await fs.unlink(filePath);
      return res.send({
        success: false,
        message: "This Email is already registered with us",
      });
    }

    req.body.profile = req.file.filename;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new User(req.body);
    await user.save();

    return res.status(201).send({
      success: true,
      message: "User registered Successfully",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.send({
        success: false,
        message: "Username not Found",
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.send({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    return res.send({
      success: true,
      message: "User Login Successful...!",
      username: user.username,
      data: token,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.send({
        success: false,
        message: "Couldn't Find the User",
      });
    }

    user.password = undefined;

    return res.send({
      success: true,
      message: "User Fetched Successfully",
      data: user,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.body.userId;
    if (!id) {
      return res.send({
        success: false,
        message: "User Not Found...!",
      });
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.send({
        success: false,
        message: "Session Expired!",
      });
    }

    if (req.file !== undefined) {
      const filePath = path.join(__dirname, "../../public", user.profile);
      await fs.unlink(filePath);
      req.body.profile = req.file.filename;
    }
    else {
      req.body.profile = user.profile;
    }

    const body = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: body,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.send({
        success: false,
        message: "User not found",
      });
    }

    const updatedData = await User.findOne({ _id: id });
    updatedData.password = undefined;

    return res.send({
      success: true,
      message: "Record Updated...!",
      data: updatedData,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.generateOTP = async (req, res) => {
  try {
    req.app.locals.OTP = await otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    return res.status(201).send({
      success: true,
      message: "OTP Generated",
      code: req.app.locals.OTP,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
      req.app.locals.OTP = null;
      req.app.locals.resetSession = true;
      return res.status(201).send({
        success: true,
        message: "Verify Successfully!",
      });
    }
    return res.send({
      success: false,
      message: "Invalid OTP",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.createResetSession = async (req, res) => {
  try {
    if (req.app.locals.resetSession) {
      return res.send({
        success: true,
        message: "Access Granted!",
        flag: req.app.locals.resetSession,
      });
    }
    return res.send({
      success: false,
      message: "Session expired!",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession) {
      return res.status(500).send({
        success: false,
        message: "Session expired!",
      });
    }

    const { username, password } = req.body;

    const usernameExists = await User.findOne({ username: username });
    if (!usernameExists) {
      return res.status(500).send({
        success: false,
        message: "Username not Found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const updatedUser = await User.findByIdAndUpdate(
      usernameExists._id,
      {
        $set: req.body,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).send({
        success: false,
        message: "User not found",
      });
    }

    req.app.locals.resetSession = false;

    return res.status(201).send({
      success: true,
      message: "Password Reset successfully",
    });
  } catch (error) {
    return res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};
