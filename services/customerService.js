//Normally would split DB functions into repository, but that is needlessly complicated for this project

const aService = require("./accountService");

exports.createCustomer = async function createCustomer(client, color, prompt) {

    color.title("+-----------------------+");
    color.title("|     New Customer      |");
    color.title("+-----------------------+");
    console.log();

    var name = prompt("Name: ".cyan);
    var address = prompt("Address: ".cyan);
    var phone = prompt("Phone Number: ".cyan);
    var username = prompt("Username: ".cyan);
    var password = prompt("Password: ".cyan);

    var customer = {
        "name": name,
        "address": address,
        "phone": phone,
        "username": username,
        "password": password
    }

    await client.connect();
    const result = await client.db("DollarsBankJS").collection("Customers").insertOne(customer);
    await client.close();

   return result.insertedId;
//result.insertedId
}

exports.login = async function login(client, color, prompt) {

    await client.connect();

    validLogin = false;
    var username = "";
    var password = "";
    var result;

    while(!validLogin) {
        color.title("+----------------------+");
        color.title("|     DOLLARS BANK     |");
        color.title("+----------------------+");
        console.log();
    
        color.text("Please enter your credentials\n");
        username = prompt("Username: ".cyan);
        password = prompt("Password: ".cyan);

        result = await client.db("DollarsBankJS").collection("Customers").findOne({"username": username, "password": password});

        if(result) validLogin = true;
        else {
            color.clear();
            color.invalid("Invalid username or password!\n");
        }

    }

    color.clear();
    await client.close();
    await aService.accountMenu(client, color, prompt, result._id);
}