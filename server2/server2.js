const http = require('http');
const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

class Server {
    constructor(port) {
        this.port = port || 3000;
    }

    start() {
        http.createServer((req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Allow-Control-Allow-Origin': '*'
            })   
        }).listen(this.port)
    }
}

class DatabaseConnection {

    connect(){
        console.log('Attempting connection to Aiven MySQL...');
        const connection = mysql.createConnection({
            host: 'mysql-6162002-comp4537-lab4.c.aivencloud.com',
            port: 21301,
            user: 'avnadmin',
            password: process.env.MYSQL_PASSWORD,
            database: 'defaultdb',
            ssl: {
                ca: process.env.DB_CA_CERT || fs.readFileSync('./ca.pem')
            }
        });

        connection.connect((err) => {
            if (err) {
                console.error('Error:', err.message);
                return;
            }
            console.log('Connected to the database!');
            connection.end();
        });
    }
}

const db = new DatabaseConnection();
db.connect();