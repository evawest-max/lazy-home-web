import { useState, useEffect, useRef } from 'react';
import {
    Box, VStack, HStack, Input, Button, Text, Heading, Flex, Badge, Avatar, Divider, Spinner
} from '@chakra-ui/react';
import { Send, Search } from 'lucide-react';
import {
    getAllSupportConversations,
    replyToSupportConversationAPI,
    getSupportMessagesAPI,
    registerSupportSocket,
    joinSupportConversation,
    onNewSupportMessage,
    getSupportSocket,
} from '../../../../api';
import AdminChatHeader from './AdminChatHeader';

const getDisplayName = (user) => user?.fullName || user?.name || 'Unknown user';
const getDisplayEmail = (user) => user?.email || 'No email available';
const getSafeDateText = (value) => {
    if (!value) return 'No recent activity';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'No recent activity' : date.toLocaleString();
};
const formatMessageDate = (value) => {
    if (!value) return 'just now';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'just now';

    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const playIncomingMessageSound = () => {
    try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return;

        const audioContext = new AudioCtor();
        const notes = [740, 980, 1160];
        const gainNode = audioContext.createGain();

        gainNode.gain.value = 0.09;
        gainNode.connect(audioContext.destination);

        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = frequency;
            oscillator.connect(gainNode);
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + index * 0.1 + 0.14);
        });

        setTimeout(() => audioContext.close(), 500);
    } catch (error) {
        console.warn('Unable to play admin notification sound:', error);
    }
};

export default function AdminSupportChat({user}) {
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const scrollRef = useRef(null);
    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;

    useEffect(() => {
        if (!userId) {
            setLoadingList(false);
            return;
        }

        fetchList(page);
        registerSupportSocket(userId);

        const unsub = onNewSupportMessage((msg) => {
            const msgConvoId = msg?.conversationId || msg?.conversation?._id || msg?.conversation;
            if (msg?.senderRole !== 'support') {
                playIncomingMessageSound();
            }

            if (selected && msgConvoId === selected._id) {
                setMessages((prev) => {
                    if (prev.some((item) => item?._id === msg?._id)) return prev;
                    return [...prev, msg];
                });
            }

            setConversations((prev) =>
                prev.map((item) =>
                    item._id === msgConvoId
                        ? {
                            ...item,
                            lastMessage: msg?.message || item.lastMessage || 'New message',
                            lastMessageAt: msg?.createdAt || item.lastMessageAt,
                            unreadBySupport: item._id === selected?._id ? 0 : item.unreadBySupport || 0,
                        }
                        : item
                )
            );

            fetchList();
        });

        return () => unsub();
    }, [userId, selected?._id]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSearch = () => {
        if (!userId) return;
        setPage(1);
        fetchList(1, search.trim());
    };

    const fetchList = async (nextPage = page, nextSearch = search.trim()) => {
        try {
            setLoadingList(true);
            const params = {
                status: 'all',
                page: Number(nextPage) || 1,
                limit: 20,
                search: nextSearch,
            };

            const { data } = await getAllSupportConversations(params);
            const payload = data?.data ?? data ?? {};
            const list = payload.conversations || payload.results || [];
            const pagination = payload.pagination || payload.meta || {};

            setConversations(Array.isArray(list) ? list : []);
            setTotalPages(Number(pagination.totalPages || pagination.pages || 1) || 1);
            setPage(Number(params.page || 1));
        } catch (e) {
            console.error(e);
            setConversations([]);
            setTotalPages(1);
        } finally {
            setLoadingList(false);
        }
    };

    const openConvo = async (convo) => {
        if (!convo?._id) return;
        console.log("Opening conversation:", convo);

        setSelected(convo);
        setLoadingMsgs(true);
        joinSupportConversation(convo._id);

        try {
            const messagesResponse = typeof getSupportMessagesAPI === 'function'
                ? await getSupportMessagesAPI(convo._id)
                : { data: { data: [] } };
            console.log("Fetched messages for conversation:", messagesResponse);
            const list = messagesResponse?.data?.data || messagesResponse?.data?.messages || [];
            setMessages(Array.isArray(list) ? list : []);
            setConversations((prev) =>
                prev.map((item) => (item._id === convo._id ? { ...item, unreadBySupport: 0 } : item))
            );
        } catch (e) {
            console.error(e);
            setMessages([]);
        } finally {
            setLoadingMsgs(false);
        }
    };

    const handleReply = async () => {
        const trimmed = input.trim();
        if (!trimmed || !selected?._id) return;

        try {
            const { data } = await replyToSupportConversationAPI({
                conversationId: selected._id,
                message: trimmed,
            });

            const newMessage = data?.data || data?.message || null;
            if (newMessage) {
                setMessages((prev) => [...prev, newMessage]);
            }
            setInput('');
            fetchList();
        } catch (e) {
            console.error(e);
        }
    };

    const activeContact = selected?.user || selected?.customer || {};
    const activeName = getDisplayName(activeContact);
    const activeEmail = getDisplayEmail(activeContact);

    const getStatusColor = (status) => {
        switch ((status || 'open').toLowerCase()) {
            case 'pending': return 'yellow';
            case 'closed': return 'gray';
            default: return 'green';
        }
    };

    useEffect(() => {
        const socket = getSupportSocket();
        const statusEvents = ['supportStatusUpdated', 'conversationStatusUpdated', 'statusUpdated', 'supportConversationStatus'];

        const handleStatusUpdate = (payload) => {
            const nextConversationId = payload?.conversationId || payload?.conversation?._id || payload?._id;
            const nextStatus = payload?.status || payload?.newStatus || payload?.state;

            if (!nextConversationId || !nextStatus) return;

            setConversations((prev) =>
                prev.map((item) =>
                    String(item._id) === String(nextConversationId)
                        ? { ...item, status: nextStatus }
                        : item
                )
            );

            setSelected((prev) =>
                prev && String(prev._id) === String(nextConversationId)
                    ? { ...prev, status: nextStatus }
                    : prev
            );
        };

        statusEvents.forEach((eventName) => {
            socket.off(eventName, handleStatusUpdate);
            socket.on(eventName, handleStatusUpdate);
        });

        return () => {
            statusEvents.forEach((eventName) => socket.off(eventName, handleStatusUpdate));
        };
    }, []);

    return (
        <Flex h="100vh" bg="gray.50">
            <Box w="380px" bg="white" borderRight="1px solid" borderColor="gray.200" display="flex" flexDirection="column">
                <VStack p={4} align="stretch" spacing={3}>
                    <Heading size="md">Support Inbox</Heading>
                    <HStack bg="gray.100" px={3} borderRadius="lg">
                        <Input
                            variant="unstyled"
                            placeholder="Search user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Search conversations"
                            onClick={handleSearch}
                            isLoading={loadingList}
                            p={1}
                        >
                            <Search size={16} />
                        </Button>
                    </HStack>
                </VStack>
                <Divider />
                <Box flex={1} overflowY="auto">
                    {loadingList ? (
                        <Flex justify="center" mt={10}><Spinner /></Flex>
                    ) : (
                        conversations.map((convo) => {
                            const convoUser = convo?.user || convo?.customer || {};
                            const lastMessageText = convo?.lastMessage || 'No messages yet';

                            return (
                                <HStack
                                    key={convo?._id || Math.random()}
                                    p={4}
                                    bg={selected?._id === convo?._id ? 'teal.50' : 'white'}
                                    borderLeft={selected?._id === convo?._id ? '4px solid' : '4px solid transparent'}
                                    borderLeftColor="teal.500"
                                    _hover={{ bg: 'gray.50' }}
                                    cursor="pointer"
                                    onClick={() => openConvo(convo)}
                                    justify="space-between"
                                    align="start"
                                >
                                    <HStack align="start" spacing={3} flex={1}>
                                        <Avatar size="sm" name={getDisplayName(convoUser)} />
                                        <VStack align="start" spacing={0} flex={1} overflow="hidden">
                                            <Text fontSize="sm" fontWeight="600" noOfLines={1}>{getDisplayName(convoUser)}</Text>
                                            <Text fontSize="xs" color="gray.500" noOfLines={1}>{getDisplayEmail(convoUser)}</Text>
                                            <Text fontSize="sm" color="gray.700" noOfLines={1} mt={1}>{lastMessageText}</Text>
                                            <Text fontSize="xs" color="gray.400">{getSafeDateText(convo?.lastMessageAt)}</Text>
                                        </VStack>
                                    </HStack>
                                    <VStack spacing={1} align="flex-end">
                                        <Badge colorScheme={getStatusColor(convo?.status)} borderRadius="full">
                                            {(convo?.status || 'open').toLowerCase()}
                                        </Badge>
                                        {(convo?.unreadBySupport || 0) > 0 && (
                                            <Badge colorScheme="red" borderRadius="full">{convo.unreadBySupport}</Badge>
                                        )}
                                    </VStack>
                                </HStack>
                            );
                        })
                    )}
                </Box>

                <HStack justify="space-between" p={3} borderTop="1px solid" borderColor="gray.200" bg="white">
                    <Button
                        size="sm"
                        variant="outline"
                        isDisabled={page <= 1 || loadingList}
                        onClick={() => {
                            const nextPage = Math.max(1, page - 1);
                            setPage(nextPage);
                            fetchList(nextPage);
                        }}
                    >
                        Previous
                    </Button>
                    <Text fontSize="sm" color="gray.600">
                        Page {page} of {totalPages}
                    </Text>
                    <Button
                        size="sm"
                        variant="outline"
                        isDisabled={page >= totalPages || loadingList}
                        onClick={() => {
                            const nextPage = Math.min(totalPages, page + 1);
                            setPage(nextPage);
                            fetchList(nextPage);
                        }}
                    >
                        Next
                    </Button>
                </HStack>
            </Box>

            <Flex flex={1} flexDirection="column" bg="white">
                {!selected ? (
                    <Flex flex={1} align="center" justify="center" color="gray.400">Select a conversation</Flex>
                ) : (
                    <>
                        <HStack p={4} borderBottom="1px solid" borderColor="gray.200" justify="space-between">
                            <HStack>
                                <Avatar size="sm" name={activeName} />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="600">{activeName}</Text>
                                    <Text fontSize="xs" color="gray.500">{activeEmail}</Text>
                                </VStack>
                            </HStack>
                            <AdminChatHeader conversation={selected} onStatusChange={(newStatus) => {
                                setSelected((prev) => ({ ...prev, status: newStatus }));
                                setConversations((prev) => prev.map((c) => c._id === selected._id ? { ...c, status: newStatus } : c));
                            }} />
                            {/* <Badge colorScheme={selected?.status === 'open' ? 'green' : 'gray'}>{selected?.status || 'Open'}</Badge> */}
                        </HStack>

                        <Box ref={scrollRef} flex={1} overflowY="auto" p={6} bg="gray.50" display="flex" flexDirection="column" gap={3}>
                            {loadingMsgs ? (
                                <Flex justify="center"><Spinner /></Flex>
                            ) : (
                                messages.map((m) => (
                                    <Flex key={m?._id || Math.random()} justify={m?.senderRole === 'support' ? 'flex-end' : 'flex-start'}>
                                        <Box
                                            maxW="65%"
                                            bg={m?.senderRole === 'support' ? 'teal.500' : 'white'}
                                            color={m?.senderRole === 'support' ? 'white' : 'black'}
                                            px={4}
                                            py={2}
                                            borderRadius="xl"
                                            boxShadow="sm"
                                        >
                                            <Text fontSize="sm">{m?.message || 'Empty message'}</Text>
                                            <Text fontSize="xs" mt={1} opacity={0.7}>
                                                {formatMessageDate(m?.createdAt)}
                                            </Text>
                                        </Box>
                                    </Flex>
                                ))
                            )}
                        </Box>

                        <HStack p={4} borderTop="1px solid" borderColor="gray.200" bg="white">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Reply to ${activeName}...`}
                                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                            />
                            <Button colorScheme="teal" leftIcon={<Send size={16} />} onClick={handleReply}>Send</Button>
                        </HStack>
                    </>
                )}
            </Flex>
        </Flex>
    );
}