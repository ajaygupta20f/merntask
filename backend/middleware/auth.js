const admin = require('firebase-admin');
const User = require('../models/User');


const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}


const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
   
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Verifying token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    
    req.user = decodedToken;
    
  
   let user = await User.findOne({ uid: decodedToken.uid });
if (!user) {
  console.log('Creating new user in MongoDB');
  user = new User({
    uid: decodedToken.uid,  
    email: decodedToken.email,
    role: 'user'
  });
  await user.save();

     
    } else {
      console.log('Existing user found:', user);
    }
    
    req.userRole = user.role;
    req.userDoc = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
};


const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
