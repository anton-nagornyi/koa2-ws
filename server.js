import Koa from 'koa2';
import IO from 'koa-socket-2';
import {db} from "./db/db";
import {Message, ClientMessage} from './db/models';
import Sequelize from 'sequelize';

const {Op} = Sequelize;

const CHAT_ROOM = 'chat_room';

(async () => {
	await db.sync({force: true});
	const app = new Koa();
	const io = new IO();

	io.attach(app);

	io.on('connection', async (socket) => {
		socket.join(CHAT_ROOM);
	});

	io.on('message', async (ctx, data) => {
		const {socket} = ctx;

		const message = await Message.create({
			text: data,
			room_id: CHAT_ROOM,
			from_id: socket.handshake.query.id
		});

		const otherConnections = Array.from(socket.adapter.rooms.get(CHAT_ROOM)).filter((id) => id !== socket.id);

		const clients = otherConnections.map((id) => io.connections.get(id)).filter((client) => client);
		await Promise.all(clients.map(async (client) => {
			const clientMessage = await ClientMessage.create({
				message_id: message.id,
				client_id: client.handshake.query.id,
				status: 'new'
			});
			client.emit('message', [{id: message.id, from: message.from_id, text: data, status: clientMessage.status}]);
		}));
	});

	io.on('read', async (ctx, ids) => {
		return Promise.all(ids.map(async (id) => ClientMessage.update({status: 'read'}, {where: {message_id: id}})));
	});

	io.on('loadMore', async (ctx, data) => {
		const {socket} = ctx;
		const {last, before} = data;

		const messages = await Message.findAll({
			where: {
				id: {
					[Op.lt]: before
				},
				room_id: CHAT_ROOM
			},
			include: {
				model: ClientMessage
			},
			limit: Math.min(last, 10)
		});

		await Promise.all((messages).filter((message) => message.client_messages.length === 0).map(async (message) => {
			message.client_messages = [await ClientMessage.create({
				message_id: message.id,
				client_id: socket.handshake.query.id,
				status: 'new'
			})];
		}));

		socket.emit('message', messages.map((msg) => ({id: msg.id, from: msg.from_id, text: msg.text, status: msg.client_messages[0].status})));
	});
	app.listen(5000);
})();

