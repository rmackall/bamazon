var mysql = require('mysql');
var inquirer= require('inquirer');
require('console.table');
​
var connection = mysql.createConnection({
    host: 'localhost',
    port: 8080,
    user: 'root',
    password: 'root',
    database: 'bamazon'
});
​
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected as " + connection.threadId);
    makeTable();
})
​
var makeTable = function() {
    connection.query("SELECT * FROM products", function(err, res) {
        console.table(res);
        selectItem(res);
    })
}
​
var selectItem = function(inventory) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'choice',
            message: 'What is the ID of the item you would like to purchase? [Quit with Q]',
            validate: function(value) {
                return !isNaN(value) || value.toLowerCase() === "q";
            }
        }
    ]).then(function(value) {
        // Check if user pressed "q"
        checkIfShouldExit(value.choice);
​
        // Check if user entered a valid id
        var choiceId = parseInt(value.choice);
        var product = checkInventory(choiceId, inventory);
​
        // If the product exists, ask customer what quantity they would like
        if (product) {
            selectQuantity(product);
        } else {
            console.log(" ");
            console.log("That item is not in the inventory");
            console.log(" ");
            makeTable();
        }
    })
};
​
var selectQuantity = function(product) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'quantity',
            message: 'How many would you like? [Quit with Q]',
            validate: function(value) {
                return !isNaN(value) || value.toLowerCase() === "q";
            }
        }
    ]).then(function(value) {
        checkIfShouldExit(value.quantity);
        var quantity = parseInt(value.quantity);
​
        //If there isn't enough quantity, let user know and re-run the function
        if (quantity > product.stock_quantity) {
            console.log(" ");
            console.log("Insufficient quantity!  Try again.");
            console.log(" ");
            makeTable();
        } else {
            makePurchase(product, quantity);
        }
    })
}
​
// Make Purchase function will go here
var makePurchase = function(product, quantity) {
    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [quantity, product.item_id], function(err, res) {
        console.log(" ");
        console.log(`Congratulations.  You successully purchased ${quantity} of ${product.product_name}(s)!`);
        console.log(" ");
        makeTable();
    })
}
​
var checkInventory = function(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id === choiceId) {
            return inventory[i];
        }
    }
    return null;
}
​
// Check if User wants to exit
var checkIfShouldExit = function(choice) {
    if (choice.toLowerCase() === "q") {
        console.log("Goodbye!");
        process.exit(0);
    }
}
