import config from '../config.json';
import 'mysql2';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
db.ready = initialize().catch((err: any) => {
    console.error('DB initialization failed:', err);
    throw err;
});

export default db;

async function initialize() {
    const { host, port, user, password, database } = config.database;

    // Create DB if it doesn't exist
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // Connect to DB with Sequelize
    const sequelize = new Sequelize(database, user, password, {
        host,
        dialect: 'mysql',
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
