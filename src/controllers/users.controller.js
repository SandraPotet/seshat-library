// voir la page de l'utilisateur connecté
export const getMe = (req, res) => {
  res.json(req.user);
};