// сервер все еще настроен на gwent, TODO - переделать под HS
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const expressLiquid = require('express-liquid');
const path = require('path');

const options = { // for liquid
    includeFile: function (filename, callback) {
        fs.readFile(filename, 'utf8', callback);
    },
    context: expressLiquid.newContext(),
    customTags: {},
    traceError: false
};
const fs = require("fs");

const app = express();
const db = require('./config/db');

//app.set('view engine', 'pug');
app.set('view engine', 'liquid');
app.engine('liquid', expressLiquid(options));
app.use(expressLiquid.middleware);
app.set('views', './templates');
app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

// main
app.get('/', function (req, res) {
    // let params = {};
    // console.log(req.query);
    //
    // if (['Event','Melee','Multiple','Ranged','Siege'].includes(req.query.faction)) {
    //     params['faction'] = req.query.faction;
    // }
    //
    // if (['Faction','Neutral','Nilfgaard','Northern Realms','Scoia\'tael'].includes(req.query.position)) {
    //     params['position'] = req.query.position;
    // }
    //res.sendFile(path.join(__dirname, '/public', 'index.html'));
    res.render('index', null);
});

app.get('/page/:pageid', (req, res) => {
    console.log(req.params.id);
   res.render('index', {page: req.params.id})
});

MongoClient.connect(db.url, (err, database) => {
	if (err) {
        console.log(err);
        return;
    }
    // все карты
    database.collection('cards', function (err, collection) {
        collection.find().limit(1000).toArray(function(err, cards) {
            if(err) console.log(err);
            for(let card of cards) {
                app.get('/cards/' + card['_id'], function (req, res) {
                    res.render('card', { card: card });
                });
            }
        });
    });

	//запросы на получение карт
    app.get('/getcards', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        let count = parseInt(req.query.count) || 20;
        if (req.query.count === 'all') count=500;
        //console.log(count);
        let skip = parseInt(req.query.skip) || 0;
        //console.log(skip);

        if (count>1000) {
            return res.end(JSON.stringify(
                {
                    'type': 'error',
                    'reason': 'Не более 1000 карт'
                })
            );
        }

        database.collection('cards', function (err, collection) {
            collection.find().limit(count).skip(skip).toArray(function(err, items) {
                if(err) console.log(err);
                res.end(JSON.stringify(
                    {
                        'type': 'success',
                        'cards': items
                    })
                );
            });
        });
    });

	app.listen(app.get('port'), () => {
    	console.log('Server started: http://localhost:' + app.get('port') + '/');
	});
});