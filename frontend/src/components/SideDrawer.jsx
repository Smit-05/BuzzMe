import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { ChatState } from '../context/chatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItem';
import { getSender } from '../config/ChatLogic';
import NotificationBadge, { Effect }  from 'react-notification-badge';

const SideDrawer = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { user, setSelectedChat, chats, setChats, notifications, setNotifications } = ChatState();

    const toast = useToast();
    const history = useHistory();

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        history.push('/');
    }


    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please Enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    const accessChat = async (userId) => {
        try {

            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.post('/api/chat', { userId }, config);

            if (!chats.find((chat) => chat._id === data._id)) {
                setChats([data, ...chats]);
            }

            setSelectedChat(data);
            setLoadingChat(false);

            onClose();
        } catch (err) {
            setLoadingChat(false);
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Chat",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    return (
        <>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                p={'5px 10px 5px 10px'}
                bg={'white'}
                borderWidth={'5px'}

            >
                <Tooltip label='Search Users' hasArrow placement='bottom-end'>
                    <Button variant={'ghost'} onClick={onOpen}>
                        <i className='fas fa-search'></i>
                        <Text display={{ base: 'none', md: 'flex' }} px={4}>Search</Text>
                    </Button>
                </Tooltip>
                <Text fontSize={'2xl'} fontFamily={'Lato'}>
                    Rat-Chat
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge 
                                count={notifications.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize={'2xl'} m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notifications.length ? ("No new messages") :(
                                notifications.map((n) => (
                                    <MenuItem key={n._id} onClick={() => {
                                        setSelectedChat(n.chat)
                                        setNotifications(notifications.filter((not) => not!==n))
                                        }}>
                                        {n.chat.isGroupChat ? 
                                        `New message from ${n.chat.chatName}` : 
                                        `New message from ${getSender(user, n.chat.users)}`}
                                    </MenuItem>
                                ))
                            )}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size={'sm'}
                                cursor={'pointer'}
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem
                                onClick={logoutHandler}
                            >
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={"1px"}>Search User</DrawerHeader>
                    <DrawerBody>
                        <Box
                            display={'flex'}
                            paddingBottom={'2'}
                        >
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>

                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult.map((u) => (
                                <UserListItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => accessChat(u._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml={'auto'} display={'flex'} />}
                    </DrawerBody>
                </DrawerContent>

            </Drawer>
        </>
    )
}

export default SideDrawer