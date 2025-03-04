const sql = require('mssql');

const config = {
    user : 'j2',
    password : '123456',
    server : 'dev.c5owyuw64shd.ap-south-1.rds.amazonaws.com',
    database : 'JIBE_Main_Training',
    port : 1982,
    options : {
        encrypt : true,
        trustServerCertificate : true
    }
}

const poolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool => {
    console.log('Connected to SQL Server');
    return pool;
})
.catch(error => {
    console.log(error);
})


module.exports = {
    poolPromise, 
    sql
}