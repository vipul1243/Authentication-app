const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const localVariablesMiddleware = require("../middleware/localVariablesMiddleware");

/** import all controllers */
const {
  register,
  login,
  getUser,
  updateUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
  verifyUser,
} = require("../controllers/userController");
const { registerMail } = require("../controllers/mailer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split("/")[1];
    cb(null, `files-user-${uniqueSuffix}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.split("/")[1] === "jpeg" ||
    file.mimetype.split("/")[1] === "png" ||
    file.mimetype.split("/")[1] === "jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/** POST Methods */
router.route("/register").post(upload.single("profile"), register);
router.route("/registerMail").post(registerMail);
router.route("/authenticate").post(verifyUser, (req, res) => res.end());
router.route("/login").post(verifyUser, login);

/** GET Methods */
router.route("/user/:username").get(getUser);
router
  .route("/generateOTP")
  .get(verifyUser, localVariablesMiddleware, generateOTP);
router.route("/verifyOTP").get(verifyUser, verifyOTP);
router.route("/createResetSession").get(createResetSession);

/** PUT Methods */
router.route("/updateUser").put(upload.single("profile"), authMiddleware, updateUser);
router.route("/resetPassword").put(verifyUser, resetPassword);

module.exports = router;
