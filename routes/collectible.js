const express = require('express');
const FileType = require('file-type');
const knex = require('../connection');
const Collection = require('../models/Collection')
const router = express.Router();


router.get('/', async (req, res, next) => { 
    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.attributes', 'collectible.image', 'collectible.collectible_type_id')
  
    // filter by type
    const collectiblesByType = await knex('collectible_type')
        .select('name as type_name', 'collectible_type_id as type_id');
   
        res.render('collectible', {
        title: "Collector\'s Trading Platform | Collectibles",
        collectible: collectibles,
        collectibleByType: collectiblesByType,
    });
});

 // Display all collectibles from a given a type
 router.get('/filter/:type_id', async (req, res, next) => {
    const { type_id } = req.params;
    const clearfilter = 1;
  
    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.attributes', 'collectible.image', 'collectible.collectible_type_id')
        .where('collectible.collectible_type_id', type_id);
 
    // filter by type
    const collectiblesByType = await knex('collectible_type')
        .select('name as type_name', 'collectible_type_id as type_id');
 
        res.render('collectible', {
        title: "Collector\'s Trading Platform | Collectibles",
        collectible: collectibles,
        collectibleByType: collectiblesByType,
        clearfilter: clearfilter
    });
});

// search for collectible
router.get('/search', async (req, res, next) => {
    const { name } = req.query;
    const nofilter = 1; // to not display dropdown
    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.attributes', 'collectible.image', 'collectible.collectible_type_id')
        .where('collectible.name', 'ilike', `%${name}%`);
        
            // if results, render collectibles
            if (collectibles.length > 0) { 
                res.render('collectible', {
                title: "Collector\'s Trading Platform | Search Results",
                collectible: collectibles,
                nofilter: nofilter,
                });
                return;
            }
            
            // if no results, inform user
            else { 
                res.render('collectible', { 
                        title: "Collector\'s Trading Platform | Search Results",
                        message: `No results matching your search term "${name}"`,
                        messageClass: 'alert-info',
                        nofilter: nofilter,
                    }
                )
                return;
            }   
});

// individual collectible's page
router.get('/:id', async (req, res, next) => { 
    const { id } = req.params;
    const userId = req.signedCookies.user_id; 
  
    const collectibles = await knex('collectible')
        .join('collectible_type', 'collectible.collectible_type_id', '=', 'collectible_type.collectible_type_id')
        .select('collectible.collectible_id', 'collectible_type.name as type_name', 'collectible.name', 'collectible.attributes', 'collectible.image', 'collectible.collectible_type_id')
        .where({ collectible_id: id });

    // user's has collectibles for any value zero or greater
    const collectionsHas = await knex('collection')
        .select(['collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .where('collector_id', userId )
        .where('collection.collectible_id', id )
        .andWhere('collection.has_quantity', '>=', 0);

    // user's wants collectibles if has_quantity for any value zero or greater
    const collectionsWants = await knex('collection')
        .select(['collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .where('collector_id', userId )
        .where('collection.collectible_id', id )
        .andWhere('collection.wants_quantity', '>=', 0);

    // user's willing to trade collectibles if willing_to_trade_quantity for any value zero or greater
    const collectionsWillingToTrade = await knex('collection')
        .select(['collection.collectible_id', 'collection.has_quantity', 'collection.wants_quantity', 'collection.willing_to_trade_quantity', 'collectible.name'])
        .join('collectible', 'collectible.collectible_id', 'collection.collectible_id')
        .where('collector_id', userId )
        .where('collection.collectible_id', id )
        .andWhere('collection.willing_to_trade_quantity', '>=', 0);

    // see if there's already a collector_id and collectible_id pair in the table
    const collectionExists = await knex('collection')
    .select(['collectible_id'])
    .where('collector_id', userId)
    .where('collectible_id', id);

    // if results, render users collectibles to the form
    if (collectionExists.length > 0) {
        const somethingInCollection = 1;

        res.render('collectiblepage', {
            title: `Collector\'s Trading Platform | ${id}`,
            collector_id: userId,
            collectible: collectibles,
            collectionHas: collectionsHas,
            collectionWants: collectionsWants,
            collectionWillingToTrade: collectionsWillingToTrade,
            somethingInCollection
        });
        return;
    }
    
    // if no results, render form with 0 in each quantity
    else { 
        const nothingInCollection = 1;
        res.render('collectiblepage', {
            title: `Collector\'s Trading Platform | ${id}`,
            collector_id: userId,
            collectible: collectibles,
            nothingInCollection,
            id
        });
        return;
    }    
});

// post request to change user's collection quantities
router.post('/:id', async (req, res, next) => {   
    const userId = req.signedCookies.user_id;
    const collectible_id = req.body.collectible_id;

    // see if there's already a collector_id and collectible_id pair in the table
    const collectionExists = await knex('collection')
        .select(['collectible_id'])
        .where('collector_id', userId)
        .where('collectible_id', collectible_id);

    // if there's a collector_id and collectible_id pair in the table, perform update
    if (collectionExists.length > 0) {
        const q1 = req.body.has_quantity;
        const q2 = req.body.wants_quantity;
        const q3 = req.body.willing_to_trade_quantity;

        await knex('collection')
            .where({collector_id: userId})
            .andWhere({collectible_id: collectible_id})
            .update({has_quantity: q1})
            .update({wants_quantity: q2})
            .update({willing_to_trade_quantity: q3 });




        // if has/wants/for trade quantity has been updated to zero, delete entry
        if (q1 == 0 && q2 == 0 && q3 == 0) {
            await knex('collection')
            .where({ collector_id: userId })
            .andWhere({collectible_id: collectible_id})
            .del();
        }
        res.redirect(`/collectible/${collectible_id}`);
        return;
    }

    // else perform insert
    else {
        const qa = req.body.has_quantity;
        const qb = req.body.wants_quantity;
        const qc = req.body.willing_to_trade_quantity;

        await Collection.create(userId, collectible_id, qa, qb, qc);

        res.redirect(`/collectible/${collectible_id}`);
        return;
    }
});

// url a collectible's image
router.get('/image/:id', async (req, res, next) => { 
    const id = req.params.id;
 
    const collectible = await knex('collectible').where({ collectible_id: id }).first();
    
    if (collectible) {
        const contentType = await FileType.fromBuffer(collectible.image);
        res.type(contentType.mime);
        res.end(collectible.image);
    } else {
        res.end('No image with that id!');
    }
});


module.exports = router;