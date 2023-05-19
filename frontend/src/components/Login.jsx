import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Login = () => {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();

    const submitHandler = async (e) => {

        setLoading(true);

        if (!email || !password) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom"

            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                },
            };

            const { data } = await axios.post('/api/user/login', {
                email: email,
                password: password,
            }, config);


            toast({
                title: "Logged In successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "bottom"
            });

            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            history.push("/chats");

        } catch (err) {
            toast({
                title: "Error occured",
                description: err.response.data.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom"

            });
            setLoading(false);
            console.log(err);
        }


    }

    return (
        <VStack spacing={"5px"}>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    value={email}
                    placeholder='Enter your email'
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        value={password}
                        placeholder='Enter your password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width={"4.5rem"}>
                        <Button h={"1.75rem"} size={"sm"} onClick={() => setShow(!show)}>Show</Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>


            <Button
                colorScheme='teal'
                variant='solid'
                onClick={submitHandler}
                isLoading={loading}
            >
                Login
            </Button>
            <Button
                variant="solid"
                colorScheme="red"
                width="100%"
                onClick={() => {
                    setEmail("san@gmail.com");
                    setPassword("asdfghjkl");
                }}
            >
                Get Guest User Credentials
            </Button>
        </VStack>
    )
}

export default Login