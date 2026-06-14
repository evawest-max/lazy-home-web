import React, { useState } from 'react';
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
  Divider,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { registerUser } from '../../../api';
// import API from '../../../api.js';

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      fullName,
      email,
      phone,
      password,
      passwordConfirm: confirmPassword
    };

    try {
      const res = await registerUser(payload);
      console.log('register success', res);
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { email } });
      }, 1600);
    } catch (err) {
      console.error('register error', err?.response || err);
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  return (
    <Box minH="100vh" bg="brand.background" px={6} py={12}>
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
    <Box bg="white" borderRadius="2xl" p={6} boxShadow="xl" w="100%">
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input
              placeholder="John Doe"
              size="lg"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              placeholder="you@example.com"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              placeholder="08012345678"
              size="lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="••••••••"
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              placeholder="••••••••"
              size="lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          {success && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              {success}
            </Alert>
          )}
          <Button
            type="submit"
            w="100%"
            size="lg"
            bg="teal.600"
            color="white"
            _hover={{ bg: "teal.700" }}
            isLoading={loading}
            spinner={<Spinner size="sm" color="white" />}
            disabled={loading}
          >
            {loading ? '' : 'Create Account'}
          </Button>
        </VStack>
      </form>
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