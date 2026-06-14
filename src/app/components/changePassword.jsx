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
    Alert,
    AlertIcon,
    Progress,
    FormHelperText,
    Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { changePassword } from '../../../api';
import Navbar from './Navbar';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password strength validation
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: 'gray' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;

        if (strength <= 1) return { strength: 25, label: 'Weak', color: 'red' };
        if (strength <= 2) return { strength: 50, label: 'Fair', color: 'orange' };
        if (strength <= 3) return { strength: 75, label: 'Good', color: 'yellow' };
        return { strength: 100, label: 'Strong', color: 'green' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const passwordValid = newPassword.length >= 8;
    const isFormValid = currentPassword && passwordValid && passwordsMatch;

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        console.log("Current Password:", currentPassword);
        console.log("New Password:", newPassword);
        console.log("Confirm Password:", confirmPassword);

        // Validation
        if (!currentPassword) {
            setError('Please enter your current password.');
            return;
        }

        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from your current password.');
            return;
        }

        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to change password. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box minH="100vh" bg="brand.background" px={6} py={12}>
            <VStack spacing={8} maxW="500px" mx="auto" align="stretch">

                {/* Header */}
                <VStack spacing={2} textAlign="center">
                    <Heading fontSize="2xl" color="brand.primary">
                        Change Password
                    </Heading>
                    <Text color="brand.gray.600">
                        Update your password to keep your account secure
                    </Text>
                </VStack>

                {/* Form Card */}
                <Box
                    bg="white"
                    borderRadius="xl"
                    p={8}
                    boxShadow="md"
                    w="100%"
                >
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={5}>

                            {/* Current Password */}
                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="brand.primary">
                                    Current Password
                                </FormLabel>
                                <InputGroup size="md">
                                    <Input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Enter your current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        bg="gray.50"
                                        borderColor="brand.gray.300"
                                        _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            icon={showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            _hover={{ bg: 'transparent' }}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            {/* New Password */}
                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="brand.primary">
                                    New Password
                                </FormLabel>
                                <InputGroup size="md">
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Enter a new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        bg="gray.50"
                                        borderColor="brand.gray.300"
                                        _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            icon={showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            _hover={{ bg: 'transparent' }}
                                        />
                                    </InputRightElement>
                                </InputGroup>

                                {/* Password Strength */}
                                {newPassword && (
                                    <VStack spacing={2} mt={3} align="stretch">
                                        <HStack justify="space-between">
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Password Strength
                                            </Text>
                                            <Text fontSize="xs" fontWeight="600" color={`${passwordStrength.color}.500`}>
                                                {passwordStrength.label}
                                            </Text>
                                        </HStack>
                                        <Progress
                                            value={passwordStrength.strength}
                                            size="sm"
                                            colorScheme={passwordStrength.color}
                                            borderRadius="full"
                                        />
                                    </VStack>
                                )}

                                <FormHelperText fontSize="xs" color="brand.gray.600" mt={2}>
                                    Minimum 8 characters, including uppercase, lowercase, numbers, and special characters
                                </FormHelperText>
                            </FormControl>

                            {/* Confirm Password */}
                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="brand.primary">
                                    Confirm New Password
                                </FormLabel>
                                <InputGroup size="md">
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        bg="gray.50"
                                        borderColor={
                                            confirmPassword === ''
                                                ? 'brand.gray.300'
                                                : passwordsMatch
                                                    ? 'green.400'
                                                    : 'red.400'
                                        }
                                        _focus={{ bg: 'white', boxShadow: '0 0 0 1px #00695C' }}
                                    />
                                    <InputRightElement>
                                        {confirmPassword && (
                                            passwordsMatch ? (
                                                <Check size={18} color="green" />
                                            ) : (
                                                <X size={18} color="red" />
                                            )
                                        )}
                                        {!confirmPassword && (
                                            <IconButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                icon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                _hover={{ bg: 'transparent' }}
                                            />
                                        )}
                                    </InputRightElement>
                                </InputGroup>
                                {confirmPassword && !passwordsMatch && (
                                    <FormHelperText color="red.500" fontSize="xs">
                                        Passwords do not match
                                    </FormHelperText>
                                )}
                            </FormControl>

                            {/* Error Message */}
                            {error && (
                                <Alert status="error" borderRadius="md" bg="red.50" border="1px solid" borderColor="red.300">
                                    <AlertIcon />
                                    <Text fontSize="sm">{error}</Text>
                                </Alert>
                            )}

                            {/* Success Message */}
                            {success && (
                                <Alert status="success" borderRadius="md" bg="green.50" border="1px solid" borderColor="green.300">
                                    <AlertIcon />
                                    <Text fontSize="sm">{success}</Text>
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                w="100%"
                                bg="brand.primary"
                                color="white"
                                size="lg"
                                fontSize="md"
                                fontWeight="600"
                                _hover={{ bg: 'brand.primary', opacity: 0.9 }}
                                isDisabled={loading || !isFormValid}
                                isLoading={loading}
                                spinner={<Spinner size="sm" color="white" />}
                            >
                                {loading ? '' : 'Update Password'}
                            </Button>

                        </VStack>
                    </form>
                </Box>

                {/* Info Box */}
                <Box
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.300"
                    borderRadius="lg"
                    p={4}
                >
                    <VStack spacing={2} align="start">
                        <Text fontSize="sm" fontWeight="600" color="blue.900">
                            Security Tips
                        </Text>
                        <Text fontSize="xs" color="blue.800">
                            • Use a password you don't use elsewhere
                        </Text>
                        <Text fontSize="xs" color="blue.800">
                            • Include uppercase, lowercase, numbers, and symbols
                        </Text>
                        <Text fontSize="xs" color="blue.800">
                            • Never share your password with anyone
                        </Text>
                    </VStack>
                </Box>

            </VStack>
            <Navbar active="profile" />
        </Box>
    );
}
