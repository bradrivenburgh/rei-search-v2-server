# rei-search-v2-server

This is the api and database for the rei-search-v2 project.

## Set up

Complete the following steps to run the server:

1. Clone this repository to your local machine `git clone REI-SEARCH-V2-SERVER-URL REI-SEARCH-V2-SERVER (or whatever project name you want)`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.