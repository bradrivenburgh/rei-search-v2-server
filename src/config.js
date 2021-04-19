module.exports = {
  PORT: process.env.PORT || 8000, 
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://brad@localhost/reisearch",
  CLIENT_ORIGIN: 'https://rei-search-v2-client.vercel.app',
  STREETVIEW_API_KEY: process.env.STREETVIEW_API_KEY,
  STREETVIEW_SIGNATURE: process.env.STREETVIEW_SIGNATURE,
  CENSUS_API_KEY: process.env.CENSUS_API_KEY,
  MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
}