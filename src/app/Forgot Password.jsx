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
    AlertIcon
} from '@chakra-ui/react';
import { Link,  } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import { forgotPassword } from '../../api';


export default function ForgotPassword() {
    
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess('Password reset link sent to your email. Please check your inbox.');
            setEmail('');
            setTimeout(() => {
 
            }, 3000);
        } catch (err) {
            console.error('forgot password error', err?.response || err);
            const message = err?.response?.data?.message || 'Failed to send reset link. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box minH="100vh" bg="brand.background" px={6} py={12}>
            <VStack spacing={8} maxW="420px" mx="auto" align="center">

                {/* Header */}
                <VStack spacing={3} textAlign="center">
                    <Heading fontSize="3xl" color="teal.700">
                        Forgot Password
                    </Heading>
                    <Text color="gray.600">
                        Enter your email and we'll send you a link to reset your password
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
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={4}>

                            {/* Email */}
                            <FormControl isRequired>
                                <FormLabel>Email Address</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    size="lg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormControl>

                            {/* Error Message */}
                            {error && (
                                <Alert status="error" borderRadius="md">
                                    <AlertIcon />
                                    <Text fontSize="sm">{error}</Text>
                                </Alert>
                            )}

                            {/* Success Message */}
                            {success && (
                                <Alert status="success" borderRadius="md">
                                    <AlertIcon />
                                    <Text fontSize="sm">{success}</Text>
                                </Alert>
                            )}

                            {/* Submit */}
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
                                {loading ? '' : 'Send Reset Link'}
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

                {/* Redirect */}
                <Text fontSize="sm" color="gray.600">
                    Remember your password?{" "}
                    <Text
                        as={Link}
                        to="/login-form"
                        color="teal.600"
                        fontWeight="bold"
                        cursor="pointer"
                    >
                        Sign In
                    </Text>
                </Text>

                <Text fontSize="sm" color="gray.600">
                    Don't have an account?{" "}
                    <Text
                        as={Link}
                        to="/signup"
                        color="teal.600"
                        fontWeight="bold"
                        cursor="pointer"
                    >
                        Sign Up
                    </Text>
                </Text>

            </VStack>
            <Navbar active="login-form" />
        </Box>
    );
}
