import React, { useState } from 'react';
// import axios from 'axios';
import { Box } from '@chakra-ui/react';
import SideDrawer from './SideDrawer';
import MyChats from './MyChats';
import ChatBox from './ChatBox';
import { ChatState } from '../context/chatProvider';

const ChatsPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState();

  return (
    <div style={{ width: '100%' }}>
      {user && <SideDrawer />}
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        height={'91.5vh'}
        p={'10px'}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Box>
    </div>
  )
}

export default ChatsPage