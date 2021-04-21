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
  **Content**: 
  ```
    {
      badRequest: false,
      apiStatistics: {
        economic: [
          {
            statistic: "Price-to-rent ratio",
            advisory: "(Lower is better)",
            CT: "-0.00",
            CTY: "15.55",
            MSA: "18.28",
          },
          {
            statistic: "Rental vacancy rate",
            CT: "0%",
            CTY: "4.7%",
            MSA: "5.1%",
          },
          {
            statistic: "Median household income",
            CT: "$117,708.00",
            CTY: "$87,416.00",
            MSA: "$72,343.00",
          },
          {
            statistic: "Top three sectors",
            advisory: "(Ordered by percentage of working population employed)",
            CT: [
              "Educational services, and health care and social assistance (26.3%)",
              "Professional, scientific, and management, and administrative and waste management services (14.7%)",
              "Manufacturing (13.2%)",
            ],
            CTY: [
              "Educational services, and health care and social assistance (25.6%)",
              "Professional, scientific, and management, and administrative and waste management services (12.2%)",
              "Retail trade (11.7%)",
            ],
            MSA: [
              "Educational services, and health care and social assistance (26.8%)",
              "Professional, scientific, and management, and administrative and waste management services (13%)",
              "Retail trade (10.5%)",
            ],
          },
          {
            statistic: "Top three occupations",
            advisory: "(Ordered by percentage of working population in occupation)",
            CT: [
              "Management, business, science, and arts occupations (52.3%)",
              "Sales and office occupations (18.5%)",
              "Production, transportation, and material moving occupations (13.6%)",
            ],
            CTY: [
              "Management, business, science, and arts occupations (44.7%)",
              "Sales and office occupations (23.6%)",
              "Service occupations (14.5%)",
            ],
            MSA: [
              "Management, business, science, and arts occupations (44.2%)",
              "Sales and office occupations (21.5%)",
              "Service occupations (16.8%)",
            ],
          },
        ],
        demographic: [
          {
            statistic: "Population growth rate",
            advisory: "(Higher is better)",
            CT: "N/A",
            CTY: "-0.76%",
            MSA: "2.18%",
          },
          {
            statistic: "Median age",
            CT: "44.1",
            CTY: "41.6",
            MSA: "38.8",
          },
          {
            statistic: "Race and ethnicity",
            CT: [
              "American Indian (0%)",
              "Asian (0.6%)",
              "Black (0.8%)",
              "Pacific Islander (0%)",
              "White (96.9%)",
              "Other (1.7%)",
            ],
            CTY: [
              "American Indian (0.1%)",
              "Asian (5.1%)",
              "Black (16.9%)",
              "Pacific Islander (0.1%)",
              "White (72%)",
              "Other (5.8%)",
            ],
            MSA: [
              "American Indian (0.2%)",
              "Asian (5.9%)",
              "Black (21%)",
              "Pacific Islander (0%)",
              "White (66.6%)",
              "Other (6.2%)",
            ],
          },
          {
            statistic: "Unemployment rate",
            CT: "3%",
            CTY: "5.7%",
            MSA: "5.3%",
          },
        ],
      },
      properties: [
        {
          id: 667,
          property: {
            url:
              "https://www.zillow.com/homedetails/806-Rancocas-Ave-Riverside-NJ-08075/38159373_zpid/",
            price: 289900,
            photos: [
              "https://photos.zillowstatic.com/fp/cadf575201a0d146f2c65f1d5090a32b-p_f.jpg",
              "https://photos.zillowstatic.com/fp/3b0121bfc40f95eb5c7f07c6c8a7b7b3-p_f.jpg",
              "https://photos.zillowstatic.com/fp/8bb38b2585ff87d6d44a50a518ceb630-p_f.jpg",
              "https://photos.zillowstatic.com/fp/a5f5dab31cc380365a6c05f4b76bd7a0-p_f.jpg",
              "https://photos.zillowstatic.com/fp/49e8ab436078c03928aaaa42ed0e2b81-p_f.jpg",
              "https://photos.zillowstatic.com/fp/52e96e1db6a57a0866d91091985030ff-p_f.jpg",
              "https://photos.zillowstatic.com/fp/2b62c4e4b8e2165e53714950acc34f23-p_f.jpg",
              "https://photos.zillowstatic.com/fp/de3013c50b167c1439acb7bee9059d45-p_f.jpg",
              "https://photos.zillowstatic.com/fp/877c25490d81c42e3ab39d91b733bb71-p_f.jpg",
              "https://photos.zillowstatic.com/fp/599fb2ecf5060dec783d9152e19b01d6-p_f.jpg",
              "https://photos.zillowstatic.com/fp/b9f3eed61a3dca3cdab71aff667c19e8-p_f.jpg",
              "https://photos.zillowstatic.com/fp/b8ca49237532c17de891ab4728eec711-p_f.jpg",
              "https://photos.zillowstatic.com/fp/bc6954714ee621db0764d16909c9dd7a-p_f.jpg",
              "https://photos.zillowstatic.com/fp/9d3467315a509d4b76b46d76e0ee2cd1-p_f.jpg",
              "https://photos.zillowstatic.com/fp/4d297ffb19e66384909e5b234b560b6f-p_f.jpg",
              "https://photos.zillowstatic.com/fp/59af8a773394c17a4d5c3163ab5e7303-p_f.jpg",
              "https://photos.zillowstatic.com/fp/d51e154bb8c095c81f185203d6e33a55-p_f.jpg",
              "https://photos.zillowstatic.com/fp/63f9c29e8094667ec1fe5b808f28a0a3-p_f.jpg",
              "https://photos.zillowstatic.com/fp/b463e2e7019a073ad7a53e27098637fe-p_f.jpg",
              "https://photos.zillowstatic.com/fp/0af7c7a5ee8ad2049f8ba2232a41e791-p_f.jpg",
              "https://photos.zillowstatic.com/fp/a05d245ebda281f10cd5f81bb23237b7-p_f.jpg",
              "https://photos.zillowstatic.com/fp/21e9bce63c2f7ac742edc1a88a26af8d-p_f.jpg",
              "https://photos.zillowstatic.com/fp/6d7364c78f09513713a3fe43b4419ee0-p_f.jpg",
              "https://photos.zillowstatic.com/fp/9bb8183a6ad76b2050dbe3c56dcae011-p_f.jpg",
              "https://photos.zillowstatic.com/fp/916bf45a367383920ca1e0cab4caaa56-p_f.jpg",
              "https://photos.zillowstatic.com/fp/f6df3e651f12356c5b4b71b22c628ae2-p_f.jpg",
              "https://photos.zillowstatic.com/fp/706b75d9196a6e9fa847da12a34ff5dd-p_f.jpg",
              "https://photos.zillowstatic.com/fp/ab4a3d7f62ce85ecb47ab6af3825691d-p_f.jpg",
              "https://photos.zillowstatic.com/fp/a48e43e582a91d6e650a9eec7ac6a862-p_f.jpg",
              "https://photos.zillowstatic.com/fp/e9a4204036c610f5b171397b975a3d07-p_f.jpg",
              "https://photos.zillowstatic.com/fp/52b5363c9ba60402f59b59202c682491-p_f.jpg",
            ],
            address: {
              city: "Riverside",
              state: "NJ",
              zipcode: "08075",
              community: null,
              subdivision: null,
              neighborhood: null,
              streetAddress: "806 Rancocas Ave",
            },
            bedrooms: 3,
            currency: "USD",
            latitude: 40.025489807128906,
            bathrooms: 2,
            longitude: -74.95941162109375,
            yearBuilt: 1957,
            livingArea: 1524,
            description:
              "Simply nothing like it and a rare find indeed. An elegantly, down to the studs, freshly remodeled split, in a terrific Riverside neighborhood on a large newly landscaped lot. Nearly everything is new but the wood. Enter an open floor plan with new laminate flooring. The centerpiece kitchen displays new premium cabinets, granite countertops, and all new stainless appliances. The dining room looks over the back yard through a new sliding door that opens to a maintenance-free composite deck with vinyl rails.  The upper level has three bedrooms, all with newly carpeted floors. The upper full bath has all-new fixtures, a shower/tub combination, tiled floors, and new vanity with granite countertops. The Ground level with new laminate floors and a family room opening to a new concrete patio. The full ground level bath has all-new fixtures, a shower, new vanity with a granite countertop. There is also a spacious laundry room and garage for storage, yard tools, and bicycles. Partial basement. Brand new heating and cooling, new 200-amp electrical service, new roof, and new windows. More photos and a video coming.",
          },
          distance: 4267.86643607,
        },
      ],
    };
  ```

* **Error Response:**

  **Code:** 401 UNAUTHORIZED <br />
  **Content:** `{ error: "Unauthorized request" }`

* **Sample Call:**

  ```
  fetch('baseUrl/api/search?address=Philadelphia,PA', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    }
  })
  ```

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
  ```
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
      user_id: 1
    }
  ```
  
* **Success Response:**

  `GET`:

    **Code:** 200 <br />
    **Content:** 
    ```
    [
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
        user_id: 1
      },
    ]
    ```
  
  `POST`:

    **Code:** 201 <br />
    **Content:** 
    ```
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
        user_id: 1
      }
    ```


* **Error Response:**

  `GET` | `POST`

  **Code:** 401 UNAUTHORIZED <br />
  **Content**: `{ error: "Unauthorized request" }`

  `POST`

  **Code:** 400 BAD REQUEST <br />
  **Content:**

  `{ error: { message: `Invalid property values provided: property' } }` 
  
  OR

  `{ error: { message: 'Required properties are missing: id, property'} }`

* **Sample Calls:**

  `GET`:

  ```
  fetch('baseUrl/api/favorites', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    }
  })
  ```

  `POST`:

  ```
  fetch('baseUrl/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    },
    body: {...[see successful response example for object structure]}
  })
  ```

<br />

### /api/favorites/:id

* **Method:**

  `DELETE`

* **URL Params:**

  * `id=[integer]`
 
* **Data Params:**

  None
  
* **Success Response:**

    **Code:** 204 NO CONTENT <br />
    **Content:** None

* **Error Response:**

  **Code:** 401 UNAUTHORIZED <br />
  **Content**: `{ error: "Unauthorized request" }`

  OR

  **Code:** 404 NOT FOUND <br />
  **Content:** `{ error: { message: "Property does not exist" } }` <br />

* **Sample Call:**

  ```
  fetch('baseUrl/api/favorites/1', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [insert api_token here]'
    }
  })
  ```