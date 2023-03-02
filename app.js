

var exit = false;
var choice = "";

const prompt = require("prompt-sync")();
const { MongoClient } = require("mongodb")
const mongoUri = "mongodb+srv://root:root@freecluster.2vg6ubo.mongodb.net/DollarsBankJS?retryWrites=true&w=majority";
const client = new MongoClient(mongoUri)

const cService = require("./services/customerService.js");
const aService = require("./services/accountService");
const color = require("./utilities/colorFunctions.js");

main();


async function main() {

    // try {
    //     await client.connect();

    //     await listDatabases(client);
    // }
    // catch (e) {
    //     console.error(e);
    // }
    // finally {
    //     await client.close();
    // }

    while(exit == false) {

        color.title("+----------------------+");
        color.title("|     DOLLARS BANK     |");
        color.title("+----------------------+");
        console.log();
    
        color.text("1. Create new account");
        color.text("2. Login");
        color.text("3. Exit");
        
        choice = prompt("Enter choice (1, 2, or 3) : ".cyan);


        switch(choice){
        case "1":
            color.clear();
            var userId = await cService.createCustomer(client, color, prompt);
            await aService.createAccount(client, color, prompt, userId);
            break;
        case "2":
            color.clear();
            await cService.login(client, color, prompt);
            break;
        case "3":
            color.clear();
            color.text("Thank you for using Dollars Bank!\n\n\n");
            exit = true;
            break;
        default:
            color.clear();
            color.invalid("Invalid input!\n");
        }

    
    }

}

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(db.name));
}