const express=require("express");

const app=express();

app.use(express.json());

const {open}=require("sqlite");

const sqlite3=require("sqlite3");

const path=require("path");

const dbPath=path.join(__dirname, "moviesData.db");

let db=null;

const initializeDbAndServer=async () => {
    try {
        open({
            filename:dbPath,
            driver:sqlite3.Database,

        });
        app.listen(2000, () => {
            console.log("Server Running at 2000");

        });

    } catch(error) {
      console.log(`Error msg: ${error.message}`);
      process.exit(1);

    }
};

initializeDbAndServer();


app.get("/movies/", async (request,response) => {

    const movieNames=`
    SELECT *
    FROM 
    movie;`;

   const movies= await db.all(movieNames);
    response.send(movies);

});
