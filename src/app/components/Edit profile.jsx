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
            console.error('Error updating profile:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box minH="100vh" bg="brand.background" px={6} py={10}>
            <Box maxW="680px" mx="auto">
                <VStack spacing={6} align="stretch">
                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="xl">
                        <Heading size="lg" color="teal.700" mb={2}>
                            Edit Profile
                        </Heading>
                        <Text color="gray.600">
                            Update your details so we can keep your account accurate and secure.
                        </Text>
                    </Box>

                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="xl">
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={5} align="stretch">
                                <HStack spacing={6} align="flex-start">
                                    <Avatar size="xl" name={formData.fullName} src={avatarPreview} />
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="600" color="brand.primary">
                                            Profile Photo
                                        </Text>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            width="auto"
                                            p={1}
                                        />
                                    </VStack>
                                </HStack>

                                <FormControl isReadOnly>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input
                                        value={formData.fullName}
                                        onChange={handleInputChange('fullName')}
                                        placeholder="Full name"
                                        size="lg"
                                        bg="gray.50"
                                        borderColor="brand.gray.300"
                                        _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                    />
                                </FormControl>

                                <FormControl isReadOnly>
                                    <FormLabel>Email Address</FormLabel>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange('email')}
                                        placeholder="you@example.com"
                                        size="lg"
                                        bg="gray.50"
                                        borderColor="brand.gray.300"
                                        _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                    />
                                </FormControl>

                                <FormControl isReadOnly>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange('phone')}
                                        placeholder="08012345678"
                                        size="lg"
                                        bg="gray.50"
                                        borderColor="brand.gray.300"
                                        _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>About You</FormLabel>
                                    <Input
                                        value={formData.about}
                                        onChange={handleInputChange('about')}
                                        placeholder="A short bio or profile note"
                                        size="lg"
                                        bg="gray.50"
                                        borderColor="brand.gray.300"
                                        _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
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
                                    size="lg"
                                    colorScheme="teal"
                                    isLoading={loading}
                                    spinner={<Spinner size="sm" color="white" />}
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
