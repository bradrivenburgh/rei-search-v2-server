module.exports = {
  PORT: process.env.PORT || 8000, 
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://user_name@localhost/database_name', // DB_URL fallback goes here
  CLIENT_ORIGIN: 'https://rei-search-v2-client.vercel.app/',
  STREETVIEW_API_KEY: process.env.STREETVIEW_API_KEY,
  STREETVIEW_SIGNATURE: process.env.STREETVIEW_SIGNATURE,
  CENSUS_API_KEY: process.env.CENSUS_API_KEY,
}