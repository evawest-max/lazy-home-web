import { useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    FormControl,
    FormLabel,
    Input,
    Button,
    Avatar,
    IconButton,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Stack,
    SimpleGrid,
} from '@chakra-ui/react';
import { Camera } from 'lucide-react';
import Navbar from './Navbar';
import { updateProfile } from '../../../api.js';
import { useNavigate } from 'react-router-dom';

export default function EditProfile({ user }) {
    const navigate = useNavigate();
    const toast = useToast();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        about: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resolveAvatarSrc = (profile) =>
        profile?.avatarUrl || profile?.avatar || profile.avatarFile || profile?.image || "";

    useEffect(() => {
        const nextAvatarSrc = resolveAvatarSrc(user);

        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                about: user.about || '',
            });
            setAvatarPreview(nextAvatarSrc || '');
        } else {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setFormData({
                    fullName: parsed.fullName || '',
                    email: parsed.email || '',
                    phone: parsed.phone || '',
                    about: parsed.about || '',
                });
                setAvatarPreview(parsed.avatarUrl || '');
            }
        }
    }, [user]);

    const handleInputChange = (field) => (event) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.fullName.trim() || !formData.email.trim()) {
            setError('Full name and email are required.');
            return;
        }

        setLoading(true);
        try {
            const payload = new FormData();
            payload.append('fullName', formData.fullName.trim());
            payload.append('email', formData.email.trim());
            payload.append('phone', formData.phone.trim());
            payload.append('about', formData.about.trim());
            if (avatarFile) {
                payload.append('image', avatarFile);
            }

            await updateProfile(payload, user.id);
            setSuccess('Profile updated successfully.');
            toast({
                title: 'Profile updated',
                description: 'Your profile changes were saved successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            localStorage.setItem('user', JSON.stringify({
                ...user,
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                image: avatarPreview,
                about: formData.about.trim(),
            }));

            setTimeout(() => {
                navigate('/profile');
            }, 1200);
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to update profile. Please try again.';
            setError(message);
            toast({
                title: "Profile Update Failed",
                description: message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            // console.error('Error updating profile:', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box minH="100vh" bg="brand.background" px={{ base: 4, md: 8, lg: 12 }} py={{ base: 8, md: 10, lg: 12 }}>
            <Box maxW="7xl" mx="auto">
                <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                    <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" boxShadow="xl">
                        <Heading size={{ base: 'lg', md: 'xl' }} color="brand.primary" mb={3}>
                            Edit Profile
                        </Heading>
                        <Text color="brand.gray.600" fontSize={{ base: 'md', md: 'lg' }}>
                            Update your details so we can keep your account accurate and secure.
                        </Text>
                    </Box>

                    <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" boxShadow="xl">
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={6} align="stretch">
                                <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="start">
                                    <Box textAlign="center" flex="0 0 220px">
                                        <Avatar size="2xl" name={formData.fullName} src={avatarPreview} mb={4} />
                                        <Text fontWeight="600" color="brand.primary" mb={2}>
                                            Profile Photo
                                        </Text>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            width="100%"
                                            p={1}
                                            bg="brand.gray.50"
                                            borderRadius="xl"
                                            borderColor="brand.gray.200"
                                        />
                                    </Box>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} flex="1">
                                        <FormControl>
                                            <FormLabel>Full Name</FormLabel>
                                            <Input
                                                value={formData.fullName}
                                                onChange={handleInputChange('fullName')}
                                                placeholder="Full name"
                                                size="lg"
                                                bg="brand.gray.50"
                                                borderColor="brand.gray.300"
                                                _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px rgba(0, 105, 92, 0.25)' }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Email Address</FormLabel>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange('email')}
                                                placeholder="you@example.com"
                                                size="lg"
                                                bg="brand.gray.50"
                                                borderColor="brand.gray.300"
                                                _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px rgba(0, 105, 92, 0.25)' }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Phone Number</FormLabel>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange('phone')}
                                                placeholder="08012345678"
                                                size="lg"
                                                bg="brand.gray.50"
                                                borderColor="brand.gray.300"
                                                _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px rgba(0, 105, 92, 0.25)' }}
                                            />
                                        </FormControl>

                                        <FormControl gridColumn={{ base: '1 / -1', md: 'span 2' }}>
                                            <FormLabel>About You</FormLabel>
                                            <Input
                                                value={formData.about}
                                                onChange={handleInputChange('about')}
                                                placeholder="A short bio or profile note"
                                                size="lg"
                                                bg="brand.gray.50"
                                                borderColor="brand.gray.300"
                                                _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px rgba(0, 105, 92, 0.25)' }}
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </Stack>

                                {(error || success) && (
                                    <VStack spacing={3} align="stretch">
                                        {error && (
                                            <Alert status="error" borderRadius="xl">
                                                <AlertIcon />
                                                {error}
                                            </Alert>
                                        )}
                                        {success && (
                                            <Alert status="success" borderRadius="xl">
                                                <AlertIcon />
                                                {success}
                                            </Alert>
                                        )}
                                    </VStack>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    colorScheme="teal"
                                    isLoading={loading}
                                    alignSelf="flex-start"
                                >
                                    Save Changes
                                </Button>
                            </VStack>
                        </form>
                    </Box>
                </VStack>
            </Box>
            <Navbar active="profile" />
        </Box>
    );
}
