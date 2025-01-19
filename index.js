const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const swaggerDocs = require('./config/swagger');
require('dotenv').config();

const { setupRedis } = require('./config/redis');
const { setupPassport } = require('./config/passport');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());


setupPassport();

app.use('/api-docs', swaggerDocs.serve, swaggerDocs.setup);
app.use('/api', routes);


app.use(errorHandler);


mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('MongoDB connection error:', err));

setupRedis();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;