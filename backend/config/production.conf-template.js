module.exports = {
    accessLog: "access.log",
    applicationLog: 'application.log',

    mongoDB: 'mongodb://127.0.0.1:27017/seminar',
    MONGODB_dbname: 'seminar',

    MYSQL_host: "127.0.0.1",
    MYSQL_port: 3306,
    MYSQL_user: "root",
    MYSQL_password: "yourpassword",
    MYSQL_database: "dbname",

    REDIS_host: "127.0.0.1",
    REDIS_port: 6379,

    seminarDB: {
        userDetail: "user_details"
    },

    cookies: {
        signed: true,
        secreteKey: "SSdtIG5hcm9uZ3NhayBtYWxh"
    },

    surveySetting: {
        version: 1,
        round: 1,
    },
    
    tokenExpiredTime: 60
};
