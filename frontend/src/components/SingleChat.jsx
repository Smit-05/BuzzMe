import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/chatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderObject } from '../config/ChatLogic';
import ProfileModal from './ProfileModal';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';
import Lottie from 'react-lottie';
import animationData from '../3759-typing.json'

const ENDPOINT = 'http://localhost:5000';
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notifications, setNotifications } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', (data) => {
      setIsTyping(true);
    })
    socket.on('stop typing', (data) => {
      setIsTyping(false);
    });
  }, [])

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      };
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);

      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);

    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Failed to fetch messages",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const sendMessage = async (e) => {
    if (e.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          }
        };
        setNewMessage('');
        const { data } = await axios.post('/api/message', {
          content: newMessage,
          chatId: selectedChat._id

        }, config);

        socket.emit("new message", data);

        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "An error occurred.",
          description: "Failed to send message",
          status: "error",
          duration: 5000,
          isClosable: true,

        })
      }
    }
  }

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    let typingTime = new Date().getTime();
    setTimeout(() => {
      var currentTime = new Date().getTime();
      var diff = currentTime - typingTime;
      if (diff >= 3000 && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }

    }, 3000);

  }

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat])

  useEffect(() => {
    socket.on("message received", (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        if(!notifications.includes(newMessageRecieved)){
          setNotifications([newMessageRecieved,...notifications]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }

    });
  })

  console.log(notifications)

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Lato"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users).toUpperCase()}
                <ProfileModal user={getSenderObject(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            padding={3}
            background="#E8E8E8"
            width="100%"
            height="90%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {
              loading ? (
                <Spinner
                  size='xl'
                  width={20}
                  height={20}
                  alignSelf={'center'}
                  margin={'auto'}
                />
              ) : (
                <div
                  style={{
                    "display": "flex",
                    "flex-direction": "column",
                    "overflow-y": "scroll",
                    "scrollbar-width": "none"
                  }}
                >
                  <ScrollableChat messages={messages} />
                </div>
              )
            }
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (<div>
                <Lottie
                  options={defaultOptions}
                  width={50}
                  style={{ marginLeft: '2px', marginBottom: '10px' }}
                />
              </div>) : (null)}
              <Input
                variant={'filled'}
                bg={'#E0E0E0'}
                placeholder={'Type a message'}
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={'100%'}
        >
          <Text fontSize="2xl" fontWeight="semibold" color="gray.500">
            Select a Chat to start Messaging
          </Text>

        </Box>
      )}
    </>
  )
}

export default SingleChat