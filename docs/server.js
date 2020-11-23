const PORT = 44777 ;
const HOST = "127.0.0.1";
const express=require("express");
const app=express();

app.use(express.static(__dirname));

app.listen(PORT,HOST,function(){
    console.log("server start "+HOST+":"+PORT);
});
