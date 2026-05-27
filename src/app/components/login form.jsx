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
    Divider
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from './Navbar';

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Box
            minH="100vh"
            bg="brand.background"
            px={6}
            py={12}
        >
            <VStack spacing={8} maxW="420px" mx="auto" align="center">

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
                    <VStack spacing={4}>

                        {/* Email */}
                        <FormControl isRequired>
                            <FormLabel>Email Address</FormLabel>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                size="lg"
                            />
                        </FormControl>

                        {/* Password */}
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
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
                            w="100%"
                            size="lg"
                            bg="teal.600"
                            color="white"
                            _hover={{ bg: "teal.700" }}
                        >
                            Sign In
                        </Button>

                    </VStack>
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