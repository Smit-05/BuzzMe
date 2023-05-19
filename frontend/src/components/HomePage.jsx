import React, { useEffect } from "react"
import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import Login from "./Login"
import SignUp from "./SignUp"
import { useHistory } from "react-router-dom"

const HomePage = () => {

    const history = useHistory();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        if (userInfo) {
            history.push('/chats');
        }
    }, [history]);

    return (
        <Container maxW="xl" centerContent>
            <Box
                display="flex"
                justifyContent="center"
                p={3}
                bg={"white"}
                w={"100%"}
                m="40px 0 15px 0"
                borderRadius="lg"
                // boxShadow="0 0 50px rgba(0,0,0,0.5)"
                borderWidth='1px'

            >
                <Text fontSize={"4xl"} fontFamily={"Lato"} color={"black"}>
                    Rat Chat
                </Text>
            </Box>
            <Box
                bg={"white"}
                w={"100%"}
                p={3}
                // m="40px 0 15px 0"
                borderRadius="lg"
                // boxShadow="0 0 50px rgba(0,0,0,0.5)"
                borderWidth='1px'>

                <Tabs isFitted variant='enclosed'>
                    <TabList mb='1em'>
                        <Tab>Login</Tab>
                        <Tab>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login/>
                        </TabPanel>
                        <TabPanel>
                            <SignUp/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

            </Box>

        </Container>
    )
}

export default HomePage