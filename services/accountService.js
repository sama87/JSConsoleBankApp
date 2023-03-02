//Normally would split DB functions into repository, but that is needlessly complicated for this project

exports.createAccount = async function createAccount(client, color, prompt, custId){

    var balance = await prompt("Initial Deposit: ".cyan);
    await client.connect();
    var counter = await client.db("DollarsBankJS").collection("Accounts").findOne({"_id": "0"});
    var accountNumber = counter.counter;

   

    var account = {
        "accountNumber": accountNumber,
        "balance": balance,
        "customerId": custId,
    }

    accountNumber += Math.floor( Math.random() * 99 + 1 );//New account has already been created as json, now use accountNumber to increment the counter in db

    await client.db("DollarsBankJS").collection("Accounts").insertOne(account);
    await client.db("DollarsBankJS").collection("Accounts").updateOne({"_id": "0"}, {"$set": { "counter": accountNumber} });//update counter in db so next account made will have a new account number

    var msg = "Initial Deposit: " + balance;
    await createTransaction(client, account, msg);

    client.close();
}

exports.accountMenu = async function accountMenu(client, color, prompt, custId) {
    var menu = "";
    var exit = false;

    while(!exit) {
        color.title("+-----------------------+");
        color.title("|   Welcome Customer!   |");
        color.title("+-----------------------+");
        console.log();

        color.text("1. Make a Deposit");
        color.text("2. Make a Withdrawal");
        color.text("3. Transfer Funds");
        color.text("4. View Transaction History");
        color.text("5. View Customer Profile");
        color.text("6. Sign Out");
        
        menu = prompt("\nEnter your selection (1-6): ".cyan);

        switch(menu) {
            case "1":
                color.clear();
                await deposit(client, color, prompt, custId);
                break;
            case "2":
                color.clear();
                await withdrawal(client, color, prompt, custId);
                break;
            case "3":
                color.clear();
                await transfer(client, color, prompt, custId);
                break;
            case "4":
                color.clear();
                await transactions(client, color, prompt, custId);
                break;
            case "5":
                color.clear();
                await custProfile(client, color, prompt, custId);
                break;
            case "6":
                color.clear();
                exit = true;
                break;
            default:
                color.clear();
                color.invalid("Invalid input! Please enter 1, 2, 3, 4, 5, or 6!\n");
        }//case switch

    }//while

}//accountMenu



async function deposit(client, color, prompt, custId){
   var deposit = -1.0;

   await client.connect();
   var account = await client.db("DollarsBankJS").collection("Accounts").findOne({"customerId": custId});
   
    color.title("+-------------+");
    color.title("|   Deposit   |");
    color.title("+-------------+");

    while(deposit < 0.0){
        
        color.text("\nCurrent Balance: " + account.balance);
        deposit = prompt("Deposit Amount: ".cyan);

        if (deposit < 0.0) color.invalid("Invalid Input! Please enter a positive amount or enter 0 to cancel deposit");
    }

    color.text("\n\n\nPrevious Balance: " + account.balance);
    var flBalance = parseFloat(account.balance) + parseFloat(deposit);
    account.balance = flBalance;//update balance in backend

    //update account balance in DB
    await client.db("DollarsBankJS").collection("Accounts").updateOne({"accountNumber": account.accountNumber},{"$set": {"balance": account.balance}});

    //add transaction to db
    var msg = "Deposited Amount: " + deposit;
    await createTransaction(client, account, msg);

    color.text("Amount Deposited: " + deposit);
    color.text("New Balance: " + account.balance);

    await client.close();
    prompt("Press ENTER to continue...".cyan)
    color.clear();
}



async function withdrawal(client, color, prompt, custId){
    var withdrawal = -1.0;
 
    await client.connect();
    var account = await client.db("DollarsBankJS").collection("Accounts").findOne({"customerId": custId});
    
     color.title("+----------------+");
     color.title("|   Withdrawal   |");
     color.title("+----------------+");
 
     while(withdrawal < 0.0 || withdrawal > account.balance){
         
         color.text("\nCurrent Balance: " + account.balance);
         withdrawal = prompt("Withdrawal Amount: ".cyan);
 
         if (withdrawal < 0.0) color.invalid("Invalid Input! Please enter a positive amount or enter 0 to cancel withdrawal");
         else if (withdrawal > account.balance) color.invalid("Withdrawal cannot exceed your current balance!");
     }
 
     color.text("\n\n\nPrevious Balance: " + account.balance);
     var flBalance = parseFloat(account.balance) - parseFloat(withdrawal);
     account.balance = flBalance;//update balance in backend
 
     //update account balance in DB
     await client.db("DollarsBankJS").collection("Accounts").updateOne({"accountNumber": account.accountNumber},{"$set": {"balance": account.balance}});
 
     //add transaction to db
     var msg = "Withdrawn Amount: " + withdrawal.red;
     await createTransaction(client, account, msg);
 
     color.text("Amount Deposited: " + withdrawal);
     color.text("New Balance: " + account.balance);
 
     await client.close();
     prompt("Press ENTER to continue...".cyan)
     color.clear();
}



async function transfer(client, color, prompt, custId){
  
    var account2 = null;
    var account2num = -1;
    var account2found = false;
    var confirm = 'x';
    var transferAmount = -1.0;

    await client.connect();
    var account = await client.db("DollarsBankJS").collection("Accounts").findOne({"customerId": custId});

    //Find account to transfer to
    while(!account2found) {

        color.title("+---------------+");
        color.title("|   Transfers   |");
        color.title("+---------------+\n");    

        color.text("Please enter the account number for the account that you wish to TRANSFER TO");
        account2num = prompt("Account Number :".cyan);

        account2 = await client.db("DollarsBankJS").collection("Accounts").findOne({"accountNumber": parseInt(account2num)});

        if(account2) account2found = true;
        else {
            color.invalid("Account not found. Please try again");
            color.clear();
        }
    
    }

    //Validate transfer amount
    while(transferAmount < 0.0 || transferAmount > account.balance){
        color.text("Current Balance: " + account.balance);
        transferAmount = prompt("Transfer Amount: ".cyan);

        if(transferAmount < 0.0) color.invalid("\n Please enter a positive number!");
        else if(transferAmount > account.balance) color.invalid("Transfer amount can't exceed current balance!");
    }

    //Confirm the transfer
    while(confirm != "Y") {
        color.text("$" + transferAmount + " will be transfered from account number " + account.accountNumber + " to account number " + account2num);
        confirm = prompt("Please enter (Y)es to continue or (N)o to cancel: ".cyan);

        if (confirm == "N") {
            prompt("Transfer canceled. Press ENTER to continue...".cyan);
            color.clear();
            return;
        }
        else if (confirm != "Y") color.invalid("\nInvalid Input!\n");
    }

    color.text("Previous Balance: " + account.balance);

    //adjust Balances
    account.balance = parseFloat(account.balance) - parseFloat(transferAmount);
    await client.db("DollarsBankJS").collection("Accounts").updateOne({"accountNumber": account.accountNumber},{"$set": {"balance": account.balance}});

    account2.balance = parseFloat(account2.balance) + parseFloat(transferAmount);
    await client.db("DollarsBankJS").collection("Accounts").updateOne({"accountNumber": account2.accountNumber},{"$set": {"balance": account2.balance}});

    //Add Transactions
    var msg = "Transferred to account number " + account2num + ": " + transferAmount.red;
    await createTransaction(client, account, msg);

    var msg2 = "Transferred from account number " + account.accountNumber + ": " + transferAmount;
    await createTransaction(client, account2, msg2);

    //Output results
    color.text("\n" + transferAmount + " was transerred from account number: " + account.accountNumber + " to account number: " + account2num);
    color.text("Current Balance: " + account.balance);
    await client.close();
    prompt("\nPress ENTER to continue...");

    color.clear();
}



async function transactions(client, color, prompt, custId){

    await client.connect();
    var results = await client.db("DollarsBankJS").collection("Transactions").find({"customerId": custId}).sort({"_id": -1}).limit(5);
    var transactions = await results.toArray();

    color.title("+------------------+");
    color.title("|   Transactions   |");
    color.title("+------------------+\n");

    transactions.forEach((transaction) =>{ color.text(transaction.message + "\n") });
    prompt("Press ENTER to continue...");

    color.clear();
    await client.close()
}



async function custProfile(client, color, prompt, custId){

    color.title("+----------------------+");
    color.title("|   Customer Profile   |");
    color.title("+----------------------+");

    await client.connect();

    var customer = await client.db("DollarsBankJS").collection("Customers").findOne({"_id": custId});
    var account = await client.db("DollarsBankJS").collection("Accounts").findOne({"customerId": custId});

    

    color.text("\nName: " + customer.name);
    color.text("Username: " + customer.username);
    color.text("Address: " + customer.address);
    color.text("Phone Number: " + customer.phone);
    color.text("Account Number: " + account.accountNumber);
    color.text("Current Balance: " + account.balance);

    await client.close();

    prompt("\n\n\nPress ENTER to continue...".cyan);

    color.clear();
}



async function createTransaction(client, account, text){
    var date = new Date();
    var timestamp ="" + date.getFullYear() + "/" + date.getMonth() + "/" +  date.getDate() + " " +  date.getHours() + ":" +  date.getMinutes() + ":" +  date.getSeconds();
   


    text += "\nBalance: " + account.balance + " as of: " + timestamp + "\n";

    var transaction = {
        "customerId": account.customerId,
        "accountNumber": account.accountNumber,
        "message": text
    }

    await client.connect();
    await client.db("DollarsBankJS").collection("Transactions").insertOne(transaction);
    await client.close();

}