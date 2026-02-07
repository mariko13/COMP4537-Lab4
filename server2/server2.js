const http = require('http');
const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

class Server {
    constructor(port) {
        this.port = port || 8000;
        this.db = new DatabaseHandler(fs);
    }

    sendError(res, err, header) {
        res.writeHead(500, header);
        res.end(JSON.stringify({ error: err.message }));
    }

    start() {
        http.createServer((req, res) => {

            const header = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            };
            
            if (req.method === 'OPTIONS') {
                res.writeHead(204, header);
                res.end();
                return;
            }
            
            // AI Disclosure: Google Gemini suggested connecting to the database with two separate users through different endpoints.
            // insert() uses admin user
            if (req.method === 'POST' && req.url === '/insert') {
                this.db.insert((err, result) => {
                    if (err) return this.sendError(res, err, header);
                    res.writeHead(200, header);
                    res.end(JSON.stringify({ message: 'Data inserted successfully', result }));
                });
            }

            // readOnlyQuery() uses readonly user (no DROP/DELETE/INSERT/UPDATE permissions)
            if (req.method === 'GET' && req.url.includes('/api/v1/sql/')) {
                const rawQuery = req.url.split('/api/v1/sql/')[1];
                const sql = decodeURIComponent(rawQuery).replace(/"/g, '');

                this.db.readOnlyQuery(sql, (err, results) => {
                    if (err) {
                        res.writeHead(403, header);
                        return res.end(JSON.stringify({ error: "Unauthorized operation" }));
                    }
                    res.writeHead(200, header);
                    res.end(JSON.stringify(results));
                });
            }
        }).listen(this.port)
        console.log(`Server running at http://localhost:${this.port}/`);
    }
}

class DatabaseHandler {
    constructor(fs) {
        this.baseConfig = {
            host: 'mysql-6162002-comp4537-lab4.c.aivencloud.com',
            port: 21301,
            database: 'defaultdb',
            ssl: {
                ca: fs.readFileSync(__dirname + '/ca.pem')
            }
        }
    }

    getConnection(role) {
        const config = { ...this.baseConfig };
        if (role === 'admin') {
            config.user = 'avnadmin';
            config.password = process.env.ADMIN_PASSWORD;
        } else {
            config.user = 'readonly_user';
            config.password = process.env.READONLY_PASSWORD;
        }
        return mysql.createConnection(config);
    }

    insert(callback) {
        const connection = this.getConnection('admin');
        const createTable = `CREATE TABLE IF NOT EXISTS patient (
            patientid INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            dateofbirth DATE NOT NULL
        ) ENGINE=InnoDB;`;

        const insertData = `INSERT INTO patient (name, dateofbirth) VALUES
        ('Sara Brown', '1901-01-01'),
        ('John Smith', '1941-01-01'),
        ('Jack Ma', '1961-01-30'),
        ('Elon Musk', '1999-01-01');`;

        connection.query(createTable, (err) => {
            if (err) return callback(err);
            connection.query(insertData, (err, result) => {
                connection.end();
                callback(err, result);
            })
        })
    }

    readOnlyQuery(sql, callback) {
        const connection = this.getConnection('reader');
        connection.query(sql, (err, results) => {
            connection.end();
            callback(err, results);
        })
    }
}

const server = new Server(process.env.PORT || 8000);
server.start();