import 'dotenv/config';
import { join } from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'crud-app',
  //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // entities: [__dirname + '../**/*.entity{.ts,.js}'],
  // migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  entities: [join(__dirname, '..', '..', '/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', '/database/migrations/**/*{.ts,.js}')],

  synchronize: false, // Set to false in production
  //   logging: true, // optional
});

export default dataSource;
