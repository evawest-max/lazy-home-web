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
    IconButton
} from "@chakra-ui/react";
import {
    Camera,
    User,
    Shield,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    Lock
} from "lucide-react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

export default function Profile() {
    const user = {
        name: "John Doe",
        email: "johndoe@email.com",
        verified: true,
        memberSince: "Jan 2024"
    };

    const stats = [
        { label: "Items Donated", value: 12 },
        { label: "Requests", value: 5 },
        { label: "Sales", value: 8 },
        { label: "Items Posted", value: 20 },
        { label: "Amount Donated", value: "₦120,000" }
    ];

    const actions = [
        { icon: User, label: "Edit Profile" },
        { icon: Shield, label: "Verification Status", badge: "Verified" },
        { icon: Lock, label: "Security" },
        { icon: Settings, label: "Settings" },
        { icon: HelpCircle, label: "Help & Support" },
        { icon: LogOut, label: "Logout", danger: true }
    ];

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
                    Profile
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
                            <Avatar size="2xl" name={user.name} />

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
                            />
                        </Box>

                        <Heading size="md">{user.name}</Heading>
                        <Text color="gray.500">{user.email}</Text>

                        <HStack>
                            <Text fontSize="sm" color="gray.500">
                                Member since {user.memberSince}
                            </Text>

                            {user.verified && (
                                <Badge colorScheme="green">Verified</Badge>
                            )}
                        </HStack>
                    </VStack>
                </Box>

                {/* Stats Card */}
                <Box
                    bg="white"
                    p={6}
                    borderRadius="2xl"
                    boxShadow="xl"
                    mb={8}
                >
                    <Heading size="md" mb={4} color="teal.700">
                        Activity Summary
                    </Heading>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        {stats.map((stat, i) => (
                            <GridItem
                                key={i}
                                bg="gray.50"
                                p={4}
                                borderRadius="xl"
                                textAlign="center"
                            >
                                <Text fontWeight="bold" fontSize="lg">
                                    {stat.value}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    {stat.label}
                                </Text>
                            </GridItem>
                        ))}
                    </Grid>
                </Box>

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
                        {actions.map((item, index) => (
                            <Link to={
                                item.label== "Verification Status"? "/verify_ID":
                                item.label== "Edit Profile"? "/edit-profile":
                                item.label== "Security"? "/security":
                                item.label== "Settings"? "/settings":
                                item.label== "Help & Support"? "/Support":
                                item.label== "Logout" && "/login"
                             }>
                                <Flex
                                    key={index}
                                    p={4}
                                    borderRadius="xl"
                                    align="center"
                                    justify="space-between"
                                    cursor="pointer"
                                    _hover={{ bg: "gray.100" }}
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
                                            <Badge colorScheme="green">{item.badge}</Badge>
                                        )}
                                        <ChevronRight size={18} />
                                    </HStack>
                                </Flex>
                            </Link>
                        ))}
                    </VStack>
                </Box>

            </Box>
            <Navbar active="profile" />
        </Box>
    );
}