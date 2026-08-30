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
    useToast,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Grid,
    SimpleGrid,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { changePassword, DisableTwoFactor, recoverTwoFactor, setupTwoFactor, verifyTwoFactor } from '../../../api';
import Navbar from './Navbar';
import { PinInput, PinInputField } from "@chakra-ui/react";
import RecoveryCodesDisplay from '../RecoveryDisplayCodes';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ChangePassword({ user }) {
    console.log(user)
    const [localTwoFactorEnabled, setLocalTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [barcode, setBarcode] = useState(null)
    const [token, setToken] = useState("")
    const [recoverModalOpen, setRecoverModalOpen] = useState(false);
    const [recoverPassword, setRecoverPassword] = useState('');
    const [recoveryCode, setRecoveryCode] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [recovering2fa, setRecovering2fa] = useState(false);
    const [disableModalOpen, setDisableModalOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disableAuthCode, setDisableAuthCode] = useState('');
    const [disabling2fa, setDisabling2fa] = useState(false);
    const toast = useToast()
    const navigate = useNavigate()

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

    const updateStoredUserTwoFactorFlag = (twoFactorEnabled) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...storedUser, twoFactorEnabled };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setLocalTwoFactorEnabled(twoFactorEnabled);
        } catch (error) {
            console.error('Failed to update stored user 2FA status:', error);
        }
    };

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

    async function enable2fa() {
        setLoading(true);
        try {
            const res = await setupTwoFactor()
            setBarcode(res.data.data)
            setLoading(false)
            console.log(res)
        } catch (error) {
            toast({
                title: '2FA verification',
                description: error.data.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setLoading(false)
            console.log(error)
        }
    }

    async function handleVerify2fa() {
        console.log(token)
        try {
            const res = await verifyTwoFactor(token)
            console.log(res)
            setRecoveryCodes(res.data.data.recoveryCodes)
            updateStoredUserTwoFactorFlag(true);
            toast({
                title: '2FA verification',
                description: res.data.message || "activated",
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            console.log(res)
        } catch (error) {
            toast({
                title: '2FA verification',
                description: error.data.message || "error occured",
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            // console.log(error.data.message)
        }
    }

    async function handleRecover2fa() {
        if (!recoverPassword.trim()) {
            toast({
                title: 'Recovery required',
                description: 'Please enter your password.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!recoveryCode.trim()) {
            toast({
                title: 'Recovery code required',
                description: 'Please enter your recovery code.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setRecovering2fa(true);

        try {
            const res = await recoverTwoFactor(recoverPassword, recoveryCode);
            toast({
                title: '2FA recovered',
                description: res?.data?.message || 'Your 2FA has been recovered successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            updateStoredUserTwoFactorFlag(false);
            setRecoverModalOpen(false);
            setRecoverPassword('');
            setRecoveryCode('');
            await enable2fa();
        } catch (error) {
            const message = error?.response?.data?.message || 'Unable to recover 2FA. Please try again.';
            toast({
                title: '2FA recovery failed',
                description: message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setRecovering2fa(false);
        }
    }

    async function handleDisable2fa() {
        if (!disablePassword.trim()) {
            toast({
                title: 'Password required',
                description: 'Please enter your password.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!disableAuthCode.trim()) {
            toast({
                title: 'Authenticator code required',
                description: 'Please enter your authenticator code.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setDisabling2fa(true);

        try {
            const res = await DisableTwoFactor(disablePassword, disableAuthCode);
            toast({
                title: '2FA disabled',
                description: res?.data?.message || 'Two-factor authentication has been disabled.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            updateStoredUserTwoFactorFlag(false);
            setDisableModalOpen(false);
            setDisablePassword('');
            setDisableAuthCode('');
            setRecoveryCodes([]);
            setBarcode(null);
            setToken('');
        } catch (error) {
            const message = error?.response?.data?.message || 'Unable to disable 2FA. Please try again.';
            toast({
                title: '2FA disable failed',
                description: message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDisabling2fa(false);
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

                {localTwoFactorEnabled === false ? <Button
                    type="submit"
                    w="100%"
                    bg="brand.primary"
                    color="white"
                    size="sm"
                    fontSize="md"
                    fontWeight="600"
                    _hover={{ bg: 'brand.primary', opacity: 0.9 }}
                    isDisabled={barcode}
                    isLoading={loading}
                    spinner={<Spinner size="sm" color="white" />}
                    onClick={() => enable2fa()}
                >
                    Enable 2FA
                </Button> :
                    <>
                        <Text textAlign="center" > 2FA Enabled!</Text>
                        {
                            recoveryCodes.length <= 0 &&
                            <>
                                <Button size="sm" onClick={() => setDisableModalOpen(true)}>Disable 2FA</Button>

                                <Text textAlign="center"> <strong>OR</strong></Text>
                                <HStack justifyContent="center">
                                    <Text textAlign="center"> Lost 2FA?</Text>
                                    <Button size="xs" onClick={() => setRecoverModalOpen(true)}>Recover 2FA</Button>
                                </HStack>
                            </>
                        }
                    </>
                }
                {recoveryCodes.length < 10 && barcode && (<VStack>
                    <Image src={barcode.qrCode || ""} placeholder="Barcode" />
                    <Text overflowWrap="anywhere">
                        {barcode.secret}
                    </Text>
                    <FormControl isRequired>
                        <FormLabel fontWeight="600" color="brand.primary">
                            Scan code and enter token
                            <br />

                        </FormLabel>
                        <InputGroup size="md">
                            <HStack mx="auto" alignSelf="center" >
                                <PinInput
                                    otp
                                    value={token}
                                    onChange={(value) => setToken(value)}
                                    focusBorderColor="teal.500"
                                >
                                    <PinInputField boxSize={16} />
                                    <PinInputField boxSize={16} />
                                    <PinInputField boxSize={16} />
                                    <PinInputField boxSize={16} />
                                    <PinInputField boxSize={16} />
                                    <PinInputField boxSize={16} />
                                </PinInput>
                            </HStack>
                            {/* <InputRightElement>
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
                        </InputRightElement> */}
                        </InputGroup>
                        {!token && (
                            <FormHelperText color="red.500" fontSize="xs">
                                Please enter token
                            </FormHelperText>
                        )}
                    </FormControl>
                    <Button
                        type="submit"
                        w="100%"
                        bg="brand.primary"
                        color="white"
                        size="lg"
                        fontSize="md"
                        fontWeight="600"
                        _hover={{ bg: 'brand.primary', opacity: 0.9 }}
                        isDisabled={loading || token.length != 6}
                        isLoading={loading}
                        spinner={<Spinner size="sm" color="white" />}
                        onClick={() => handleVerify2fa()}
                    >
                        Verify 2FA
                    </Button>
                </VStack>)}

                {recoveryCodes.length > 0 &&

                    <RecoveryCodesDisplay recoveryCodes={recoveryCodes} onCompleteSetup={() => navigate("/dashboard")} />

                }


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
            <Modal isOpen={disableModalOpen} onClose={() => setDisableModalOpen(false)} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>Disable 2FA</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="brand.gray.600">
                                Enter your password and the current authenticator code to disable two-factor authentication.
                            </Text>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="brand.primary">Password</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="brand.primary">Authenticator code</FormLabel>
                                <Input
                                    placeholder="Enter your 6-digit code"
                                    value={disableAuthCode}
                                    onChange={(e) => setDisableAuthCode(e.target.value)}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setDisableModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            bg="brand.primary"
                            color="white"
                            isLoading={disabling2fa}
                            onClick={handleDisable2fa}
                        >
                            Disable 2FA
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={recoverModalOpen} onClose={() => setRecoverModalOpen(false)} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>Recover 2FA</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="brand.gray.600">
                                Enter your password and one of your recovery codes to regain access and set up 2FA again.
                            </Text>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="brand.primary">Password</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={recoverPassword}
                                    onChange={(e) => setRecoverPassword(e.target.value)}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="brand.primary">Recovery code</FormLabel>
                                <Input
                                    placeholder="Enter your recovery code"
                                    value={recoveryCode}
                                    onChange={(e) => setRecoveryCode(e.target.value)}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setRecoverModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            bg="brand.primary"
                            color="white"
                            isLoading={recovering2fa}
                            onClick={handleRecover2fa}
                        >
                            Recover 2FA
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Navbar active="profile" />
        </Box>
    );
}
