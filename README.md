# rei-search-v2-server

This is the api and database for the rei-search-v2 project.

## Set up

Complete the following steps to run the server locally:

1. Clone this repository to your local machine `git clone REI-SEARCH-V2-SERVER-URL REI-SEARCH-V2-SERVER (or whatever project name you want)`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
6. Provision a PostgreSQL DB with the PostGIS extension installed.
7. Run `npm run migrate -- 1` to create the tables for property information and favorite properties.
8. Download the JSON files linked [here](https://drive.google.com/drive/folders/1K-dWvBBdSycpjW39xsGlK-zb16n4j48O?usp=sharing) that contain the property objects and coordinates.
9. Seed the tables using SQL commands in the file `seed.props_and_coords_tables.sql`.  You will need to replace the path provided with the path to the `coordinates.json` and `properties.json` on your machine.
10. Run `npm run migrate -- 2` to update the properties table in your database with the corresponding column from the coordinates table.
11. Create a `.env` file and include the following: 
* API_TOKEN (this will also need to be used )
* CENSUS_API_KEY (get one from the [Census Bureau](https://api.census.gov/data/key_signup.html))
* MAPBOX_API_KEY (get one from [Mapbox](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/))
* DATABASE_URL
12. In `config.js`, provide the client url you will be using to connect to the API or disable the cors() middleware in `app.js`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.  

You will need to provision a postgreSQL database with the PostGIS extension on Heroku.  All environmental variables above will need to set up in your Heroku config (e.g., `heroku config:set var=value`), along with the following variable: `PGSSLMODE=no-verify`.

Seeding the Heroku database by connecting to your database (`heroku pg:psql`) and using the SQL command in the seed file won't work due to permissions issues, but the following will:
1. Deploy your `coordinates.json` and `properties.json` files to your Heroku server
2. Get your database credentials by running `heroku pg:credentials:url`
3. Run `heroku run bash` to enter a command-line environment on your server.
4. Run the following commands, filling in your own information.  You will be prompted for your database password after each command.
* `cat /app/property-data/coordinates.json | psql -h <host> -p <port> -d <database> -U <user> -c "COPY coordinates (coordinate) FROM STDIN;"`
* `cat /app/property-data/coordinates.json | psql -h <host> -p <port> -d <database> -U <user> -c "COPY properties (property) FROM STDIN;"`

If all went well the API should be deployed and provisioned with your dataset.