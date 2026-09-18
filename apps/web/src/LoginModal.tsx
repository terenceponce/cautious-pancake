import { useEffect, useState } from 'react'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'

const EMAILISH = /.+@.+\..+/

export function LoginModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (email: string) => void
}) {
  const [email, setEmail] = useState('')
  const valid = EMAILISH.test(email)

  useEffect(() => {
    if (isOpen) setEmail('')
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign in to continue</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={3} color="gray.500" fontSize="sm">
            No password, no account — just tell us who you are. (Identity in this demo
            is a bare identifier; see ADR-0009.)
          </Text>
          <Input
            placeholder="your@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" isDisabled={!valid} onClick={() => onSubmit(email)}>
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
