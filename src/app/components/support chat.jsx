import { useState, useRef, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Heading,
    Flex,
    Badge,
    Avatar,
    Divider,
    // ScrollArea,
    IconButton,
    Tooltip,
} from '@chakra-ui/react';
import {
    Send,
    Phone,
    Clock,
    MessageSquare,
    HelpCircle,
    ChevronDown,
} from 'lucide-react';
import Navbar from './Navbar';

export default function SupportChat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'support',
            text: 'Hello! Welcome to LazyHomes Support. How can we help you today?',
            timestamp: new Date(Date.now() - 5 * 60000),
            senderName: 'Support Team',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFAQ, setShowFAQ] = useState(true);
    const scrollRef = useRef(null);

    const faqs = [
        {
            id: 1,
            question: 'How do I list a property?',
            answer: 'To list a property, go to your dashboard and click "Create Listing". Follow the step-by-step guide to add details, photos, and pricing.',
        },
        {
            id: 2,
            question: 'What is the verification process?',
            answer: 'We verify your identity, phone number, email, and bank account to ensure safe transactions. You can complete this in your profile settings.',
        },
        {
            id: 3,
            question: 'How long does payment take?',
            answer: 'Payments are processed within 24-48 hours to your verified bank account. You can track status in your transaction history.',
        },
        {
            id: 4,
            question: 'How do I contact support?',
            answer: 'You can reach us through this chat, email support@lazyhomes.com, or call +234 123 456 7890. We respond within 2 hours.',
        },
        {
            id: 5,
            question: 'What are the fees?',
            answer: 'We charge a 2.5% transaction fee on all bookings. No hidden charges. See pricing details in our FAQ section.',
        },
        {
            id: 6,
            question: 'Can I cancel my booking?',
            answer: 'Yes, you can cancel up to 24 hours before the inspection. Full refund will be processed to your account.',
        },
    ];

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text,
            timestamp: new Date(),
            senderName: 'You',
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        // Simulate support team response after a delay
        setTimeout(() => {
            const supportResponse = {
                id: Date.now() + 1,
                sender: 'support',
                text: 'Thank you for your message. Our support team is reviewing your request and will respond shortly.',
                timestamp: new Date(),
                senderName: 'Support Team',
            };
            setMessages((prev) => [...prev, supportResponse]);
            setLoading(false);
        }, 1500);
    };

    const handleSendFAQ = (faq) => {
        handleSendMessage(faq.question);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <Box minH="100vh" bg="brand.background" px={6} py={10}>
            <Box maxW="900px" mx="auto" h="90vh" display="flex" flexDirection="column">

                {/* Header */}
                <VStack spacing={4} align="stretch" mb={6}>
                    <Heading fontSize="2xl" color="brand.primary">
                        Support Chat
                    </Heading>
                    <HStack
                        bg="white"
                        p={4}
                        borderRadius="xl"
                        boxShadow="sm"
                        justify="space-between"
                    >
                        <HStack spacing={3}>
                            <Box
                                w={3}
                                h={3}
                                borderRadius="full"
                                bg="green.400"
                                animation="pulse 2s infinite"
                            />
                            <VStack spacing={0} align="start">
                                <Text fontWeight="600" color="brand.primary">
                                    Support Team Online
                                </Text>
                                <Text fontSize="xs" color="brand.gray.600">
                                    Typically responds in 2 hours
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack spacing={2}>
                            <Tooltip label="Call Support">
                                <IconButton
                                    icon={<Phone size={18} />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="teal"
                                />
                            </Tooltip>
                            <Tooltip label="Schedule Callback">
                                <IconButton
                                    icon={<Clock size={18} />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="teal"
                                />
                            </Tooltip>
                        </HStack>
                    </HStack>
                </VStack>

                {/* Chat Container */}
                <Flex flex={1} bg="white" borderRadius="xl" boxShadow="md" overflow="hidden" flexDirection="column">

                    {/* Messages Area */}
                    <Box
                        ref={scrollRef}
                        flex={1}
                        overflowY="auto"
                        p={6}
                        display="flex"
                        flexDirection="column"
                        gap={4}
                        css={{
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#00695C',
                                borderRadius: '10px',
                            },
                        }}
                    >
                        {messages.map((message) => (
                            <Flex
                                key={message.id}
                                justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                                mb={2}
                            >
                                <HStack
                                    align="flex-end"
                                    spacing={2}
                                    maxW="70%"
                                    flexDirection={message.sender === 'user' ? 'row-reverse' : 'row'}
                                >
                                    <Avatar
                                        size="sm"
                                        name={message.senderName}
                                        bg={message.sender === 'user' ? 'brand.primary' : 'gray.400'}
                                    />
                                    <VStack align={message.sender === 'user' ? 'flex-end' : 'flex-start'} spacing={1}>
                                        <Box
                                            bg={message.sender === 'user' ? 'brand.primary' : 'gray.100'}
                                            color={message.sender === 'user' ? 'white' : 'black'}
                                            px={4}
                                            py={3}
                                            borderRadius="lg"
                                            wordBreak="break-word"
                                        >
                                            <Text fontSize="sm">{message.text}</Text>
                                        </Box>
                                        <Text fontSize="xs" color="brand.gray.600">
                                            {formatTime(message.timestamp)}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Flex>
                        ))}
                        {loading && (
                            <Flex justify="flex-start">
                                <HStack spacing={2} opacity={0.7}>
                                    <Avatar size="sm" name="Support" bg="gray.400" />
                                    <Box bg="gray.100" px={4} py={3} borderRadius="lg">
                                        <HStack spacing={1}>
                                            <Box w={2} h={2} borderRadius="full" bg="gray.400" animation="bounce 1s infinite" />
                                            <Box w={2} h={2} borderRadius="full" bg="gray.400" animation="bounce 1s 0.2s infinite" />
                                            <Box w={2} h={2} borderRadius="full" bg="gray.400" animation="bounce 1s 0.4s infinite" />
                                        </HStack>
                                    </Box>
                                </HStack>
                            </Flex>
                        )}
                    </Box>

                    <Divider />

                    {/* FAQ Section */}
                    {showFAQ && (
                        <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                            <Flex justify="space-between" align="center" mb={3}>
                                <HStack spacing={2}>
                                    <HelpCircle size={18} color="#00695C" />
                                    <Text fontWeight="600" fontSize="sm" color="brand.primary">
                                        Frequently Asked Questions
                                    </Text>
                                </HStack>
                                <IconButton
                                    icon={<ChevronDown size={18} />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowFAQ(false)}
                                />
                            </Flex>
                            <HStack spacing={2} overflowX="auto" pb={2}>
                                {faqs.map((faq) => (
                                    <Button
                                        key={faq.id}
                                        size="sm"
                                        variant="outline"
                                        whiteSpace="nowrap"
                                        flexShrink={0}
                                        onClick={() => handleSendFAQ(faq)}
                                        borderColor="brand.primary"
                                        color="brand.primary"
                                        _hover={{ bg: 'brand.primary', color: 'white' }}
                                    >
                                        {faq.question.length > 25
                                            ? faq.question.substring(0, 25) + '...'
                                            : faq.question}
                                    </Button>
                                ))}
                            </HStack>
                        </Box>
                    )}

                    {/* Input Area */}
                    <HStack spacing={2} p={4} bg="white">
                        <Input
                            placeholder="Type your message here..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(inputValue);
                                }
                            }}
                            bg="gray.50"
                            borderColor="brand.gray.300"
                            _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            isDisabled={loading}
                        />
                        <Button
                            colorScheme="teal"
                            onClick={() => handleSendMessage(inputValue)}
                            isLoading={loading}
                            leftIcon={<Send size={18} />}
                        >
                            Send
                        </Button>
                    </HStack>

                </Flex>

                {/* Footer Info */}
                <Box mt={4} textAlign="center">
                    <Text fontSize="xs" color="brand.gray.600">
                        💬 Chat is monitored 24/7 • 📧 Email: support@lazyhomes.com • 📞 Call: +234 123 456 7890
                    </Text>
                </Box>

            </Box>
            <Navbar active="support" />
        </Box>
    );
}
