const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { accessChat, fetchChats, createGroup, renameGroups, addToGroup, removeFromGroup } = require('../controllers/chatControllers');

const router = express.Router();

router.route('/').post(protect,accessChat).get(protect,fetchChats);
router.route('/group').post(protect,createGroup)
router.route('/rename').put(protect, renameGroups);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);
module.exports = router;