const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const todoSchema = require('../schemas/todoSchema');

const Todo = mongoose.model('Todo', todoSchema);

// GET ALL THE TODOS
router.get('/', async (req, res) => {
    await Todo.find({ status: 'active' })
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
    await Todo.find({ _id: req.params.id }, (err, data) => {
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
    }).clone();
});

// POST A TODO
router.post('/', async (req, res) => {
    const todoObject = req.body;
    // modeled todo
    const newTodo = new Todo(todoObject);
    await newTodo.save((err) => {
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
router.post('/all', async (req, res) => {
    await Todo.insertMany(req.body, (err) => {
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
router.put('/:id', async (req, res) => {
    const result = await Todo.findOneAndUpdate(
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
        },
    ).clone();

    console.log(result);
});

// DELETE A TODO
router.delete('/:id', async (req, res) => {
    await Todo.deleteOne({ _id: req.params.id }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todo was deleted successfully',
            });
        }
    }).clone();
});

// DELETE MULTIPLE TODO
router.delete('/', async (req, res) => {
    await Todo.deleteMany({ status: 'inactive' }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todos were deleted successfully',
            });
        }
    }).clone();
});

// export the router
module.exports = router;
