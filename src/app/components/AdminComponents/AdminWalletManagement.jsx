import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    HStack,
    Input,
    SimpleGrid,
    Spinner,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
    Badge,
    Select,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { freezeWallet, getUsersWallets, getWalletDetailsByUserId, unfreezeWallet } from '../../../../api';

const formatCurrency = (value) => {
    const numeric = Number(value || 0);
    return numeric.toLocaleString(undefined, {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 2,
    });
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
};

const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'active':
            return 'green';
        case 'frozen':
            return 'orange';
        case 'inactive':
            return 'gray';
        case 'suspended':
            return 'red';
        default:
            return 'blue';
    }
};

export default function AdminWalletManagement() {
    const [wallets, setWallets] = useState([]);
    const [stats, setStats] = useState({ totalBalance: 0, avgBalance: 0 });
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userIdInput, setUserIdInput] = useState('');
    const [singleUserWallet, setSingleUserWallet] = useState(null);
    const [singleWalletLoading, setSingleWalletLoading] = useState(false);
    const [singleWalletError, setSingleWalletError] = useState('');
    const [walletReasons, setWalletReasons] = useState({});
    const toast = useToast();

    const fetchWallets = async (page = 1, limit = 10) => {
        setLoading(true);
        setError('');

        try {
            const res = await getUsersWallets({ page, limit });
            const payload = res?.data?.data ?? res?.data ?? res ?? {};
            const walletList = Array.isArray(payload?.wallets) ? payload.wallets : [];
            const pageInfo = payload?.pagination ?? {
                total: walletList.length,
                page,
                limit,
                pages: Math.max(1, Math.ceil(walletList.length / limit)),
            };

            setWallets(walletList);
            setPagination({
                total: Number(pageInfo.total ?? walletList.length),
                page: Number(pageInfo.page ?? page),
                limit: Number(pageInfo.limit ?? limit),
                pages: Number(pageInfo.pages ?? Math.max(1, Math.ceil((pageInfo.total ?? walletList.length) / (pageInfo.limit ?? limit)))),
            });
            setStats(payload?.stats ?? {
                totalBalance: 0,
                avgBalance: 0,
            });
        } catch (err) {
            console.error('Failed to load user wallets', err);
            setError('Unable to load wallets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets(pagination.page, pagination.limit);
    }, []);

    const summaryCards = useMemo(() => [
        {
            label: 'Total Wallet Balance',
            value: formatCurrency(stats.totalBalance ?? 0),
            helper: `${wallets.length} wallets loaded`,
            accent: 'teal',
        },
        {
            label: 'Average Balance',
            value: formatCurrency(stats.avgBalance ?? 0),
            helper: 'Across all wallets',
            accent: 'blue',
        },
        {
            label: 'Wallets on File',
            value: pagination.total.toLocaleString(),
            helper: `Page ${pagination.page} of ${pagination.pages}`,
            accent: 'purple',
        },
    ], [stats, wallets.length, pagination]);

    const handleWalletAction = (action, wallet) => {
        toast({
            title: `${action} action`,
            description: `Wallet ${wallet?._id ?? 'selected'} for ${wallet?.user?.fullName ?? 'user'} was queued.`,
            status: 'info',
            duration: 2500,
            isClosable: true,
        });
    };

    const updateWalletStatus = (walletId, newStatus) => {
        setWallets((prev) => prev.map((item) => item._id === walletId ? { ...item, status: newStatus } : item));
        setSingleUserWallet((prev) => prev && prev._id === walletId ? { ...prev, status: newStatus } : prev);
    };

    const handleFreezeToggle = async (wallet) => {
        if (!wallet?._id) return;

        const isFrozen = (wallet.status || '').toLowerCase() === 'frozen';
        const action = isFrozen ? unfreezeWallet : freezeWallet;
        const reason = (walletReasons[wallet._id] ?? '').trim() || `Admin ${isFrozen ? 'unfrozen' : 'froze'} wallet`;

        try {
            await action(wallet._id, reason);
            const nextStatus = isFrozen ? 'active' : 'frozen';
            updateWalletStatus(wallet._id, nextStatus);
            setWalletReasons((prev) => ({ ...prev, [wallet._id]: '' }));
            toast({
                title: `${isFrozen ? 'Wallet unfrozen' : 'Wallet frozen'}`,
                description: `Wallet ${wallet._id} is now ${nextStatus}. Reason: ${reason}`,
                status: 'success',
                duration: 4000,
                isClosable: true,
            });
        } catch (err) {
            console.error('Failed to toggle wallet status', err);
            toast({
                title: 'Wallet update failed',
                description: err?.response?.data?.message || 'Unable to update wallet status right now.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const handleUserWalletSearch = async () => {
        const userId = userIdInput.trim();

        if (!userId) {
            setSingleWalletError('Please enter a user ID.');
            return;
        }

        setSingleWalletLoading(true);
        setSingleWalletError('');
        setSingleUserWallet(null);

        try {
            const res = await getWalletDetailsByUserId(userId);
            const payload = res?.data?.data ?? res?.data ?? res ?? {};
            const wallet = payload?.wallet ?? null;

            if (!wallet) {
                setSingleWalletError('No wallet found for this user ID.');
                return;
            }

            setSingleUserWallet(wallet);
        } catch (err) {
            console.error('Failed to fetch wallet by user ID', err);
            setSingleWalletError('Unable to load wallet for this user.');
        } finally {
            setSingleWalletLoading(false);
        }
    };

    return (
        <Box p={6} bg="brand.background" minH="100vh" pb={40}>
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                    <Box>
                        <Heading size="lg" color="teal.600">User Wallets</Heading>
                        <Text color="gray.600">All customer wallet balances and wallet statuses</Text>
                    </Box>
                    <Button colorScheme="teal" onClick={() => fetchWallets(pagination.page, pagination.limit)} isLoading={loading}>
                        Refresh
                    </Button>
                </Flex>

                {error && (
                    <Card border="1px solid" borderColor="red.200" bg="red.50">
                        <CardBody>
                            <Text color="red.600">{error}</Text>
                        </CardBody>
                    </Card>
                )}

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {summaryCards.map((card) => (
                        <Card key={card.label} borderLeft="4px solid" borderLeftColor={`${card.accent}.500`} shadow="sm">
                            <CardBody>
                                <Stat>
                                    <StatLabel>{card.label}</StatLabel>
                                    <StatNumber fontSize="2xl" mt={2}>{card.value}</StatNumber>
                                    <StatHelpText>{card.helper}</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                <Card shadow="md">
                    <CardHeader>
                        <Heading size="md">Search User Wallet</Heading>
                    </CardHeader>
                    <CardBody>
                        <Flex gap={3} wrap="wrap" align="center">
                            <Input
                                placeholder="Enter User ID"
                                value={userIdInput}
                                onChange={(e) => setUserIdInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUserWalletSearch();
                                }}
                                maxW="420px"
                            />
                            <Button colorScheme="teal" onClick={handleUserWalletSearch} isLoading={singleWalletLoading}>
                                Search
                            </Button>
                        </Flex>

                        {singleWalletError && (
                            <Text color="red.500" mt={3}>{singleWalletError}</Text>
                        )}

                        {!singleWalletLoading && singleUserWallet && (
                            <Box mt={5} border="1px solid" borderColor="gray.200" borderRadius="lg" p={4} bg="gray.50">
                                <Flex justify="space-between" align="center" gap={4} flexWrap="wrap" mb={4}>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500">Wallet ID</Text>
                                        <Heading size="sm">{singleUserWallet._id}</Heading>
                                    </Box>
                                    <Badge colorScheme={getStatusColor(singleUserWallet.status)} fontSize="sm">
                                        {singleUserWallet.status || 'active'}
                                    </Badge>
                                </Flex>

                                <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500">User</Text>
                                        <Text fontWeight="semibold">{singleUserWallet.user?.fullName || '—'}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500">Email</Text>
                                        <Text>{singleUserWallet.user?.email || '—'}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500">Phone</Text>
                                        <Text>{singleUserWallet.user?.phone || '—'}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500">Balance</Text>
                                        <Text fontWeight="bold">{formatCurrency(singleUserWallet.balance ?? 0)}</Text>
                                    </Box>
                                </SimpleGrid>

                                <VStack align="stretch" mt={4} spacing={3}>
                                    <Textarea
                                        placeholder="Add reason for freezing or unfreezing this wallet"
                                        value={walletReasons[singleUserWallet._id] ?? ''}
                                        onChange={(e) => setWalletReasons((prev) => ({ ...prev, [singleUserWallet._id]: e.target.value }))}
                                        size="sm"
                                        resize="vertical"
                                    />

                                    <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                                        <Text fontSize="sm" color="gray.600">
                                            Last transaction: {formatDate(singleUserWallet.lastTransactionAt)}
                                        </Text>
                                        <HStack>
                                            <Button
                                                as={Link}
                                                to={`/view-user-wallet?walletId=${singleUserWallet?._id || ''}`}
                                                size="sm"
                                                colorScheme="blue"
                                                variant="outline"
                                                isDisabled={!singleUserWallet?._id}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme={(singleUserWallet.status || '').toLowerCase() === 'frozen' ? 'green' : 'orange'}
                                                variant="outline"
                                                onClick={() => handleFreezeToggle(singleUserWallet)}
                                            >
                                                {(singleUserWallet.status || '').toLowerCase() === 'frozen' ? 'Unfreeze' : 'Freeze'}
                                            </Button>
                                            <Button size="sm" colorScheme="green">
                                                Top Up
                                            </Button>
                                        </HStack>
                                    </Flex>
                                </VStack>
                            </Box>
                        )}
                    </CardBody>
                </Card>

                <Card shadow="md">
                    <CardHeader pb={2}>
                        <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                            <Heading size="md">Wallet List</Heading>
                            <HStack>
                                <Text fontSize="sm" color="gray.600">Rows:</Text>
                                <Select
                                    size="sm"
                                    w="90px"
                                    value={pagination.limit}
                                    onChange={(e) => {
                                        const nextLimit = Number(e.target.value);
                                        setPagination((prev) => ({ ...prev, limit: nextLimit }));
                                        fetchWallets(1, nextLimit);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </Select>
                            </HStack>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        {loading ? (
                            <Flex justify="center" p={10}><Spinner /></Flex>
                        ) : wallets.length === 0 ? (
                            <Text color="gray.500">No wallets found.</Text>
                        ) : (
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Wallet</Th>
                                            <Th>User</Th>
                                            <Th>Balance</Th>
                                            <Th>Status</Th>
                                            <Th>Last Transaction</Th>
                                            <Th>Created</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {wallets.map((wallet) => {
                                            const user = wallet.user || {};
                                            return (
                                                <Tr key={wallet._id}>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="bold">{wallet._id}</Text>
                                                            <Text fontSize="xs" color="gray.500">{wallet.currency || 'NGN'}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="semibold">{user.fullName || 'Unknown User'}</Text>
                                                            <Text fontSize="xs" color="gray.500">{user.email || 'No email'}</Text>
                                                            <Text fontSize="xs" color="gray.500">{user.phone || 'No phone'}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Text fontWeight="bold">{formatCurrency(wallet.balance ?? 0)}</Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={getStatusColor(wallet.status)}>{wallet.status || 'active'}</Badge>
                                                    </Td>
                                                    <Td>{formatDate(wallet.lastTransactionAt)}</Td>
                                                    <Td>{formatDate(wallet.createdAt)}</Td>
                                                    <Td>
                                                        <VStack align="stretch" spacing={2}>
                                                            <HStack spacing={2}>
                                                                <Button
                                                                    as={Link}
                                                                    to={`/view-user-wallet?walletId=${wallet._id}`}
                                                                    size="sm"
                                                                    leftIcon={<Eye size={14} />}
                                                                    colorScheme="blue"
                                                                    variant="outline"
                                                                    onClick={() => handleWalletAction('View', wallet)}
                                                                >
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme={(wallet.status || '').toLowerCase() === 'frozen' ? 'green' : 'orange'}
                                                                    variant="outline"
                                                                    onClick={() => handleFreezeToggle(wallet)}
                                                                >
                                                                    {(wallet.status || '').toLowerCase() === 'frozen' ? 'Unfreeze' : 'Freeze'}
                                                                </Button>
                                                            </HStack>
                                                            <Input
                                                                size="sm"
                                                                placeholder="Reason"
                                                                value={walletReasons[wallet._id] ?? ''}
                                                                onChange={(e) => setWalletReasons((prev) => ({ ...prev, [wallet._id]: e.target.value }))}
                                                            />
                                                            <Button size="sm" colorScheme="green" variant="solid" onClick={() => handleWalletAction('Top up', wallet)}>
                                                                Top Up
                                                            </Button>
                                                        </VStack>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )}

                        <Flex mt={4} justify="space-between" align="center" gap={3} flexWrap="wrap">
                            <Text fontSize="sm" color="gray.600">
                                Showing {wallets.length} of {pagination.total} wallets
                            </Text>
                            <HStack>
                                <Button
                                    size="sm"
                                    onClick={() => fetchWallets(Math.max(1, pagination.page - 1), pagination.limit)}
                                    isDisabled={pagination.page <= 1 || loading}
                                >
                                    Prev
                                </Button>
                                <Text fontSize="sm" color="gray.600">Page {pagination.page} / {pagination.pages}</Text>
                                <Button
                                    size="sm"
                                    onClick={() => fetchWallets(Math.min(pagination.pages, pagination.page + 1), pagination.limit)}
                                    isDisabled={pagination.page >= pagination.pages || loading}
                                >
                                    Next
                                </Button>
                            </HStack>
                        </Flex>
                    </CardBody>
                </Card>
            </VStack>

            <AdminNavbar active="Wallet Management" />
        </Box>
    );
}
