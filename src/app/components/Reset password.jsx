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
    Spinner,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from './Navbar';
import { resetPassword } from '../../../api';


export default function ResetPassword() {
    const navigate = useNavigate();
    const { resetToken } = useParams();
    const [searchParams] = useSearchParams();
    const token = resetToken || searchParams.get('token');
    console.log('ResetPassword token from URL:', token);


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!token) {
        return (
            <Box minH="100vh" bg="brand.background" px={6} py={12}>
                <VStack spacing={8} maxW="420px" mx="auto" align="center">
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Text>Invalid or missing reset token. Please request a new password reset link.</Text>
                    </Alert>
                    <Link to="/login-form" style={{ width: '100%' }}>
                        <Button w="100%" size="lg" bg="teal.600" color="white">
                            Back to Sign In
                        </Button>
                    </Link>
                </VStack>
                <Navbar active="login-form" />
            </Box>
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        console.log("Confirm Password:", confirmPassword);

        // Validation
        if (!password || !confirmPassword) {
            setError('Please enter and confirm your password.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            // console.log('Resetting password with token:', token);
            await resetPassword(token, password);
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login-form');
            }, 2000);
        } catch (err) {
            console.error('reset password error', err?.response || err);
            const message = err?.response?.data?.message || 'Failed to reset password. Please try again.';
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
                        Reset Password
                    </Heading>
                    <Text color="gray.600">
                        Enter a new password to regain access to your account
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

                            {/* New Password */}
                            <FormControl isRequired>
                                <FormLabel>New Password</FormLabel>
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

                            {/* Confirm Password */}
                            <FormControl isRequired>
                                <FormLabel>Confirm Password</FormLabel>
                                <InputGroup size="lg">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            variant="ghost"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            icon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        />
                                    </InputRightElement>
                                </InputGroup>
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
                                {loading ? '' : 'Reset Password'}
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

            </VStack>
            <Navbar active="login-form" />
        </Box>
    );
}
