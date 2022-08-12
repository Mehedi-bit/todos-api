const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const todoSchema = require('../schemas/todoSchema');

const Todo = mongoose.model('Todo', todoSchema);

// GET ALL THE TODOS
router.get('/', (req, res) => {
    Todo.find({ status: 'active' })
        .select({
            _id: 0,
            __v: 0,
            date: 0,
        })
        .limit(3)
        .exec((err, data) => {
            if (err) {
                res.status(500).json({
                    error: 'There was a server side error',
                });
            } else {
                res.status(200).json({
                    result: data,
                    message: 'Success',
                });
            }
        });
});

// GET A TODO BY ID
router.get('/:id', async (req, res) => {
    try {
        const data = await Todo.find({ _id: req.params.id });
        res.status(200).json({
            result: data,
            message: 'Success',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server side error',
        });
    }
});

// POST A TODO
router.post('/', (req, res) => {
    const todoObject = req.body;
    // modeled todo
    const newTodo = new Todo(todoObject);
    newTodo.save((err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todo was inserted successfully',
            });
        }
    });
});

// POST MULTIPLE TODO
router.post('/all', (req, res) => {
    Todo.insertMany(req.body, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todos were inserted successfully',
            });
        }
    });
});

// PUT TODO
router.put('/:id', (req, res) => {
    const result = Todo.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: 'active' } },
        {
            useAndModify: false,
            new: true,
        },
        (err) => {
            if (err) {
                res.status(500).json({
                    error: 'There was a server side error',
                });
            } else {
                res.status(200).json({
                    message: 'Todo was updated successfully',
                });
            }
        }
    );

    console.log(result);
});

// DELETE A TODO
router.delete('/:id', (req, res) => {
    Todo.deleteOne({ _id: req.params.id }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todo was deleted successfully',
            });
        }
    });
});

// DELETE MULTIPLE TODO
router.delete('/', (req, res) => {
    Todo.deleteMany({ status: 'inactive' }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todos were deleted successfully',
            });
        }
    });
});

// export the router
module.exports = router;
