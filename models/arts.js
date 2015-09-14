var Sequelize = require("sequelize");
var settings = require("./settings.js");
// var Category = require("./category.js")

var sequelize = new Sequelize(settings.db, settings.user, settings.password, {host : settings.host, port : settings.port, dialect : 'mysql'});


// module.exports = sequelize.define('User', {
// 	name: {
// 		type: Sequelize.STRING(100),
// 		allowNull: false,
// 		comment: 'user name',
// 	},
// 	ip: {
// 		type: Sequelize.STRING(64),
// 		allowNull: false,
// 		comment: 'user last request ip',
// 	},
// 	isNpmUser: {
// 		field: 'npm_user',
// 		type: Sequelize.BOOLEAN,
// 		allowNull: false,
// 		defaultValue: false,
// 		comment: 'user sync from npm or not, 1: true, other: false',
// 	}
// 	}, {
// 	tableName: 'user',
// 	comment: 'user base info',
// 	indexes: [
// 		{
// 		unique: true,
// 		fields: ['name']
// 		},
// 		{
// 		fields: ['gmt_modified']
// 		}
// 	],
// 	createdAt: 'gmt_create',
// 	updatedAt: 'gmt_modified',
// 	charset: 'utf8',
// 	collate: 'utf8_general_ci',
// });
// 
// 
var Arts = sequelize.define('Arts', {
	ID: {
		type: Sequelize.INTEGER(100),
		allowNull: true,
		autoIncrement : true,
		primaryKey : true,
		comment: '序列号'
	},
	TITLE: {
		type: Sequelize.STRING(300),
		allowNull: true,
		defaultValue: null,
		comment: '文章标题',
	},
	TITLE_HASH: {
		type: Sequelize.STRING(50),
		allowNull: true,
		defaultValue: null,
		comment: '文章标题加密字符串',
	},
	CATEGORY: {
		type: Sequelize.STRING(50),
		allowNull: true,
		defaultValue: null,
		comment: '文章分类',
	},
	BODY: {
		type: Sequelize.TEXT,
		allowNull: true,
		defaultValue: null,
		comment: '文章正文',
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


// Arts.belongsTo(Category, {as: 'Category', foreignKey: 'CATEGORY'});
// Category.hasMany(Arts, {as: 'Arts', foreignKey: 'CATEGORY'});

// 多表联查
// Arts.findAll({limit : 10, order : 'ID asc', include: [{model: Category, as: "Category", attributes: ["NAME"]}]});

module.exports = Arts;