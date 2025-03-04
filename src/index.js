const express = require('express')
const EventEmitter = require('events')
const { sql, poolPromise} = require('./database')

const PORT = 3000;
const app = express();
app.use(express.json())

let processedOrders = [];
let processingOrders = [];

const orderEvent = new EventEmitter();

orderEvent.on('orderPrepared', (orderId)=>{
    processedOrders.push(orderId);
    processingOrders.pop(orderId);
})


app.post("/order", async (req, res) => {
    const {order} = req.body;
    
    if(order){
        if(isOrderProcessed(order.orderId)){
            return res.status(200).send(`Order with id ${order.orderId} has been processed`);
        }
        else{
            processingOrders.push(order.orderId);
            const orderStatus = await prepareOrder(order);
            if(orderStatus){
                return res.status(200).send(`Order ${order.orderId} has been processed`);
            }
        }
    }
    return res.status(400).send(`Failed to process order`);
})

app.get('/order/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    if(id){

        if(await isOrderProcessed(id)){
            return res.status(200).send(`Order with id ${id} has been processed`);
        }
        else if(isOrderBeingProcessed(id)){
            return res.status(200).send(`Order with id ${id} is still being processed`);
        }
        else{
            return res.status(200).send(`Cannot find order with id ${id}`);
        }
    }
    else{
        return res.status(400).send(`Error`);
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})


async function prepareOrder(order){
    try{
        const pool = await poolPromise;
        const record = await pool.request()
            .input('orderId', sql.Int, order.orderId)
            .input('foodItem', sql.VarChar, order.foodItem)
            .input('customerName', sql.VarChar, order.customerName)
            .input('orderProcessed', sql.Bit, false)
            .query('insert into onlineOrders values(@orderId, @foodItem, @customerName, @orderProcessed)')
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, 5000);
        });
    }
    catch(error){
        console.log(error);
    }
}

async function isOrderProcessed(id){
    try{
        const pool = await poolPromise;
        const record = await pool.request()
                .input('id', sql.Int, id)
                .input('orderProcessed', sql.Int, true)
                .query('select * from onlineOrders where orderId = @id and orderProcessed = @orderProcessed;')
        
        if(record.rowsAffected[0] != 0){
            return true;
        }
        return false;
    }
    catch(error){
        console.log(error);
    }
}
async function isOrderBeingProcessed(id){
    try{
        const pool = await poolPromise;
        const record = await pool.request()
                .input('id', sql.Int, id)
                .query('select * from onlineOrders where orderId = @id;')
        
        if(record.rowsAffected[0] == 0){
            return false;
        }
        return true;
    }
    catch(error){
        console.log(error);
    }
}