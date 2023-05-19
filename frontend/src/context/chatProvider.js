import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {

    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const history = useHistory();


    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUser(userInfo);

        // eslint-disable-next-line
        if (!userInfo) {
            history.push('/');
        }
    }, [history]);


    return (
        <ChatContext.Provider
            value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, notifications, setNotifications }}
        >
            {children}
        </ChatContext.Provider>
    )
};

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;