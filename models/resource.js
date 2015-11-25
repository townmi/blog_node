var Sequelize = require("sequelize");
var settings = require("./settings.js");

var sequelize = new Sequelize(settings.db, settings.user, settings.password, {host : settings.host, port : settings.port, dialect : 'mysql', logging: function (str) {
	log.info(str+"<!log>");
}});


var Resource = sequelize.define('Resource', {
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
		comment: '资源原始名称',
	},
	URL: {
		type: Sequelize.STRING(100),
		allowNull: true,
		defaultValue: null,
		comment: '资源地址',
	},
	CATEGORY: {
		type: Sequelize.STRING(50),
		allowNull: true,
		defaultValue: null,
		comment: '资源分类',
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

module.exports = Resource;