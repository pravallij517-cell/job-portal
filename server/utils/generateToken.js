import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
};

export default generateToken;
