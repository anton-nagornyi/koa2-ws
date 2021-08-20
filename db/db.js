import { Sequelize } from 'sequelize';

export const db = new Sequelize('koa2-ws-test', 'postgres', '1', {
	host: 'localhost',
	dialect: 'postgres'
});
