// const { Pool } = require("pg");

const { PrismaClient } = require("@prisma/client");

// const DATABASE_UN = process.env.DATABASE_UN;
// const DATABASE_PW = process.env.DATABASE_PW;

// const db = new Pool({
//   host: "localhost",
//   user: DATABASE_UN,
//   database: "members_only",
//   password: DATABASE_PW,
//   port: 5432,
// });

// module.exports = db;

const prisma = new PrismaClient();

module.exports = prisma;
