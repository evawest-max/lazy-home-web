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
    Divider,
    Stack,
    Select,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { freezeWallet, getWalletDetailsByWalletIdUserIdOrEmail, unfreezeWallet } from '../../../../api';
import AdminNavbar from './AdminNavbar';

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
        case 'completed':
        case 'success':
        case 'paid':
            return 'green';
        case 'pending':
            return 'yellow';
        case 'frozen':
        case 'failed':
            return 'red';
        case 'inactive':
            return 'gray';
        default:
            return 'blue';
    }
};

export default function AdminViewSingleUserWallet() {
    const location = useLocation();
    const navigate = useNavigate();
    const walletId = new URLSearchParams(location.search).get('walletId');

    const [walletData, setWalletData] = useState({ wallet: null, transactions: [], txStats: {}, txPagination: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [togglingWallet, setTogglingWallet] = useState(false);
    const [freezeReason, setFreezeReason] = useState('');
    const [txPage, setTxPage] = useState(1);
    const [txLimit, setTxLimit] = useState(10);

    const updateWalletStatus = (nextStatus) => {
        setWalletData((prev) => ({
            ...prev,
            wallet: prev.wallet ? { ...prev.wallet, status: nextStatus } : prev.wallet,
        }));
    };

    const handleFreezeToggle = async () => {
        if (!walletId || !walletData.wallet) return;

        const isFrozen = (walletData.wallet.status || '').toLowerCase() === 'frozen';
        const action = isFrozen ? unfreezeWallet : freezeWallet;
        const reason = freezeReason.trim() || `Admin ${isFrozen ? 'unfrozen' : 'froze'} wallet`;

        setTogglingWallet(true);
        try {
            await action(walletId, reason);
            const nextStatus = isFrozen ? 'active' : 'frozen';
            updateWalletStatus(nextStatus);
            setFreezeReason('');
        } catch (err) {
            console.error('Failed to update wallet status', err);
            setError(err?.response?.data?.message || 'Unable to update wallet status.');
        } finally {
            setTogglingWallet(false);
        }
    };
    

    const fetchWalletDetails = async (page, limit) => {
        setLoading(true);
        try {
            // backend expects txPage / txLimit
            const res = await getWalletDetailsByWalletIdUserIdOrEmail(walletId, {
                txPage: page,
                txLimit: limit,
            });
            const payload = res?.data?.data ?? res?.data ?? {};

            setWalletData({
                wallet: payload.wallet,
                transactions: payload.transactions || [],
                txStats: payload.txStats || {},
                txPagination: payload.txPagination || {},
            });
        } finally {
            setLoading(false);
        }
    };

    // initial + wallet change only
    useEffect(() => {
        if (walletId) fetchWalletDetails(1, txLimit);
    }, [walletId]);

    // ROWS CHANGE
    const handleChangeRows = (newLimit) => {
        const limitNum = Number(newLimit);
        setTxLimit(limitNum);
        setTxPage(1); // always go back to page 1
        fetchWalletDetails(1, limitNum); // fetch new set
    };

    // PREV / NEXT
    const handlePrev = () => {
        if (txPage <= 1) return;
        const prev = txPage - 1;
        setTxPage(prev);
        fetchWalletDetails(prev, txLimit);
    };

    const handleNext = () => {
        if (txPage >= totalTxPages) return;
        const next = txPage + 1;
        setTxPage(next);
        fetchWalletDetails(next, txLimit);
    };



    const summaryCards = useMemo(() => {
        const stats = walletData.txStats ?? {};
        return [
            {
                label: 'Current Balance',
                value: formatCurrency((walletData.wallet?.balance ?? 0) / 100),
                helper: `${walletData.wallet?.currency || 'NGN'} wallet balance`,
                accent: 'teal',
            },
            {
                label: 'Total Credits',
                value: formatCurrency((stats.totalCredits ?? 0) / 100),
                helper: 'All successful inflows',
                accent: 'green',
            },
            {
                label: 'Total Debits',
                value: formatCurrency((stats.totalDebits ?? 0) / 100),
                helper: 'All outbound movements',
                accent: 'orange',
            },
            {
                label: 'Total Transactions',
                value: Number(stats.totalTransactions ?? walletData.transactions.length ?? 0).toLocaleString(),
                helper: `Page ${walletData.txPagination?.page ?? 1} of ${walletData.txPagination?.pages ?? 1}`,
                accent: 'purple',
            },
        ];
    }, [walletData]);

    const totalTxPages = Math.max(1, Number(walletData.txPagination?.pages ?? 1));
    const totalTxCount = Number(walletData.txPagination?.total ?? walletData.transactions.length ?? 0);

    const user = walletData.wallet?.user ?? {};

    return (
        <Box p={6} bg="brand.background" minH="100vh" pb={40}>
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                    <HStack>
                        <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate('/wallet-management')}>
                            Back
                        </Button>
                        <Box>
                            <Heading size="lg" color="teal.600">Wallet Overview</Heading>
                            <Text color="gray.600">Wallet ID: {walletData.wallet?._id || walletId || '—'}</Text>
                        </Box>
                    </HStack>
                    <VStack align="end" spacing={2}>
                        <Input
                            placeholder="Reason for wallet action"
                            value={freezeReason}
                            onChange={(e) => setFreezeReason(e.target.value)}
                            size="sm"
                            maxW="280px"
                        />
                        <HStack>
                            <Button
                                colorScheme={(walletData.wallet?.status || '').toLowerCase() === 'frozen' ? 'green' : 'orange'}
                                variant="outline"
                                onClick={handleFreezeToggle}
                                isLoading={togglingWallet}
                                isDisabled={!walletData.wallet || togglingWallet}
                            >
                                {(walletData.wallet?.status || '').toLowerCase() === 'frozen' ? 'Unfreeze Wallet' : 'Freeze Wallet'}
                            </Button>
                            <Button colorScheme="green">Top Up Wallet</Button>
                            <Button colorScheme="red" bg="red.500" _hover={{ bg: "red.600" }}>Debit Wallet</Button>
                        </HStack>
                    </VStack>
                </Flex>

                {error && (
                    <Card border="1px solid" borderColor="red.200" bg="red.50">
                        <CardBody>
                            <Text color="red.600">{error}</Text>
                        </CardBody>
                    </Card>
                )}

                {loading ? (
                    <Flex justify="center" py={20}><Spinner /></Flex>
                ) : (
                    <>
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
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

                        <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={4}>
                            <Card shadow="md">
                                <CardHeader>
                                    <Heading size="md">Wallet Details</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack align="stretch" spacing={3}>
                                        <Flex justify="space-between"><Text color="gray.500">Status</Text><Badge colorScheme={getStatusColor(walletData.wallet?.status)}>{walletData.wallet?.status || 'active'}</Badge></Flex>
                                        <Flex justify="space-between"><Text color="gray.500">Currency</Text><Text fontWeight="semibold">{walletData.wallet?.currency || 'NGN'}</Text></Flex>
                                        <Flex justify="space-between"><Text color="gray.500">Last Transaction</Text><Text>{formatDate(walletData.wallet?.lastTransactionAt)}</Text></Flex>
                                        <Flex justify="space-between"><Text color="gray.500">Created</Text><Text>{formatDate(walletData.wallet?.createdAt)}</Text></Flex>
                                        <Flex justify="space-between"><Text color="gray.500">Updated</Text><Text>{formatDate(walletData.wallet?.updatedAt)}</Text></Flex>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card shadow="md">
                                <CardHeader>
                                    <Heading size="md">User Profile</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack align="stretch" spacing={3}>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">Full Name</Text>
                                            <Text fontWeight="bold">{user.fullName || '—'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">Email</Text>
                                            <Text>{user.email || '—'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">Phone</Text>
                                            <Text>{user.phone || '—'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">Role</Text>
                                            <Badge colorScheme="blue">{user.role || 'user'}</Badge>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">User Status</Text>
                                            <Badge colorScheme={getStatusColor(user.status)}>{user.status || 'active'}</Badge>
                                        </Box>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card shadow="md">
                                <CardHeader>
                                    <Heading size="md">Transaction Summary</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack align="stretch" spacing={3}>
                                        <Flex justify="space-between"><Text color="gray.500">Wallet ID</Text><Text fontWeight="semibold" fontSize="sm">{walletData.wallet?._id || '—'}</Text></Flex>
                                        <Flex justify="space-between"><Text color="gray.500">Total Credits</Text><Text fontWeight="semibold">{formatCurrency((walletData.txStats?.totalCredits ?? 0) / 100)}</Text></Flex>
                                        <Flex justify="space-between"><Text color="gray.500">Total Debits</Text><Text fontWeight="semibold">{formatCurrency((walletData.txStats?.totalDebits ?? 0) / 100)}</Text></Flex>
                                        <Flex justify="space-between"><Text color="gray.500">Transactions</Text><Text fontWeight="semibold">{walletData.txStats?.totalTransactions ?? walletData.transactions.length ?? 0}</Text></Flex>
                                        <Divider />
                                        <Text fontSize="sm" color="gray.600">Wallet activity is shown below with the latest movement first.</Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        <Card shadow="md">
                            <CardHeader>
                                <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                                    <Heading size="md">Recent Wallet Transactions</Heading>
                                    <HStack>
                                        <Text fontSize="sm" color="gray.600">Rows:</Text>
                                        <Select
                                            size="sm"
                                            w="90px"
                                            value={txLimit}
                                            onChange={(e) => handleChangeRows(e.target.value)}
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
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Type</Th>
                                                <Th>Source</Th>
                                                <Th>Description</Th>
                                                <Th>Reference</Th>
                                                <Th>Amount</Th>
                                                <Th>Before</Th>
                                                <Th>After</Th>
                                                <Th>Status</Th>
                                                <Th>Created</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {walletData.transactions.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={9} textAlign="center" color="gray.500">No transactions found for this wallet.</Td>
                                                </Tr>
                                            ) : (
                                                walletData.transactions.map((tx) => (
                                                    <Tr key={tx._id}>
                                                        <Td>
                                                            <Badge colorScheme={tx.type === 'credit' ? 'green' : 'red'}>{tx.type || 'unknown'}</Badge>
                                                        </Td>
                                                        <Td>{tx.source || '—'}</Td>
                                                        <Td>{tx.description || '—'}</Td>
                                                        <Td>{tx.reference || '—'}</Td>
                                                        <Td fontWeight="bold" color={tx.type === 'credit' ? 'green.600' : 'red.600'}>
                                                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount ?? 0)}
                                                        </Td>
                                                        <Td>{formatCurrency(tx.balanceBefore ?? 0)}</Td>
                                                        <Td>{formatCurrency(tx.balanceAfter ?? 0)}</Td>
                                                        <Td>
                                                            <Badge colorScheme={getStatusColor(tx.status)}>{tx.status || 'unknown'}</Badge>
                                                        </Td>
                                                        <Td>{formatDate(tx.createdAt)}</Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                <Flex mt={4} justify="space-between" align="center" gap={3} flexWrap="wrap">
                                    <Text fontSize="sm" color="gray.600">
                                        Showing {walletData.transactions.length === 0 ? 0 : ((txPage - 1) * txLimit) + 1} - {Math.min(txPage * txLimit, totalTxCount)} of {totalTxCount}
                                    </Text>
                                    <HStack>
                                        <Button onClick={handlePrev} isDisabled={txPage <= 1}>Prev</Button>
                                        <Text fontSize="sm" color="gray.600">Page {txPage} / {totalTxPages}</Text>
                                        <Button onClick={handleNext} isDisabled={txPage >= totalTxPages}>Next</Button>
                                    </HStack>
                                </Flex>
                            </CardBody>
                        </Card>
                    </>
                )}
            </VStack>

            <AdminNavbar active="Wallet Management" />
        </Box>
    );
}

