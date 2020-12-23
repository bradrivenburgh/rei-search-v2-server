module.exports = {
  PORT: process.env.PORT || 8000, 
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://user_name@localhost/database_name', // DB_URL fallback goes here
  CLIENT_ORIGIN: '',
  STREETVIEW_API_KEY: process.env.STREETVIEW_API_KEY,
  STREETVIEW_SIGNATURE: process.env.STREETVIEW_SIGNATURE,
}