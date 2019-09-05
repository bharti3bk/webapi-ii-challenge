const express = require('express');
const db = require('./data/db.js');
const server = express();

// teaches express to parse JSON body
server.use(express.json());

//
server.get('/', (req, res) => {
    res.status(200).json({ api: 'is up up and away' });
});


server.get('/api/posts', (req, res) => {
    // Posts.find() returns a promise, we need (.then, .catch)
    db.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            res.status(500).json({ error: 'The posts information could not be retrieved.' });
        });
}); 



// get a specific post
server.get('/api/posts/:id', (req, res) => {
    const {id} = req.params;
    db.findById(id)
        .then(post => {
            if (post) { 
                console.log(post);
                res.status(200).json(post);
            }
            else {
                res.status(404).json({ error: 'The post with the specified ID does not exist' });
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'The post information could not be retrieved.' });
        });
});  

// post a new post

server.post('/api/posts', (req, res) => {
    const {title , contents} = req.body;

    if (!title || !contents) {
        res.status(400).json({ error: 'Please provide the title and contents for the post' });
    }
    db.insert(title, contents)
        .then((id) => {
            db.findById(id)
                .then(post => { 
                    console.log(post)
                    res.status(201).json(post);
                })
                .catch(err => {
                    res.status(500).json({ error: 'There was an error while retrieving the post from the database' });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: 'There was an error while saving the post to the database'
            });
        });
});
 


// delete a post

server.delete('/api/posts/:id', (req, res) => {
    const {id} = req.params;

    db.remove(id)
        .then(deleted => {
            if (deleted) {
                res.status(200).json({ deleted });
            } else {
                res.status(404).json({ error: 'The post with the specified ID does not exist.' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: 'The post could not be removed' });
        });
});  


server.put('/api/posts/:id', (req, res) => {
    const {id }= req.params;
    const title = req.body;
    const contents = req.body;

    if (!title || !contents) {
        res.status(400).json({ error: 'Please provide title and contents for the post.' });
    }

    db.update(id, title, contents)
        .then(updated => {
            if (updated) {
                db.findById(id)
                    .then(post => res.status(200).json(post))
                    .catch(err => {
                        res.status(500).json({ error: 'The post information could not be modified.' });
                    });
            } else {
                res.status(404).json({ error: 'The post with the specified ID does not exist.' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: 'The post information could not be modified.' });
        });
}); 


server.get('/api/posts/:id/comments', (req, res) => {
    const {id} = req.params;
    if (!id) {
        res.status(404).json({ error: 'The post with the specified ID does not exist.' });
    } else {
        db.findPostComments(id)
            .then(comments => {
                res.status(200).json(comments);
            })
            .catch(err => {
                res.status(500).json({ error: 'The comments information could not be retrieved.' });
            });
    }
}); 


server.post('/api/posts/:id/comments', (req, res) => {
    const { post_id } = req.params;
    const { text } = req.body;
    if (text === '' || typeof text !== 'string') {
        return res.status(400).json({ error: 'Please provide text for the comment.' });
    }

    db.insertComment({ text, post_id })
        .then(({ id: comment_id }) => {
            db.findCommentById(comment_id)
                .then(([comment]) => {
                    if (comment) {
                        res.status(200).json(comment);
                    } else {
                        res.status(404).json({ error: 'The post with the specified ID does not exist.' });
                    }
                })
                .catch(err => {
                    res.status(500).json({ error: 'The posts information could not be retrieved.' });
                });
        })
        .catch(err => {
            res.status(500).json({ error: 'There was an error while saving the comment to the database' });
        });
});

module.exports = server;