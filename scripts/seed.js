// Import required modules
require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const movies = require('./placeholder-data.js');


// Construct the connection string from individual components
const connectionString = `postgresql://${process.env.POSTGRES_USER}:` +
                         `${process.env.POSTGRES_PASSWORD}@` +
                         `${process.env.POSTGRES_HOST}/` +
                         `${process.env.POSTGRES_DATABASE}`;

// Create a new pool using the constructed connectionString
const pool = new Pool({
    connectionString: connectionString,
    // If your database requires SSL but you are in a development environment that doesn't support it,
    // you might need to add ssl: { rejectUnauthorized: false } to the pool configuration.
    ssl: { rejectUnauthorized: false }
});

// Function to check if the 'movies' table exists
const checkTableExists = async () => {
    const query = `
        SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE  schemaname = 'public'
            AND    tablename  = 'movies'
        );
    `;
    const res = await pool.query(query);
    return res.rows[0].exists;
};

// Function to create the 'movies' table
const createTable = async () => {
    const query = `
        CREATE TABLE movies (
            id SERIAL PRIMARY KEY,
            image TEXT NOT NULL,
            name VARCHAR(255) NOT NULL,
            release_date DATE NOT NULL,
            genre VARCHAR(100) NOT NULL
        );
    `;
    await pool.query(query);
    console.log('Table created successfully.');
};

// Function to seed the 'movies' data into the table
const seedData = async () => {
    for (let movie of movies) {
        const { image, name, release_date, genre } = movie;
        const query = `
            INSERT INTO movies (image, name, release_date, genre)
            VALUES ($1, $2, $3, $4);
        `;
        await pool.query(query, [image, name, release_date, genre]);
    }
    console.log('Data seeded successfully.');
};

// Main function to run the seed script
const main = async () => {
    const exists = await checkTableExists();
    if (!exists) {
        await createTable();
    }
    await seedData();
    await pool.end();
};

main().catch(console.error);
