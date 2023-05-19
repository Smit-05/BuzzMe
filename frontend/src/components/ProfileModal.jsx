import { ViewIcon } from '@chakra-ui/icons';
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'

const ProfileModal = ({ user, children }) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {
        children ? (
          <span onClick={onOpen}>{children}</span>
        ) : (
          <IconButton
            display={{ base: 'flex' }}
            icon={<ViewIcon />}
            onClick={onOpen}
          />
        )
      }

      <Modal size={'lg'} isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent height={'400px'}>
          <ModalHeader
            fontSize={'40px'}
            fontFamily={'Lato'}
            display={'flex'}
            justifyContent={'center'}
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'space-between'}

          >
            <Image
              borderRadius={'full'}
              boxSize={'150px'}
              src={user.pic}
              alt={user.name}
            />
            <Text 
              fontFamily={'Lato'}
              fontSize={'20px'}

            >
              Email: {user.email}
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ProfileModal