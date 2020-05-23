// https://medium.com/safara-engineering/wiring-up-typeorm-with-serverless-5cc29a18824f
import {
  ConnectionManager,
  getConnectionManager,
  Connection,
  ConnectionOptions,
  createConnection,
} from 'typeorm';
import entities from './entity';

export default class Database {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = getConnectionManager();
  }

  async connect() {
    const connectionOptions: ConnectionOptions = {
      name: 'default',
      type: 'mariadb',
      host: process.env.DEV_DB_HOST,
      port: Number(process.env.DEV_DB_PORT),
      username: process.env.DEV_DB_USERNAME,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_DATABASE,
      charset: 'utf8mb4_unicode_ci',
      connectTimeout: 10000,
      logging: ['query'],
      // timezone: '-09:00',
      extra: {
        connectionLimit: 10,
      },
      synchronize: true,
      entities,
    };

    return await createConnection(connectionOptions);
  }

  async getConnection(): Promise<Connection> {
    const CONNECTION_NAME = `default`;
    if (this.connectionManager.has(CONNECTION_NAME)) {
      const connection = this.connectionManager.get(CONNECTION_NAME);
      try {
        if (connection.isConnected) {
          await connection.close();
        }
      } catch (e) {}
      return connection.connect();
    }
    return await this.connect();
  }
}
