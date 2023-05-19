import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import UserListItem from './UserListItem';
import { ChatState } from '../context/chatProvider';
import axios from 'axios';
import UserBadgeItem from './UserBadgeItem';

const GroupChatModal = ({ children }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState();
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const {user,chats,setChats} = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if(!query){
            return ;
        }

        try{

            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            console.log(data);
            setSearchResult(data);
            setLoading(false);


        }catch(error){
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Users",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        }
    }

    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)){
            toast({
                title: "User Already Added!",
                description: "User is already added to the group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);


    }

    const handleDelete = (userToDelete) => {
        setSelectedUsers(selectedUsers.filter(user => user._id !== userToDelete._id));
    }

    const handleSubmit = async () => {
        if(!groupChatName || !selectedUsers){
            toast({
                title: "Please fill all the details",
                description: "Please Enter a Group Name and Add Users to the Group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return;
        }

        try{

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };

            const {data} = await axios.post(`/api/chat/group`, {
                name: groupChatName,
                users:JSON.stringify(selectedUsers.map(u => u._id))
            },config);

            setChats([data,...chats]);
            onClose();
            toast({
                title: "Group Created!",
                description: "Group Chat Created Successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        }catch(error){
            toast({
                title: "Error Occured!",
                description: "Failed to Create the Group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })

        }


    }

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Lato"
                        d="flex"
                        justifyContent="center"
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody d="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add Users eg: John, Piyush, Jane"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box w="100%" d="flex" flexWrap="wrap">
                            {selectedUsers.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleDelete(u)}
                                />
                            ))}
                        </Box>
                        {loading ? (
                            // <ChatLoading />
                            <div>Loading...</div>
                        ) : (
                            searchResult
                                ?.slice(0, 4)
                                .map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleGroup(user)}
                                    />
                                ))
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleSubmit} colorScheme="blue">
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal