const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.statusCode(400).json({ message: 'User Id is required' });
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate('users', '-password').populate('latestMessage');

    isChat = await User.populate(isChat, { path: 'latestMessage.sender', select: 'name email pic' });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [req.user._id, userId],

        };
        try {
            const created = await Chat.create(chatData);

            const fullChat = await Chat.findOne({ _id: created._id }).populate('users', '-password');

            res.status(200).send(fullChat);

        } catch (error) {
            res.status(400);
            throw new Error(error.message);

        }
    }
});


const fetchChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'name email pic'
                });
                res.status(200).send(results);
            });

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const createGroup = asyncHandler(async (req, res) => {

    if (!req.body.users || !req.body.name) {
        return res.status(400).json({ message: 'Please enter group name and users' });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).json({ message: 'Please add more users to the group' });
    }

    users.push(req.user);


    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user
        })

        const fullChat = await Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).send(fullChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const renameGroups = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName) {
        return res.status(400).json({ message: 'Please enter chatId and chatName' });
    }

    try {

        const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        if(!updatedChat){
            res.status(404);
            throw new Error('Chat not found');
        }else{
            res.json(updatedChat);
        }


    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

});


const addToGroup = asyncHandler(async (req, res) => {
    const {chatId,userId} = req.body;

    if(!chatId || !userId){
        return res.status(400).json({message:'Please enter chatId and userId'});
    }

    try{
        const added = await Chat.findByIdAndUpdate(chatId,{
            $push:{users:userId},
        },{new:true})
        .populate('users','-password')
        .populate('groupAdmin','-password');

        if(!added){
            res.status(404);
            throw new Error('Chat not found');
        }else{
            res.json(added);
        }
    }catch(error){
        res.status(400);
        throw new Error(error.message);
    }
});


const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        return res.status(400).json({ message: 'Please enter chatId and userId' });
    }

    try {
        const deleted = await Chat.findByIdAndUpdate(chatId, {
            $pull: { users: userId },
        }, { new: true })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        if (!deleted) {
            res.status(404);
            throw new Error('Chat not found');
        } else {
            res.json(deleted);
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = {
    accessChat,
    fetchChats,
    createGroup,
    renameGroups,
    addToGroup,
    removeFromGroup
}