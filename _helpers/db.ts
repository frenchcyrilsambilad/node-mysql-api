import config from '../config.json';
import 'mysql2';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
let readyPromise: Promise<void> | null = null;
let initialized = false;

db.ensureReady = ensureReady;
db.ready = ensureReady();

export default db;

function ensureReady() {
    if (initialized) return Promise.resolve();

    if (!readyPromise) {
        readyPromise = initialize()
            .then(() => {
                initialized = true;
            })
            .catch((err: any) => {
                readyPromise = null;
                console.error('DB initialization failed:', err);
                throw err;
            });
    }

    return readyPromise;
}

async function initialize() {
    const { host, port, user, password, database, ssl } = getDatabaseConfig();

    // Create DB locally if it doesn't exist. Hosted DBs like Aiven already
    // provide the database and usually don't allow CREATE DATABASE.
    if (!process.env.VERCEL && !process.env.DATABASE_URL && !process.env.DB_HOST && !process.env.MYSQL_HOST) {
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();
    }

    // Connect to DB with Sequelize
    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        dialectOptions: ssl ? { ssl } : undefined,
        logging: false
    });

    // Init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    // Define relationships — this is what generates getRefreshTokens()
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Sync models with database
    await sequelize.sync();

    console.log('Database initialized successfully');
}

function getDatabaseConfig() {
    if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);

        return {
            host: url.hostname,
            port: Number(url.port || 3306),
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\//, ''),
            ssl: getSslConfig(url.hostname)
        };
    }

    const host = process.env.DB_HOST || process.env.MYSQL_HOST || config.database.host;
    const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || config.database.port || 3306);

    return {
        host,
        port,
        user: process.env.DB_USER || process.env.MYSQL_USER || config.database.user,
        password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || config.database.password,
        database: process.env.DB_NAME || process.env.MYSQL_DATABASE || config.database.database,
        ssl: getSslConfig(host)
    };
}

function getSslConfig(host: string) {
    if (process.env.DB_SSL === 'false' || process.env.MYSQL_SSL === 'false') return undefined;
    if (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true' || host !== 'localhost') {
        return { rejectUnauthorized: false };
    }

    return undefined;
}
