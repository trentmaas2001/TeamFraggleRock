# MongoDB Setup

## MongoDB Installation
This application runs against a MongoDB database so if you are a customer who is setting up their database alongside this application or a developer setting up a test databse you should follow the installation guide found here and set up your database.

[MongoDB Installation Guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)

## Database Requirements
Any Database that is used by this application should have 5 collections: InWork, Approved, Logging, Users, and Review. Upon installation of the application these collections should be empty

## Application Connection to Database
A connection string for your database must be provided to the application. Currently this must be provided in the connString variable on line 2 of database.js. The Database name must also be specified on line 4 of dbFunction.js in the same manner.