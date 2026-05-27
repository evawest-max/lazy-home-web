import {
  Box,
  Button,
  VStack,
  Text,
  Heading,
  Input,
  FormControl,
  FormLabel,
  HStack,
  Divider
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function SignUp() {
  return (
    <Box
      minH="100vh"
      bg="brand.background"
      px={6}
      py={12}
    >
      <VStack spacing={8} maxW="420px" mx="auto">

        {/* Header */}
        <VStack spacing={3} textAlign="center">
          <Heading fontSize="3xl" color="teal.700">
            Create Account
          </Heading>
          <Text color="gray.600">
            Start your safe rental journey today
          </Text>
        </VStack>

        {/* Form Card */}
        <Box
          bg="white"
          borderRadius="2xl"
          p={6}
          boxShadow="xl"
          w="100%"
        >
          <VStack spacing={4}>

            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input placeholder="John Doe" size="lg" />
            </FormControl>

            <FormControl>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" placeholder="you@example.com" size="lg" />
            </FormControl>

            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input type="tel" placeholder="08012345678" size="lg" />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" placeholder="••••••••" size="lg" />
            </FormControl>

            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input type="password" placeholder="••••••••" size="lg" />
            </FormControl>

            <Button
              w="100%"
              size="lg"
              bg="teal.600"
              color="white"
              _hover={{ bg: "teal.700" }}
            >
              Create Account
            </Button>

          </VStack>
        </Box>

        {/* Divider */}
        <HStack w="100%">
          <Divider />
          <Text fontSize="sm" color="gray.500" px={2}>
            OR
          </Text>
          <Divider />
        </HStack>

        {/* Login Redirect */}
        <Text fontSize="sm" color="gray.600">
          Already have an account?{" "}
          <Text
            as={Link}
            to="/login"
            color="teal.600"
            fontWeight="bold"
            cursor="pointer"
          >
            Sign In
          </Text>
        </Text>

        {/* Terms */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          By signing up, you agree to LazyHomes Terms and Privacy Policy
        </Text>

      </VStack>
      <Navbar active="sign up" />
    </Box>
  );
}