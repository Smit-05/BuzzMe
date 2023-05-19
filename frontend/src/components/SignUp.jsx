import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

const SignUp = () => {

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [pic, setPic] = useState();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const toast = useToast();

    const postDetails = (pics) => {
        setLoading(true);
        if (!pics) {
            toast({
                title: "No file selected",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom"
            });
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "ratchat");
            data.append("cloud_name", "deeqzezex");
            fetch("https://api.cloudinary.com/v1_1/deeqzezex/image/upload", {
                method: "post",
                body: data
            }).then(res => res.json())
                .then(data => {
                    console.log(data);
                    setPic(data.url.toString());
                    setLoading(false);
                }).catch(err => {
                    console.log(err);
                    setLoading(false);
                })
        } else {
            toast({
                title: "Invalid file type",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom"

            });
            setLoading(false);
        }

    }


    const submitHandler = async (e) => {
        setLoading(true);

        if (!name || !email || !password || !confirmpassword || !pic) {
            toast({
                title: "Please fill all the fields",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom"

            });
            setLoading(false);
            return;
        } else {
            if (password !== confirmpassword) {
                toast({
                    title: "Passwords do not match",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom"

                });
                setLoading(false);
                return;
            }
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                },
            };

            const { data } = await axios.post('/api/user/', {
                name,
                email,
                password,
                pic
            }, config);


            toast({
                title: "Account created successfully",
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
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input placeholder='Enter your name' onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={show ? 'text' : 'password'} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} />
                    <InputRightElement width={"4.5rem"}>
                        <Button h={"1.75rem"} size={"sm"} onClick={() => setShow(!show)}>Show</Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='confirmpassword' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input type={show ? 'text' : 'password'} placeholder='Confirm Password' onChange={(e) => setConfirmpassword(e.target.value)} />
                    <InputRightElement width={"4.5rem"}>
                        <Button h={"1.75rem"} size={"sm"} onClick={() => setShow(!show)}>Show</Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='pic' isRequired>
                <FormLabel>Upload <picture></picture></FormLabel>

                <Input type='file' p={1.5} accept='images/*' onChange={(e) => postDetails(e.target.files[0])} />

            </FormControl>

            <Button
                colorScheme='teal'
                variant='solid'
                onClick={submitHandler}
                isLoading={loading}

            >
                Sign Up
            </Button>
        </VStack>
    )
}

export default SignUp