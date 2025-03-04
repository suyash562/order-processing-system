create table onlineOrders(
	orderId int primary key,
	foodItem varchar(30),
	customerName varchar(30),
	orderProcessed bit
);


select * from onlineOrders;