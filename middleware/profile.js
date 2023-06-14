// Middleware to verify if the user is the request is being made from the owner of the profile
export const verifyOwner = async (req, res, next) => {
  try {
    const actionFrom = req.body.actionFrom;
    const verifyActionFrom = req.user.email;

    if (verifyActionFrom !== actionFrom) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
