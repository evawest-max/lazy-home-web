import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    VStack,
    Text,
    Heading,
    Spinner,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { verifyEmail } from '../../../api';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        async function confirmEmail() {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                setLoading(false);
                return;
            }
            console.log('Verifying email with token:', token);
            try {
                const response = await verifyEmail(token);
                setStatus('success');
                setMessage(response?.data?.data?.message || 'Your email has been verified successfully.');
            } catch (error) {
                console.error('verify email error', error?.response || error);
                setStatus('error');
                setMessage(
                    error?.response?.data?.data?.message ||
                    'Verification failed. Please try again or request a new verification link.'
                );
            } finally {
                setLoading(false);
            }
        }

        confirmEmail();
    }, [token]);

    return (
        <Box minH="100vh" bg="brand.background" px={6} py={12}>
            <VStack spacing={8} maxW="420px" mx="auto" align="center">
                <VStack spacing={3} textAlign="center">
                    <Heading fontSize="3xl" color="teal.700">
                        Verify Email
                    </Heading>
                    <Text color="gray.600">
                        {status === 'success'
                            ? 'Thank you! Your email is now verified.'
                            : 'Please wait while we confirm your email address.'}
                    </Text>
                </VStack>

                <Box bg="white" borderRadius="2xl" p={6} boxShadow="xl" w="100%">
                    <VStack spacing={4}>
                        {loading ? (
                            <VStack spacing={4} py={8}>
                                <Spinner size="xl" color="teal.600" />
                                <Text>Verifying your email...</Text>
                            </VStack>
                        ) : (
                            <>
                                <Alert status={status === 'success' ? 'success' : 'error'} borderRadius="md">
                                    <AlertIcon />
                                    <Text>{message}</Text>
                                </Alert>

                                <Button
                                    w="100%"
                                    size="lg"
                                    bg="teal.600"
                                    color="white"
                                    _hover={{ bg: 'teal.700' }}
                                    onClick={() => navigate('/login-form')}
                                >
                                    Go to Login
                                </Button>
                            </>
                        )}
                    </VStack>
                </Box>
            </VStack>
            <Navbar active="login-form" />
        </Box>
    );
}
