var Sequelize = require("sequelize");
var settings = require("./settings.js");

var sequelize = new Sequelize(settings.db, settings.user, settings.password, {host : settings.host, port : settings.port, dialect : 'mysql'});

var Category = sequelize.define('Category', {
	ID: {
		type: Sequelize.INTEGER(100),
		allowNull: true,
		autoIncrement : true,
		primaryKey : true,
		comment: '序列号'
	},
	NAME: {
		type: Sequelize.STRING(50),
		allowNull: true,
		defaultValue: null,
		comment: '分类名称',
	},
	CREATEDAT: {
		type: Sequelize.DATE
	},
	UPDATEAT: {
		type: Sequelize.DATE
	}
}, {
	createdAt: 'CREATEDAT',
	updatedAt: 'UPDATEAT',
	charset: 'utf8',
	collate: 'utf8_general_ci',
});

module.exports = Category;