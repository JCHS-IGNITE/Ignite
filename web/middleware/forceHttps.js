module.exports = (req, res, next) => {
  if (req.secure) next();
  else res.status(301).redirect(`https://${req.hostname}${req.url}`);
};
