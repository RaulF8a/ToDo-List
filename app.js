import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import ejs from 'ejs';
import mongoose from 'mongoose';
import date from './date.js'
import { randomBytes } from 'crypto';

const app = express ();
const __dirname = path.resolve ();

// App Setup
app.use (bodyParser.urlencoded ({extended: true}));
app.use (express.static ("public"));
app.set ("view engine", "ejs");

// Moongose connection
// mongoose.connect ("mongodb+srv://admin-raul:test123@cluster0.gg60o.mongodb.net/todolistDB");
var username = process.env.MONGO_DB_USERNAME || 'someUserName';
var password = process.env.MONGO_DB_PASSWORD || 'somePassword';

var host = process.env.MONGODB_SERVICE_HOST || '127.0.0.1';
var port = process.env.MONGODB_SERVICE_PORT || '27017';

var database = process.env.MONGO_DB_DATABASE || 'sampledb';
console.log('---DATABASE PARAMETERS---');
console.log('Host: ' + host);
console.log('Port: ' + port);
console.log('Username: ' + username);
console.log('Password: ' + password); 
console.log('Database: ' + database);

var connectionString = 'mongodb://' + username + ':' + password +'@' + host + ':' + port + '/' + database;
console.log('---CONNECTING TO---');
console.log(connectionString);
mongoose.connect(connectionString);

// Item Schema
const itemSchema = {
    name: {
        type: String,
        required: [true, "You must include a name."]
    }
};

const Item = mongoose.model ("Item", itemSchema);

// List Schema
const listSchema = {
    name: {
        type: String,
        required: [true, "You must include a name."]
    },
    items: [itemSchema]
};

const List = mongoose.model ("List", listSchema);

// Default items declaration.
const item1 = new Item ({
    name: "Welcome to your ToDo List."
});

const item2 = new Item ({
    name: "Hit the + button to add a new item."
});

const item3 = new Item ({
    name: "<- Click that to delete an item."
});

const defaultItems = [item1, item2, item3];

// Get Post Methods
app.get ("/", (req, res) => {
    let today = date.getDateP ();

    Item.find ({}, (err, items) => {
        if (err){
            console.log (err);
        }
        else{
            if (items.length === 0){
                Item.insertMany (defaultItems, (err) => {
                    if (err){
                        console.log (err);
                    }
                    else{
                        console.log ("Successfully added documents.");
                    }
                });

                res.redirect ("/");
            }
            else{
                res.render ('list', {listTitle: today, newListItems: items});
            }
        }
    });

});

app.post ("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list[0].toLowerCase () + req.body.list.slice (1);
    let today = date.getDateP ();
    const id = randomBytes(4).toString ("hex");

    const item = new Item ({
        name: itemName
    });

    if (listName === today){
        item.save ();
        res.redirect ("/");
    }
    else{
        List.findOne ({name: listName}, (err, document) => {
            if (!err){
                // console.log (document);
                document.items.push (item);
    
                document.save ();
                res.redirect (`/${listName}`);
            }
            else{
                console.log (`Error adding document to list ${listName}`);
            }
        });
    }

});

app.post ("/delete", (req, res) => {
    const id = req.body.checkbox;
    const listName = req.body.listName[0].toLowerCase () + req.body.listName.slice (1);
    let today = date.getDateP ();

    if (listName === today){
        Item.findByIdAndDelete ({_id: id}, (err) => {
            if (err){
                console.log (err);
            }
            else{
                console.log ("Deletion succeed.");
    
                res.redirect ("/");
            }
        });
    }
    else{
        List.findOneAndUpdate ({name: listName}, {$pull: {items: {_id: id}}}, (err, document) => {
            if (!err){
                res.redirect (`/${listName}`);
            }
        });
    }

});

app.get ("/:customListName", (req, res) => {
    const listName = (req.params.customListName).replaceAll (' ', '-').toLowerCase();

    List.findOne ({name: listName}, (err, collection) => {
        if (!err){
            if (listName === "about"){
                res.render ('about');
            }
            else if (!collection){
                const listCustom = new List ({
                    name: listName,
                    items: defaultItems
                })
            
                listCustom.save ();
                res.redirect (`/${listName}`)
            }
            else{
                // console.log ("Collection already created.");
                const capitalizedTitle = collection.name[0].toUpperCase () + collection.name.slice (1);

                res.render ('list', {listTitle: capitalizedTitle, newListItems: collection.items});
            }
        }
    });
});

app.listen (4000, () => {
    console.log ("Server running on port 4000.");
});