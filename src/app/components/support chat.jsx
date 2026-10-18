import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Heading,
    Flex,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
    Spinner,
} from '@chakra-ui/react';
import {
    Send,
    Phone,
    Clock,
    HelpCircle,
    ChevronDown,
} from 'lucide-react';
import Navbar from './Navbar';
import {
    getSupportSocket,
    registerSupportSocket,
    joinSupportConversation,
    onUserTyping,
    onUserStopTyping,
    emitTyping,
    startSupportConversation,
    sendSupportMessageAPI,
    getSupportMessagesAPI,
    markSupportAsRead,
} from '../../../api';

export default function SupportChat({ user }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showFAQ, setShowFAQ] = useState(true);
    const [conversationId, setConversationId] = useState(null);
    const [supportTyping, setSupportTyping] = useState(false);
    const scrollRef = useRef(null);
    const typingRef = useRef(null);
    const [conversationStatus, setConversationStatus] = useState("open");
    const conversationIdRef = useRef(null);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?._id || user?.id || storedUser?._id || storedUser?.id;

    const faqs = [
        { id: 1, question: 'How do I list a property?' },
        { id: 2, question: 'What is the verification process?' },
        { id: 3, question: 'How long does payment take?' },
        { id: 4, question: 'How do I contact support?' },
        { id: 5, question: 'What are the fees?' },
        { id: 6, question: 'Can I cancel my booking?' },
    ];

    const playIncomingMessageSound = () => {
        try {
            const AudioCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtor) return;

            const audioContext = new AudioCtor();
            const notes = [880, 1174];
            const gainNode = audioContext.createGain();

            gainNode.gain.value = 0.08;
            gainNode.connect(audioContext.destination);

            notes.forEach((frequency, index) => {
                const oscillator = audioContext.createOscillator();
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = frequency;
                oscillator.connect(gainNode);
                oscillator.start(audioContext.currentTime + index * 0.12);
                oscillator.stop(audioContext.currentTime + index * 0.12 + 0.15);
            });

            setTimeout(() => audioContext.close(), 500);
        } catch (error) {
            console.warn('Unable to play support notification sound:', error);
        }
    };

    const mapMessage = useCallback((m) => ({
        id: m?._id || m?.id || Date.now(),
        _id: m?._id || m?.id || Date.now(),
        sender: m?.senderRole === 'user' ? 'user' : 'support',
        text: m?.message || '',
        timestamp: new Date(m?.createdAt || Date.now()),
        senderName: m?.senderRole === 'user' ? 'You' : 'Support Team',
    }), []);

    const initConversation = useCallback(async () => {
        if (!userId) return null;

        try {
            setLoading(true);
            const { data } = await startSupportConversation({ subject: 'General Support' });
            const payload = data?.data ?? data ?? {};
            const convo = payload.conversation ?? payload;
            const actualConversation = convo?.conversation ?? convo;
            const nextConversationId = actualConversation?._id || convo?._id;
            const initialMsgs = payload.messages ?? actualConversation?.messages ?? [];

            if (!nextConversationId) return null;

            // SAVE STATUS
            setConversationStatus(actualConversation?.status || "open");

            setConversationId(nextConversationId);
            conversationIdRef.current = nextConversationId;

            if (Array.isArray(initialMsgs) && initialMsgs.length > 0) {
                setMessages(initialMsgs.map((msg) => mapMessage(msg)));
            } else {
                const res = await getSupportMessagesAPI(nextConversationId);
                const msgs = res?.data?.data ?? res?.data?.messages ?? [];
                setMessages(Array.isArray(msgs) ? msgs.map((msg) => mapMessage(msg)) : []);
            }

            const socket = registerSupportSocket(userId);
            const doJoin = () => joinSupportConversation(nextConversationId);
            if (socket?.connected) doJoin();
            else socket?.once?.('connect', doJoin);

            await markSupportAsRead(nextConversationId);
            return nextConversationId;
        } catch (err) {
            console.error('init failed', err.response?.data || err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [mapMessage, userId]);

    useEffect(() => {
        initConversation();
    }, [initConversation]);

    useEffect(() => {
        const socket = getSupportSocket();

        const handleNewMessage = (msg) => {
            const currentId = conversationIdRef.current;
            const msgConvoId = msg?.conversationId || msg?.conversation?._id || msg?.conversation;
            if (currentId && msgConvoId && String(msgConvoId) !== String(currentId)) return;

            setMessages((prev) => {
                if (prev.some((item) => String(item._id) === String(msg?._id || msg?.id))) return prev;
                return [...prev, mapMessage(msg)];
            });

            if (msg?.senderRole !== 'user') {
                playIncomingMessageSound();
            }

            if (msg?.senderRole !== 'user' && currentId) {
                markSupportAsRead(currentId);
            }

            if (msg?.status) {
                setConversationStatus(msg.status);
            }
        };

        const handleStatusUpdate = (payload) => {
            const nextConversationId = payload?.conversationId || payload?.conversation?._id || payload?._id;
            const currentId = conversationIdRef.current;
            if (currentId && nextConversationId && String(nextConversationId) !== String(currentId)) return;

            const nextStatus = payload?.status || payload?.newStatus || payload?.state;
            if (nextStatus) {
                setConversationStatus(nextStatus);
            }
        };

        const onTyping = () => setSupportTyping(true);
        const onStop = () => setSupportTyping(false);

        const statusEvents = ['supportStatusUpdated', 'conversationStatusUpdated', 'statusUpdated', 'supportConversationStatus'];

        socket.off('newSupportMessage', handleNewMessage);
        socket.on('newSupportMessage', handleNewMessage);

        statusEvents.forEach((eventName) => {
            socket.off(eventName, handleStatusUpdate);
            socket.on(eventName, handleStatusUpdate);
        });

        socket.off('userTyping', onTyping);
        socket.on('userTyping', onTyping);
        socket.off('userStopTyping', onStop);
        socket.on('userStopTyping', onStop);

        return () => {
            socket.off('newSupportMessage', handleNewMessage);
            statusEvents.forEach((eventName) => socket.off(eventName, handleStatusUpdate));
            socket.off('userTyping', onTyping);
            socket.off('userStopTyping', onStop);
        };
    }, [mapMessage]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, supportTyping]);

    const handleSendMessage = async (text) => {
        const cleanedText = String(text || '').trim();
        if (!cleanedText) return;

        let activeId = conversationId || conversationIdRef.current;
        if (!activeId) activeId = await initConversation();
        if (!activeId) return;

        const tempId = Date.now();
        // setMessages((prev) => [...prev, {
        //     id: tempId,
        //     _id: tempId,
        //     sender: 'user',
        //     text: cleanedText,
        //     timestamp: new Date(),
        //     senderName: 'You',
        //     pending: true,
        // }]);
        setInputValue('');
        setSending(true);
        emitTyping(activeId, false);

        try {
            const { data } = await sendSupportMessageAPI({ conversationId: activeId, message: cleanedText });
            const payload = data?.data ?? data ?? {};
            setMessages((prev) => prev.map((m) => (m.id === tempId ? mapMessage(payload) : m)));
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            console.error('Send failed', err.response?.data || err.message);
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (!conversationIdRef.current) return;
        emitTyping(conversationIdRef.current, true);
        if (typingRef.current) clearTimeout(typingRef.current);
        typingRef.current = setTimeout(() => emitTyping(conversationIdRef.current, false), 1000);
    };

    const handleSendFAQ = (faq) => handleSendMessage(faq.question);

    const isClosed = conversationStatus === 'closed';
    const isPending = conversationStatus === 'pending';
    const isInputDisabled = isClosed || sending;

    const formatMessageDate = (date) => {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return 'Just now';

        return parsedDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    if (loading) {
        return (
            <Box minH="100vh" bg="brand.background" display="flex" alignItems="center" justifyContent="center">
                <VStack><Spinner color="teal.500" size="xl" /><Text>Loading support chat...</Text></VStack>
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg="brand.background" px={6} py={10}>
            <Box maxW="900px" mx="auto" h="90vh" display="flex" flexDirection="column">

                <VStack spacing={4} align="stretch" mb={6}>
                    <Heading fontSize="2xl" color="brand.primary">Support Chat</Heading>
                    <HStack bg="white" p={4} borderRadius="xl" boxShadow="sm" justify="space-between">
                        <HStack spacing={3}>
                            <Box w={3} h={3} borderRadius="full" bg="green.400" />
                            <VStack spacing={0} align="start">
                                <Text fontWeight="600" color="brand.primary">Support Team Online</Text>
                                <Text fontSize="xs" color="brand.gray.600">Typically responds in 2 hours</Text>
                            </VStack>
                        </HStack>
                        <HStack spacing={2}>
                            <Tooltip label="Call Support"><IconButton icon={<Phone size={18} />} size="sm" variant="ghost" colorScheme="teal" /></Tooltip>
                            <Tooltip label="Schedule Callback"><IconButton icon={<Clock size={18} />} size="sm" variant="ghost" colorScheme="teal" /></Tooltip>
                        </HStack>
                    </HStack>
                </VStack>

                <Flex flex={1} bg="white" borderRadius="xl" boxShadow="md" overflow="hidden" flexDirection="column">
                    <Box ref={scrollRef} flex={1} overflowY="auto" p={6} display="flex" flexDirection="column" gap={4}
                        css={{ '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb': { background: '#00695C', borderRadius: '10px' } }}
                    >
                        {messages.length === 0 && (
                            <Flex justify="flex-start" mb={2}>
                                <HStack align="flex-end" spacing={2} maxW="70%">
                                    <Avatar size="sm" name="Support Team" bg="gray.400" />
                                    <VStack align="flex-start" spacing={1}>
                                        <Box bg="gray.100" px={4} py={3} borderRadius="lg"><Text fontSize="sm">Hello! Welcome to SafeTenants Support. How can we help you today?</Text></Box>
                                        <Text fontSize="xs" color="brand.gray.600">{formatMessageDate(new Date())}</Text>
                                    </VStack>
                                </HStack>
                            </Flex>
                        )}

                        {messages.map((message) => (
                            <Flex key={message.id} justify={message.sender === 'user' ? 'flex-end' : 'flex-start'} mb={2}>
                                <HStack align="flex-end" spacing={2} maxW="70%" flexDirection={message.sender === 'user' ? 'row-reverse' : 'row'}>
                                    <Avatar size="sm" name={message.senderName} bg={message.sender === 'user' ? 'brand.primary' : 'gray.400'} />
                                    <VStack align={message.sender === 'user' ? 'flex-end' : 'flex-start'} spacing={1}>
                                        <Box bg={message.sender === 'user' ? 'brand.primary' : 'gray.100'} color={message.sender === 'user' ? 'white' : 'black'} px={4} py={3} borderRadius="lg" wordBreak="break-word" opacity={message.pending ? 0.6 : 1}>
                                            <Text fontSize="sm">{message.text}</Text>
                                        </Box>
                                        <Text fontSize="xs" color="brand.gray.600">{formatMessageDate(message.timestamp)}</Text>
                                    </VStack>
                                </HStack>
                            </Flex>
                        ))}

                        {supportTyping && (
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
                        
                    {!isClosed && showFAQ && (
                        <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                            <Flex justify="space-between" align="center" mb={3}>
                                <HStack spacing={2}><HelpCircle size={18} color="#00695C" /><Text fontWeight="600" fontSize="sm" color="brand.primary">Frequently Asked Questions</Text></HStack>
                                <IconButton icon={<ChevronDown size={18} />} size="sm" variant="ghost" onClick={() => setShowFAQ(false)} />
                            </Flex>
                            <HStack spacing={2} overflowX="auto" pb={2}>
                                {faqs.map((faq) => (
                                    <Button key={faq.id} size="sm" variant="outline" whiteSpace="nowrap" flexShrink={0} onClick={() => handleSendFAQ(faq)} borderColor="brand.primary" color="brand.primary" _hover={{ bg: 'brand.primary', color: 'white' }}>
                                        {faq.question.length > 25 ? faq.question.substring(0, 25) + '...' : faq.question}
                                    </Button>
                                ))}
                            </HStack>
                        </Box>
                    )}

                    {isClosed ? (
                        <Box p={4} textAlign="center" bg="gray.50">
                            <Text>This conversation is closed. Start a new chat if you need more help.</Text>
                            <Button mt={2} onClick={() => initConversation()}>New Conversation</Button>
                        </Box>
                    ) : (
                        <Box p={4} bg="white">
                            {isPending && (
                                <Box mb={3} px={3} py={2} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
                                    <Text fontSize="sm" color="yellow.700" fontWeight="600">Your issue is being handled by the support team.</Text>
                                </Box>
                            )}

                            <HStack spacing={2}>
                                <Input placeholder="Type your message here..." value={inputValue} onChange={handleInputChange}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue); } }}
                                    bg="gray.50" borderColor="brand.gray.300" _focus={{ bg: 'white', borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }} isDisabled={isInputDisabled} />
                                <Button colorScheme="teal" onClick={() => handleSendMessage(inputValue)} isLoading={sending} isDisabled={isInputDisabled} leftIcon={<Send size={18} />}>Send</Button>
                            </HStack>
                        </Box>
                    )}
                </Flex>

                <Box mt={4} textAlign="center">
                    <Text fontSize="xs" color="brand.gray.600">💬 Chat is monitored 24/7 • 📧 Email: support@SafeTenants.com • 📞 Call: +234 123 456 7890</Text>
                </Box>
            </Box>
            <Navbar active="support" />
        </Box>
    );
}