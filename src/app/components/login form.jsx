import {
    Box,
    Button,
    VStack,
    Text,
    Heading,
    Input,
    FormControl,
    FormLabel,
    InputGroup,
    InputRightElement,
    IconButton,
    HStack,
    Divider,
    Spinner
} from '@chakra-ui/react';
import { Link, } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from './Navbar';
import { loginUser, resendVerificationEmail } from '../../../api.js';

export default function SignInForm({onLogin}) {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser({ email, password });
            console.log('login success', res);
            if (res?.data?.data?.accessToken) {
                localStorage.setItem('token', res.data.data.accessToken);
                if (res?.data?.data?.user) {
                    localStorage.setItem('user', JSON.stringify(res.data.data.user));
                }
            }
            onLogin(res.data.data.user);
        } catch (err) {
            const message = err?.response?.data?.message  || 'Login failed' ;
            console.error('login error', err?.response || err);
            setErrorMessage(message + (err?.response?.data?.message === "Email not verified. Please check your inbox for the verification email." ? " Or click the button below to resend the verification email." : 'Login failed. Please check your credentials and try again.'));
            setShowResendVerification(
                message === 'Email not verified. Please check your inbox for the verification email.'
            );
            setResendSuccess('');
        } finally {
            setLoading(false);
        }
    }

    async function handleResendVerification() {
        if (!email) {
            setErrorMessage('Please enter your email to resend verification.');
            return;
        }

        setResendLoading(true);
        setResendSuccess('');
        try {
            await resendVerificationEmail(email);
            setResendSuccess('Verification link sent. Check your inbox.');
            alert('Verification link sent. Please check your inbox.');
            setErrorMessage('');
            setShowResendVerification(false);
        } catch (resendErr) {
            console.error('resend verification error', resendErr?.response || resendErr);
            setErrorMessage(resendErr?.response?.data?.message || 'Failed to resend verification email.');
            alert(resendErr?.response?.data?.message || 'Failed to resend verification email.');
        } finally {
            setResendLoading(false);
        }
    }

    

    return (
        <Box
            minH="100vh"
            bg="brand.background"
            px={6}
            py={12}
        >
            <VStack spacing={8} maxW="420px" mx="auto" align="center"  >

                {/* Header */}
                <VStack spacing={3} textAlign="center">
                    <Heading fontSize="3xl" color="teal.700">
                        Sign In
                    </Heading>
                    <Text color="gray.600">
                        Welcome back, continue your journey
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

                        {/* Password */}
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputRightElement>
                                    <IconButton
                                        variant="ghost"
                                        onClick={() => setShowPassword(!showPassword)}
                                        icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        {/* Forgot password */}
                        <Text
                            as={Link}
                            to="/forgot-password"
                            alignSelf="flex-end"
                            fontSize="sm"
                            color="teal.600"
                            cursor="pointer"
                        >
                            Forgot password?
                        </Text>

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
                            {loading ? '' : 'Sign In'}
                        </Button>

                        {errorMessage && (
                            <Text color="red.500" fontSize="sm" textAlign="center" mt={2}>
                                {errorMessage}
                            </Text>
                        )}

                        {showResendVerification && (
                            <Button
                                type="button"
                                w="100%"
                                size="md"
                                variant="outline"
                                color="teal.700"
                                borderColor="teal.700"
                                onClick={handleResendVerification}
                                isLoading={resendLoading}
                                disabled={resendLoading}
                            >
                                Resend Verification Email
                            </Button>
                        )}

                        {resendSuccess && (
                            <Text color="green.500" fontSize="sm" textAlign="center" mt={2}>
                                {resendSuccess}
                            </Text>
                        )}

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
                    Don’t have an account?{" "}
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