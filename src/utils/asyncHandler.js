const asyncHandler = (handlerFunc) => {
  return (req, res, next) => {
    Promise.resolve(handlerFunc(req, res, next)).catch(next);
  };
};

export default asyncHandler;

  