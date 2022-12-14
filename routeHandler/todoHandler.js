const express = require('express');
const mongoose = require('mongoose');
const checkLogin = require('../middlewares/checkLogin');

const router = express.Router();
const todoSchema = require('../schemas/todoSchema');
const userSchema = require('../schemas/userSchema');

const Todo = mongoose.model('Todo', todoSchema);
const User = mongoose.model('User', userSchema);

// GET ALL THE TODOS
router.get('/', checkLogin, (req, res) => {
    Todo.find({})
        .populate('user', 'name username -_id')
        .select({
            _id: 0,
            __v: 0,
            date: 0,
        })
        .limit(50)
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

// GET ACTIVE THE TODOS
router.get('/active', checkLogin, async (req, res) => {
    const todo = new Todo();
    const data = await todo.findActive();

    res.status(200).json({
        data,
    });
});

// GET ACTIVE THE TODOS with callback
router.get('/active-callback', async (req, res) => {
    const todo = new Todo();
    todo.findActiveCallback((err, data) => {
        res.status(200).json({
            data,
        });
    });
});

// GET JS Title Containing TODOS
router.get('/js', async (req, res) => {
    const data = await Todo.findByJS();
    res.status(200).json({
        data,
    });
});

// GET TODOS BY LANGUAGE
router.get('/language', async (req, res) => {
    const data = await Todo.find().byLanguage('sql');
    res.status(200).json({
        data,
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
router.post('/', checkLogin, async (req, res) => {
    const newTodo = new Todo({
        ...req.body,
        user: req.userId,
    });

    try {
        const todo = await newTodo.save();
        await User.updateOne(
            { _id: req.userId },
            {
                $push: {
                    todos: todo._id,
                },
            }
        );
        res.status(200).json({
            message: 'Todo was inserted successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'There was a server side error',
        });
    }
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
        },
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
