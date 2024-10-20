const express= require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const gitRoutes = require("./gitRepo");

const port =  3000;

app.get("/view" , async (req,resp) =>{
    
    
    console.log("hello");
    resp.send("working fine proceed");
    
})

app.use("/git", gitRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

