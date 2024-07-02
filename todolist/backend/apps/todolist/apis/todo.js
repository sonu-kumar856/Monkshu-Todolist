const sqlite3 = require('sqlite3').verbose();
const API_CONSTANTS = require(`${CONSTANTS.ROOTDIR}/lib/constants`);
const utils = require(`${CONSTANTS.ROOTDIR}/lib/utils`);

// Open the database
let db = new sqlite3.Database('./todos.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the todos database.');
});

// Create todos table if not exists
db.run(`CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL,
    createdAt INTEGER NOT NULL
)`);

exports.doService = async jsonReq => {
    if (!validateRequest(jsonReq)) return API_CONSTANTS.API_RESPONSE_FALSE;
    
    try {
        switch(jsonReq.operation) {
            case "add": return await addTodo(jsonReq.todo);
            case "list": return await listTodos();
            case "delete": return await deleteTodo(jsonReq.id);
            case "update": return await updateTodo(jsonReq.id, jsonReq.todo);
            default: return API_CONSTANTS.API_RESPONSE_FALSE;
        }
    } catch (error) {
        console.error(error);
        return API_CONSTANTS.API_RESPONSE_FALSE;
    }
}

const addTodo = todo => {
    return new Promise((resolve, reject) => {
        const newTodo = { id: utils.uniqid(), ...todo, createdAt: utils.getCurrentTimestamp() };
        db.run(`INSERT INTO todos(id, text, completed, createdAt) VALUES(?, ?, ?, ?)`, 
            [newTodo.id, newTodo.text, newTodo.completed ? 1 : 0, newTodo.createdAt],
            function(err) {
                if (err) reject(err);
                resolve({ result: true, todo: newTodo });
            }
        );
    });
}

const listTodos = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM todos`, [], (err, rows) => {
            if (err) reject(err);
            resolve({ result: true, todos: rows.map(row => ({...row, completed: row.completed === 1})) });
        });
    });
}

const deleteTodo = id => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM todos WHERE id = ?`, id, function(err) {
            if (err) reject(err);
            // After successful deletion, fetch the updated list
            db.all(`SELECT * FROM todos`, [], (err, rows) => {
                if (err) reject(err);
                resolve({ 
                    result: true, 
                    todos: rows.map(row => ({...row, completed: row.completed === 1}))
                });
            });
        });
    });
}

const updateTodo = (id, updatedTodo) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE todos SET completed = ? WHERE id = ?`, 
            [updatedTodo.completed ? 1 : 0, id],
            function(err) {
                if (err) reject(err);
                // After successful update, fetch the updated list
                db.all(`SELECT * FROM todos`, [], (err, rows) => {
                    if (err) reject(err);
                    resolve({ 
                        result: true, 
                        todos: rows.map(row => ({...row, completed: row.completed === 1}))
                    });
                });
            }
        );
    });
}

const validateRequest = jsonReq => (jsonReq && jsonReq.operation);

// Close the database connection when the Node process ends
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});