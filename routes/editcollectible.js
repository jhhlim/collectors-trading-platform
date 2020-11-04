const express = require('express');
const knex = require('../connection')
const router = express.Router();
const Collectible = require('../models/collectible');


router.get('/', (req, res, next) => {
    res.render('editcollectible', { title: "edit collectible" });
});


// check if valid collectible name
function validCollectible(collectible) {
    const validName = typeof collectible.name == 'string' && collectible.name.trim() != '';
    return validName;
}


router.post('/', async (req, res, next) => {
    const { collectible_id, name } = req.body;
    const typeSelected = req.body.collectible_type;

    // Check if existing collectible_id
    if (!(await Collectible.getById(collectible_id))) {
        res.render('editcollectible', { 
                message: 'That collectible_id does not exist',
                messageClass: 'alert-danger'
            }
        )
        return
    }


    // Check if existing collectible name
    if (await Collectible.getByName(name)) {
        res.render('editcollectible', { 
                message: 'That collectible name already exists in the database. unique names only',
                messageClass: 'alert-danger'
            }
        )
        return
    }

    if (typeSelected == "none") {


        if (!name && !req.files) {
            res.render('editcollectible', { 
                    message: 'Please enter a name or upload an image to update the collectible',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (name) {
            // update name
            await knex('collectible').where({collectible_id: collectible_id}).update({name: name});
        }
    
        if (req.files) {
            const {data} = req.files.pic;
            if (data) {
            // update image
            await knex('collectible').where({collectible_id: collectible_id}).update({image: data});
            }
        }

        // update updated_at time
         await knex('collectible').where({collectible_id: collectible_id}).update({updated_at: knex.fn.now()});


        res.redirect(`/collectible/${collectible_id}`);
    }


    if (typeSelected == "lego") {
        const collectibleType = 1;


        if (!req.body.piece_count) {
            res.render('editcollectible', { 
                    message: 'Please add piece count',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (!req.body.set_number) {
            res.render('editcollectible', { 
                    message: 'Please add set_number',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (!req.body.theme) {
            res.render('editcollectible', { 
                    message: 'Please add theme',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (!req.body.designed_by) {
            res.render('editcollectible', { 
                    message: 'Please add designed by',
                    messageClass: 'alert-danger'
                }
            )
            return
        }


        if (name) {
            // update name
            await knex('collectible').where({collectible_id: collectible_id}).update({name: name});
        }
    
        if (req.files) {
            const {data} = req.files.pic;
            if (data) {
            // update image
            await knex('collectible').where({collectible_id: collectible_id}).update({image: data});
            }
        
        }

        await knex('collectible')
            .where({collectible_id: collectible_id})
            .update({collectible_type_id: collectibleType})
            .update({attributes: {  piece_count: req.body.piece_count, 
                                    set_number: req.body.set_number, 
                                    theme:  req.body.theme, 
                                    designed_by: req.body.designed_by}})
            .update({updated_at: knex.fn.now()});
      
        res.redirect(`/collectible/${collectible_id}`);

    }


    else if (typeSelected == "funko") {
        const collectibleType = 2;



        if (!req.body.number) {
            res.render('editcollectible', { 
                    message: 'Please add number',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (!req.body.line) {
            res.render('editcollectible', { 
                    message: 'Please add line',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (name) {
            // update name
            await knex('collectible').where({collectible_id: collectible_id}).update({name: name});
        }
    
        if (req.files) {
            const {data} = req.files.pic;
            if (data) {
            // update image
            await knex('collectible').where({collectible_id: collectible_id}).update({image: data});
            }
        
        }

        await knex('collectible')
            .where({collectible_id: collectible_id})
            .update({collectible_type_id: collectibleType})
            .update({attributes: {  number: req.body.number, 
                                    line: req.body.line}})
            .update({updated_at: knex.fn.now()});




        
        res.redirect(`/collectible/${collectible_id}`);

    }


    else if (typeSelected == "hot_wheel") { 
        const collectibleType = 5;

    

        if (!req.body.number1) {
            res.render('editcollectible', { 
                    message: 'Please add number',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (!req.body.series) {
            res.render('editcollectible', { 
                    message: 'Please add series',
                    messageClass: 'alert-danger'
                }
            )
            return
        }

        if (!req.body.year_released1) {
            res.render('editcollectible', { 
                    message: 'Please add year released',
                    messageClass: 'alert-danger'
                }
            )
            return
        }



        if (name) {
            // update name
            await knex('collectible').where({collectible_id: collectible_id}).update({name: name});
        }
    
        if (req.files) {
            const {data} = req.files.pic;
            if (data) {
            // update image
            await knex('collectible').where({collectible_id: collectible_id}).update({image: data});
            }
        
        }

        await knex('collectible')
        .where({collectible_id: collectible_id})
        .update({collectible_type_id: collectibleType})
        .update({attributes: {  number: req.body.number1, 
                                series: req.body.series,
                                year_released: req.body.year_released1}})
        .update({updated_at: knex.fn.now()});



        res.redirect(`/collectible/${collectible_id}`);

    }


});


module.exports = router;