import { Box, Button, VStack, Text, Heading, HStack, Divider } from '@chakra-ui/react';
import { Mail, Phone, Chrome, ShieldCheck, RefreshCw, Lock, Home, Search, FileText, User } from 'lucide-react';
import { Link, useLocation,} from 'react-router-dom';
import Navbar from './Navbar';
import { GoogleLogin } from '@react-oauth/google';
import { googleSignIn } from '../../../api';
import { useEffect } from 'react';
import { color } from 'framer-motion';

export default function Login({ onLogin }) {
  const { state } = useLocation();

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log(credentialResponse);
    // Send the token to your backend
    // const { data } = await googleSignIn(credentialResponse.credential);
    // localStorage.setItem("token", data.token);
    try {
      const idToken = credentialResponse.credential;
      const { data } = await googleSignIn(idToken); // call backend
      console.log(data);
      localStorage.setItem('token', data.accessToken);

      onLogin(data.user);
      // window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      console.log('Google sign-in failed.');
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
  };
  return (
    <Box minH="100vh" bg="brand.background" px={6} py={12}>
      <VStack spacing={8} maxW="400px" mx="auto">
        <VStack spacing={3} textAlign="center">
          <Heading fontSize="3xl" color="brand.primary">
            Welcome Back
          </Heading>
          {state?.email && (
            <Text color="brand.gray.600" fontSize="sm" textAlign="center" px={4} whiteSpace="pre-wrap" >
              We sent a code to <Box fontWeight="bold" color="green.600" >{state?.email}</Box>. Check your inbox.
            </Text>
          )}
          <Text color="brand.gray.600">
            Sign in to continue your rental journey with LazyHomes
          </Text>
        </VStack>

        <Box bg="white" borderRadius="xl" p={5} boxShadow="md" w="100%">
          <VStack spacing={4}>
            <HStack spacing={2} bg="brand.success" py={2} px={4} borderRadius="lg" w="100%" justify="center">
              <ShieldCheck size={18} color="white" />
              <Text fontSize="sm" fontWeight="bold" color="white">
                100% SAFE & PROTECTED
              </Text>
            </HStack>

            <VStack spacing={3} w="100%">
              <HStack spacing={3} justify="space-between" w="100%">
                <HStack spacing={2} flex={1}>
                  <RefreshCw size={16} color="#2E7D32" />
                  <Text fontSize="xs" color="brand.gray.700">Full refund guarantee</Text>
                </HStack>
                <HStack spacing={2} flex={1}>
                  <Lock size={16} color="#2E7D32" />
                  <Text fontSize="xs" color="brand.gray.700">Escrow protected</Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <VStack spacing={4} w="100%">
          <Box
            w="100%"
            // variant="secondary"
            // leftIcon={<Chrome size={20} />}
            size="lg"
            border="2px solid"
            borderColor="green.700"
            borderRadius="md"
            _hover={{ bg: 'brand.gray.50' }}
            color="green.700"
            fontWeight="bold"
          >
            <GoogleLogin
              theme="filled_white"   // options: "outline", "filled_blue", "filled_black"
              size="large"          // options: "large", "medium", "small"
              shape="rectangular"          // options: "rectangular", "pill", "circle"
              text="continue_with"
              w="100%"
              h="100%"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </Box>

          <Link to="/login-form" style={{ width: '100%' }}>
            <Button
              w="100%"
              variant="secondary"
              leftIcon={<Mail size={20 } />}
              size="sm"
              justifyContent="flex-start"
              gap="20%"
              weight="sm"
              h="40px"
              color="gray.600"
              borderradius="md"
              _hover={{ bg: 'brand.gray.100' }}
            >
              Continue with Email/Password
            </Button>
          </Link>

          {/* <Link to="/otp" style={{ width: '100%' }}>
            <Button
              w="100%"
              variant="secondary"
              leftIcon={<Phone size={20} />}
              size="lg"
            >
              Continue with Phone
            </Button>
          </Link> */}
        </VStack>

        <HStack w="100%">
          <Divider />
          <Text fontSize="sm" color="brand.gray.500" whiteSpace="nowrap" px={2}>
            OR
          </Text>
          <Divider />
        </HStack>

        <Link to="/signup" style={{ width: '100%' }}>
          <Button w="100%" variant="primary" size="lg">
            Create New Account
          </Button>
        </Link>

        <Text fontSize="xs" color="brand.gray.500" textAlign="center">
          By continuing, you agree to LazyHomes Terms of Service and Privacy Policy
        </Text>
      </VStack>

      <Navbar active="login" />
    </Box>
  );
}

