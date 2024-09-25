const authJwtHandler = (user, statusCode, res, message) => {
  const token = user.getJwtToken();
  console.log("token",token)
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};

export default authJwtHandler;