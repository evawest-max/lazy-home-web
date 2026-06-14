import { useState, useRef, useEffect } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Avatar,
    Heading,
    Grid,
    GridItem,
    Flex,
    Badge,
    IconButton,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@chakra-ui/react";
import {
    Camera,
    User,
    Shield,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    Lock,
    Phone,
    Mail,
    CreditCard,
    Users
} from "lucide-react";
import { updateProfile } from "../../../api.js";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";

export default function Profile({ onLogout, user }) {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [avatarSrc, setAvatarSrc] = useState("");
    const fileInputRef = useRef(null);

    const resolveAvatarSrc = (profile) =>
        profile?.avatarUrl || profile?.avatar || profile?.image || "";

    useEffect(() => {
        const nextAvatarSrc = resolveAvatarSrc(user);
        setAvatarSrc(nextAvatarSrc);
    }, [user]);

    useEffect(() => {
        return () => {
            if (avatarSrc && avatarSrc.startsWith("blob:")) {
                URL.revokeObjectURL(avatarSrc);
            }
        };
    }, [avatarSrc]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setAvatarSrc((currentSrc) => {
            if (currentSrc && currentSrc.startsWith("blob:")) {
                URL.revokeObjectURL(currentSrc);
            }
            return imageUrl;
        });

        const payload = new FormData();
        payload.append("image", file);

        updateProfile(payload, user.id).catch((error) => {
            console.error("Error updating profile:", error);
        });

    };

    const statusValue = user?.IsVerified ? 'Verified' : 'Pending';
    const emailStatusValue = user?.isEmailVerified ? 'Verified' : 'Pending';
    const phoneStatusValue = user?.isPhoneVerified ? 'Verified' : 'Pending';
    const identityStatusValue = user?.verification?.verificationLevel;
    const verificationItems = [
        { label: 'Identity', status: identityStatusValue, icon: User, path: '/verify_ID' },
        { label: 'Phone number', status: phoneStatusValue, icon: Phone, path: '/otp' },
        { label: 'Bank account', status: statusValue, icon: CreditCard, path: '/security' },
        { label: 'Email address', status: emailStatusValue, icon: Mail, path: '/settings' },
        { label: 'Lazy Homes Teams', status: 'Verified', icon: Users, path: '/support' },
    ];

    // const user = {
    //     name: "John Doe",
    //     email: "johndoe@email.com",
    //     verified: true,
    //     memberSince: "Jan 2024"
    // };

    const stats = [
        { label: "Items Donated", value: 12 },
        { label: "Requests", value: 5 },
        { label: "Sales", value: 8 },
        { label: "Items Posted", value: 20 },
        { label: "Amount Donated", value: "₦120,000" }
    ];

    const actions = [
        { icon: User, label: "Edit Profile" },
        { icon: Shield, label: "Verification Status", badge: user?.isEmailVerified && user?.isPhoneVerified && user?.verification.verificationLevel === 'verified' ? "Verified" : "Pending" },
        { icon: Lock, label: "Security" },
        { icon: Settings, label: "Settings" },
        { icon: HelpCircle, label: "Help & Support" },
        { icon: LogOut, label: "Logout", danger: true }
    ];

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <Box
            minH="100vh"
            bg="brand.background"
            px={6}
            py={10}
        >
            <Box maxW="800px" mx="auto">

                {/* Header */}
                <Heading mb={8} color="teal.700">
                    Lazy Homes Profile
                </Heading>

                {/* Profile Card */}
                <Box
                    bg="white"
                    p={6}
                    borderRadius="2xl"
                    boxShadow="xl"
                    textAlign="center"
                    mb={8}
                >
                    <VStack spacing={4}>
                        <Box position="relative">
                            <Avatar
                                size="2xl"
                                name={user.fullName}
                                src={avatarSrc || undefined}
                            />

                            <IconButton
                                icon={<Camera size={16} />}
                                position="absolute"
                                bottom="0"
                                right="0"
                                borderRadius="full"
                                size="sm"
                                bg="teal.500"
                                color="white"
                                _hover={{ bg: "teal.600" }}
                                aria-label="Upload new profile picture"
                                onClick={handleAvatarClick}
                            />

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                        </Box>

                        <Heading size="md">{user.fullName}</Heading>
                        <Text color="gray.500">{user.email}</Text>

                        <HStack>
                            <Text fontSize="sm" color="gray.500">
                                Member since {user.memberSince || "N/A"}
                            </Text>

                            {user.verified && (
                                <Badge colorScheme="green">Verified</Badge>
                            )}
                        </HStack>
                    </VStack>
                </Box>

               
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                    <ModalOverlay />
                    <ModalContent borderRadius="2xl" overflow="hidden">
                        <ModalHeader>Verification Status</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={3} align="stretch">
                                {verificationItems.map((item) => (
                                    <Flex
                                        key={item.label}
                                        align="center"
                                        justify="space-between"
                                        p={4}
                                        borderRadius="xl"
                                        bg="gray.50"
                                        cursor="pointer"
                                        _hover={{ bg: 'gray.100' }}
                                        onClick={() => {
                                            onClose();
                                            navigate(item.path);
                                        }}
                                    >
                                        <HStack spacing={3}>
                                            <item.icon size={18} color="#0F766E" />
                                            <Text fontWeight="600">{item.label}</Text>
                                        </HStack>
                                        <Badge colorScheme={item.status == 'Verified' ? 'green' : 'yellow'}>
                                            {item.status}
                                        </Badge>
                                    </Flex>
                                ))}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={onClose} colorScheme="teal" w="100%">
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Actions Card */}
                <Box
                    bg="white"
                    p={6}
                    borderRadius="2xl"
                    boxShadow="xl"
                >
                    <Heading size="md" mb={4} color="teal.700">
                        Account Management
                    </Heading>

                    <VStack spacing={3} align="stretch">
                        {actions.map((item, index) => {
                            const targetPath =
                                item.label === "Edit Profile" ? "/edit-profile" :
                                item.label === "Security" ? "/security" :
                                item.label === "Settings" ? "/settings" :
                                item.label === "Help & Support" ? "/Support" :
                                null;

                            const content = (
                                <Flex
                                    key={index}
                                    p={4}
                                    borderRadius="xl"
                                    align="center"
                                    justify="space-between"
                                    cursor="pointer"
                                    _hover={{ bg: "gray.100" }}
                                    onClick={
                                        item.label === "Logout" ? handleLogout :
                                        item.label === "Verification Status" ? onOpen :
                                        undefined
                                    }
                                >
                                    <HStack>
                                        <item.icon
                                            size={20}
                                            color={item.danger ? "#E53E3E" : "#0F766E"}
                                        />
                                        <Text fontWeight="500">{item.label}</Text>
                                    </HStack>

                                    <HStack>
                                        {item.badge && (
                                            <Badge colorScheme={item.badge === 'Verified' ? 'green' : 'yellow'}>
                                                {item.badge}
                                            </Badge>
                                        )}
                                        <ChevronRight size={18} />
                                    </HStack>
                                </Flex>
                            );

                            return targetPath ? (
                                <Link key={index} to={targetPath}>
                                    {content}
                                </Link>
                            ) : (
                                <Box key={index}>{content}</Box>
                            );
                        })}
                    </VStack>
                </Box>

            </Box>
            <Navbar active="profile" />
        </Box>
    );
}