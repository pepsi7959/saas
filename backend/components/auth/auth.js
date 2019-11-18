// MIT License

// Copyright 2019-present, Digital Government Development Agency (Public Organization) 

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const base64url = require('base64url')
const mysql = require('mysql');
const promise = require('promise');
const winston = require('../../commons/logger');
const http = require('../../commons/http');
const appConf = require('../../config/production.conf');
const redis = require("redis");
const logger = winston.logger;
const router = express.Router();


// Login 
// require username and password

function getConnection(){
    var conn = mysql.createConnection({
        host: appConf.MYSQL_host,
        port: appConf.MYSQL_port,
        user: appConf.MYSQL_user,
        password: appConf.MYSQL_password,
        database: appConf.MYSQL_database
    });
    return new promise(function(resolve, reject){
        conn.connect(function(err) {
            if ( err ) {
                logger.error( "mysql connect failed" );
                reject( err );
            } else {
                logger.debug( "mysql connected" );
                resolve( conn );
            }
        })
    });
}

function getUserDetails( conn, userName, password )
{
    const qstr = "SELECT * FROM user_details \
    INNER JOIN passwords on user_details.UserId = passwords.Username \
    WHERE passwords.username = '" + userName + "' and passwords.password = '"+ password +"'";

    return new promise(function(resolve, reject) {
        conn.query(qstr, function(err, result, fields){
            if ( err ) {
                logger.error( "query failed: " + err );
                reject( err );
            }
            else {
                conn.end();
                resolve( result[0] );
            }
        });
    });
}

function getRedisConnection(){

    const redisCli = redis.createClient({
        port      : appConf.REDIS_port,               // replace with your port
        host      : appConf.REDIS_host,        // replace with your hostanme or IP address
    });

    return new promise( function (resolve, reject) {
        redisCli.on("error", function (err) {
            if ( err ) {
                logger.error("redis: " + err);
                reject( err );
            }
        });

        redisCli.on("connect", function() {
            resolve( redisCli );
        });
    });
}

function redisSet( redisCli, key, value, exp ){
    let expire = exp !== undefined ? exp : 3600;
    logger.debug( "Begin to set value on redis " + "key=[" + key + "]" + "value=[" + value + "]" );
    return new promise( function ( resolve, reject ){
        redisCli.set(key, value, 'EX', expire, function(err, reply){
            if( err ) {
                logger.error("redis: " + err);
                reject( err );
            } else {
                logger.debug("redis: " + reply);
                resolve( reply );
            }
        });
    });
}

function redisGet( redisCli, key ){
    return new promise( function ( resolve, reject ){
        redisCli.get( key, function( err, reply ){
            if( err ) {
                logger.error("redis: " + err);
                reject( err );
            } else {
                logger.debug("redis: " + reply);
                resolve( reply );
            }
        });
    });
}

function login(req, res) {

    var ctx = req.body;
    const userid = ctx.userId;
    const password = ctx.password;
    var token = base64url(crypto.randomBytes(48));

    let mysql = getConnection();
    let redis;
    var userDetails;

    return new promise( function( resolve, reject ) {
        mysql.catch( err => {
            http.error(res, 500, 500100, "connect to mysql failed: " + err);
            reject( err );
        })
        .then( (mysqlConn) => {
                return getUserDetails(mysqlConn, userid, password);
        })
        .catch( err => {
            http.error(res, 500, 500200, "query mysql failed: " + err);
            reject( err );
        })
        .then( usrDetails => {
            if ( usrDetails === undefined ) {
                logger.error( "Not found " + userid );
                http.error(res, 401, 401000, "invalid user or password");
                reject( "Not found " + userid );
            } else {
                userDetails = usrDetails;
                logger.debug( "User Details: " + JSON.stringify( usrDetails ) );
                return getRedisConnection();
            }
        })
        .catch( err => {
            reject( err );
            http.error(res, 500, 500100, "connect to redis failed: " + err);
        })
        .then( redisConn => {
            return redisSet( redisConn, userid, token, 60 * appConf.tokenExpiredTime );
        })
        .catch( err => {
            reject( err );
            http.error(res, 500, 500200, "set value on redis failed: " + err);
        })
        .then( reply => {

            let options = {
                maxAge: 1000 * 60 * appConf.tokenExpiredTime,         // would expire after 15 minutes
                httpOnly: true,                 // The cookie only accessible by the web server
                signed: appConf.cookies.signed  // Indicates if the cookie should be signed
            }    
            
            res.cookie('userid', userDetails.UserID, options);
            res.cookie('token', token, options);

            http.success(res, { 
                id: userDetails.UserID,
                name: userDetails.Name,
                surname: userDetails.Surname,
                nameEN: userDetails.NameEn,
                surnameEN: userDetails.SurnameEn,
                nickName: userDetails.NickName,
                tel: userDetails.Telephone,
                email: userDetails.Email,
                position: userDetails.Position,
                department: userDetails.Department,
                devision: userDetails.Segment,
                level: userDetails.Level,
                role: userDetails.Role,
                token: token
            });
            resolve( true );
        })
        .catch( err => {
            http.error(res, 500, 500000, "server error: " + err);
            reject( err ) 
        });
    });
}

module.exports = {
    login,
    getConnection,
    getUserDetails,
    getRedisConnection,
    redisGet,
    redisSet
}