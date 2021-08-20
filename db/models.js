import Sequelize from 'sequelize';
import {db} from "./db";

const { DataTypes, Model } = Sequelize;

export class Message extends Model {}
export class ClientMessage extends Model {}

Message.init({
	text: {
		type: DataTypes.STRING,
		allowNull: false
	},
	room_id: {
		type: DataTypes.STRING(70),
		allowNull: false
	},
	from_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
}, {
	sequelize: db,
	modelName: 'messages'
});


ClientMessage.init({
	message_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	client_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	status: {
		type: DataTypes.ENUM('new', 'read')
	}
}, {
	sequelize: db,
	modelName: 'client_messages'
});

ClientMessage.belongsTo(Message, {
	foreignKey: 'message_id'
});
Message.hasMany(ClientMessage, {
	foreignKey: 'message_id'
});
