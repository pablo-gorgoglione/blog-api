const mongoose = require('mongoose');

module.exports.db = () => {
  try {
    mongoDB = '';
    if (process.env.NODE_ENV === 'development') {
      mongoDB = process.env.DB_STRING_DEVELOPMENT;
      console.log('Using DEVELOPMENT database');
    } else if (process.env.NODE_ENV === 'test') {
      mongoDB = process.env.DB_STRING_TEST;
      console.log('Using TEST database');
    }
    mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection;
  } catch (error) {
    console.log(error);
  }
};
