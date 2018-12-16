// // let's go!
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

server.express.use(async (req, res, next) => {
  if (!req.userId) return next();

  const user = await db.query.users({
    where: {
      id: req.userId
    }
  }, `{ id, name, email }`);
  req.user = user;
  next();
})

// server.start({}, deets => {
//   console.log(`Server is running http://localhost:${deets.port}`);
// })

server.start(() => console.log(`Server is running on http://localhost:4444`))