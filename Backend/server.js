import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import totalRejecteditems from "./Routes/routeTotalRejectedItems.js";
import totalHarvests from "./Routes/routeTotalHarvests.js";

dotenv.config(); 

const app = express();
const port = 3001;


app.use(cors({origin: 'http://localhost:5173' }));
app.use(bodyParser.json());

app.use('/reason_for_rejection', totalRejecteditems);
app.use('/harvests', totalHarvests);


app.use((err, req, res, next) => {
    console.err(err.stack);
    res.status(500).send('Something is Wrong!');
});

app.listen(port, () => {
    
    console.log(`Backend server is running on http://localhost:${port}`);
});