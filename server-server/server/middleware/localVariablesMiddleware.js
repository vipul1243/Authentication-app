module.exports = function (req, res, next) {
  try {
    req.app.locals = {
      OTP: null,
      resetSession: false,
    };
    next();
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
};
