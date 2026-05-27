import { Box, Button, VStack, Text, Heading, HStack, Divider } from '@chakra-ui/react';
import { Mail, Phone, Chrome, ShieldCheck, RefreshCw, Lock, Home, Search, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Login() {
  return (
    <Box minH="100vh" bg="brand.background" px={6} py={12}>
      <VStack spacing={8} maxW="400px" mx="auto">
        <VStack spacing={3} textAlign="center">
          <Heading fontSize="3xl" color="brand.primary">
            Welcome Back
          </Heading>
          <Text color="brand.gray.600">
            Sign in to continue your rental journey
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
          <Button
            w="100%"
            variant="secondary"
            leftIcon={<Chrome size={20} />}
            size="lg"
          >
            Continue with Google
          </Button>

          <Link to="/login-form" style={{ width: '100%' }}>
            <Button
              w="100%"
              variant="secondary"
              leftIcon={<Mail size={20} />}
              size="lg"
            >
              Continue with Email
            </Button>
          </Link>

          <Link to="/otp" style={{ width: '100%' }}>  
          <Button
            w="100%"
            variant="secondary"
            leftIcon={<Phone size={20} />}
            size="lg"
          >
            Continue with Phone
          </Button>
          </Link>
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

