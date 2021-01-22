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

## Endpoints

### /api/search

* **Method:**

  `GET`

* **URL Params:**

  **Required:**

  `address=[string]`

* **Success Response:**

  **Code:** 200 <br />
  **Content**: `[
    {
      id: 1,
      property: {
        address: {
          streetAddress: "332 E Somerset St",
          city: "Philadelphia",
          state: "PA",
          zipcode: "19134",
          neighborhood: null,
          community: null,
          subdivision: null,
        },
        bedrooms: 3,
        bathrooms: 1,
        price: 80000,
        yearBuilt: 1935,
        longitude: -75.12525177001953,
        latitude: 39.99158477783203,
        description:
          "Description about property",
        livingArea: 1065,
        currency: "USD",
        url:
          "https://www.zillow.com/homedetails/332-E-Somerset-St-Philadelphia-PA-19134/10203588_zpid/",
        photos: [
          "https://photos.zillowstatic.com/fp/7a1264a3d683bd48ba1a96ec3ff8b5cb-p_f.jpg",
          "https://photos.zillowstatic.com/fp/62ff661fa1557f45ec3c111da9e06e25-p_f.jpg",
        ],
      },
    },
  ]`

* **Error Response:**

  **Code:** 401 UNAUTHORIZED <br />
  **Content:** `{ error: "Unauthorized request" }`

* **Sample Call:**

  `fetch('baseUrl/api/search?address=Philadelphia,PA', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    }
  })`

<br />

### /api/favorites

* **Method:**

  `GET` | `POST`

* **URL Params:**

  * `GET`: None
  * `POST`: None
 
* **Data Params:**

  `GET`: None <br />
  `POST`: 
  `{
      id: 1,
      property: {
        address: {
          streetAddress: "332 E Somerset St",
          city: "Philadelphia",
          state: "PA",
          zipcode: "19134",
          neighborhood: null,
          community: null,
          subdivision: null,
        },
        bedrooms: 3,
        bathrooms: 1,
        price: 80000,
        yearBuilt: 1935,
        longitude: -75.12525177001953,
        latitude: 39.99158477783203,
        description:
          "Description about property",
        livingArea: 1065,
        currency: "USD",
        url:
          "https://www.zillow.com/homedetails/332-E-Somerset-St-Philadelphia-PA-19134/10203588_zpid/",
        photos: [
          "https://photos.zillowstatic.com/fp/7a1264a3d683bd48ba1a96ec3ff8b5cb-p_f.jpg",
          "https://photos.zillowstatic.com/fp/62ff661fa1557f45ec3c111da9e06e25-p_f.jpg",
        ],
      },
    }`
  
* **Success Response:**

  `GET`:

    **Code:** 200 <br />
    **Content:** `[
      {
        id: 1,
        property: {
          address: {
            streetAddress: "332 E Somerset St",
            city: "Philadelphia",
            state: "PA",
            zipcode: "19134",
            neighborhood: null,
            community: null,
            subdivision: null,
          },
          bedrooms: 3,
          bathrooms: 1,
          price: 80000,
          yearBuilt: 1935,
          longitude: -75.12525177001953,
          latitude: 39.99158477783203,
          description:
            "Description about property",
          livingArea: 1065,
          currency: "USD",
          url:
            "https://www.zillow.com/homedetails/332-E-Somerset-St-Philadelphia-PA-19134/10203588_zpid/",
          photos: [
            "https://photos.zillowstatic.com/fp/7a1264a3d683bd48ba1a96ec3ff8b5cb-p_f.jpg",
          ],
        },
      },
    ]`
  
  `POST`:

    **Code:** 201 <br />
    **Content:** 
    `{
        id: 1,
        property: {
          address: {
            streetAddress: "332 E Somerset St",
            city: "Philadelphia",
            state: "PA",
            zipcode: "19134",
            neighborhood: null,
            community: null,
            subdivision: null,
          },
          bedrooms: 3,
          bathrooms: 1,
          price: 80000,
          yearBuilt: 1935,
          longitude: -75.12525177001953,
          latitude: 39.99158477783203,
          description:
            "Description about property",
          livingArea: 1065,
          currency: "USD",
          url:
            "https://www.zillow.com/homedetails/332-E-Somerset-St-Philadelphia-PA-19134/10203588_zpid/",
          photos: [
            "https://photos.zillowstatic.com/fp/7a1264a3d683bd48ba1a96ec3ff8b5cb-p_f.jpg",
          ],
        },
      }`


* **Error Response:**

  **Code:** 401 UNAUTHORIZED <br />
  **Content**: `{ error: "Unauthorized request" }`

  OR

  **Code:** 400 BAD REQUEST <br />
  **Content:** `{ error: { message: `Invalid property values provided: property' } }` <br />
  OR <br />
  **Content:** `{ error: { message: 'Required properties are missing: id, property'} }`

* **Sample Calls:**

  `GET`:

  `fetch('baseUrl/api/favorites', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    }
  })`

  `POST`:

  `fetch('baseUrl/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    },
    body: {...[see successful response example for object structure]}
  })`

<br />

### /api/favorites/:id

* **Method:**

  `DELETE`

* **URL Params:**

  * `id=[integer]`
 
* **Data Params:**

  None
  
* **Success Response:**

    **Code:** 204 <br />
    **Content:** None

* **Error Response:**

  **Code:** 401 UNAUTHORIZED <br />
  **Content**: `{ error: "Unauthorized request" }`

  OR

  **Code:** 404 NOT FOUND <br />
  **Content:** `{ error: { message: "Property does not exist" } }` <br />

* **Sample Call:**

  `fetch('baseUrl/api/favorites/1', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    }
  })`