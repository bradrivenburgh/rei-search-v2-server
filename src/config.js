module.exports = {
  PORT: process.env.PORT || 8000, 
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://brad@localhost/reisearch",
  CLIENT_ORIGIN: 'https://rei-search-v2-client.vercel.app/',
  STREETVIEW_API_KEY: process.env.STREETVIEW_API_KEY,
  STREETVIEW_SIGNATURE: process.env.STREETVIEW_SIGNATURE,
  CENSUS_API_KEY: process.env.CENSUS_API_KEY,
  MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
}

// https://jdbc.postgresql.org/documentation/head/connect.html

/*
Connection information for default credential.
Connection info string:
   "dbname=d8o94lei3hl2v4 host=ec2-54-156-73-147.compute-1.amazonaws.com port=5432 user=nvykwrqqczhghd password=29c4a17e29805ccee14ba866c92d4af51de6170f1b1203afdd649e1a39865ed0 sslmode=require"
Connection URL:
   postgres://nvykwrqqczhghd:29c4a17e29805ccee14ba866c92d4af51de6170f1b1203afdd649e1a39865ed0@ec2-54-156-73-147.compute-1.amazonaws.com:5432/d8o94lei3hl2v4
   postgres://nvykwrqqczhghd:29c4a17e29805ccee14ba866c92d4af51de6170f1b1203afdd649e1a39865ed0@ec2-54-156-73-147.compute-1.amazonaws.com:5432/d8o94lei3hl2v4?sslmode=require
psql -d d8o94lei3hl2v4 -h ec2-54-156-73-147.compute-1.amazonaws.com -p 5432 -U nvykwrqqczhghd

no pg_hba.conf entry for host
https://askubuntu.com/questions/256534/how-do-i-find-the-path-to-pg-hba-conf-from-the-shell
https://confluence.atlassian.com/jirakb/error-connecting-to-database-fatal-no-pg_hba-conf-entry-for-host-x-x-x-x-user-jiradbuser-database-jiradb-ssl-off-950801726.html
   */

  /*
  \!
  \? variables
    PSQLRC
    SHELL
  \dA
  \dS
    Schema      Naame                             Type        Owner
   pg_catalog | pg_hba_file_rules               | view     | postgres
  */

//  https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js