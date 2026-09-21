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
import { freezeWallet, getUsersWallets, getWalletDetailsByWalletIdUserIdOrEmail, unfreezeWallet } from '../../../../api';

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

const DEFAULT_WALLET_PAGE_LIMIT = 10;

export default function AdminWalletManagement() {
    const [wallets, setWallets] = useState([]);
    const [stats, setStats] = useState({ totalBalance: 0, avgBalance: 0 });
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: DEFAULT_WALLET_PAGE_LIMIT, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userIdInput, setUserIdInput] = useState('');
    const [singleUserWallet, setSingleUserWallet] = useState(null);
    const [singleWalletLoading, setSingleWalletLoading] = useState(false);
    const [singleWalletError, setSingleWalletError] = useState('');
    const [walletReasons, setWalletReasons] = useState({});
    const [walletEmailFilter, setWalletEmailFilter] = useState('');
    const [walletIdFilter, setWalletIdFilter] = useState('');
    const [walletStatusFilter, setWalletStatusFilter] = useState('all');
    const [minBalanceFilter, setMinBalanceFilter] = useState('');
    const [maxBalanceFilter, setMaxBalanceFilter] = useState('');
    const [lastTransactionFilter, setLastTransactionFilter] = useState('');
    const toast = useToast();

    const fetchWallets = async (page = 1, limit = pagination.limit) => {
        setLoading(true);
        setError('');
        try {
            const res = await getUsersWallets({ page, limit });
            const payload = res?.data?.data ?? res?.data ?? {};
            const walletList = Array.isArray(payload?.wallets) ? payload.wallets : Array.isArray(payload) ? payload : [];
            const pageInfo = payload?.pagination ?? { total: walletList.length, page, limit, pages: Math.ceil(walletList.length / limit) || 1 };

            setWallets(walletList);
            setPagination({
                total: Number(pageInfo.total ?? walletList.length),
                page: Number(pageInfo.page ?? page),
                limit: Number(pageInfo.limit ?? limit),
                pages: Number(pageInfo.pages ?? 1),
            });
            setStats(payload?.stats ?? { totalBalance: 0, avgBalance: 0 });
        } catch (err) {
            console.error(err);
            setError('Unable to load wallets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets(1, 10);
    }, []);

    const summaryCards = useMemo(() => [
        {
            label: 'Total Wallet Balance',
            value: formatCurrency((stats.totalBalance ?? 0) / 100),
            helper: `${wallets.length} wallets loaded`,
            accent: 'teal',
        },
        {
            label: 'Average Balance',
            value: formatCurrency((stats.avgBalance ?? 0) / 100),
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
        const query = userIdInput.trim();

        if (!query) {
            setSingleWalletError('Please enter a user ID, wallet ID, or email.');
            return;
        }

        setSingleWalletLoading(true);
        setSingleWalletError('');
        setSingleUserWallet(null);

        const normalizeWallet = (data) => {
            if (!data || typeof data !== 'object') return null;

            if (Array.isArray(data)) {
                return data[0] ?? null;
            }

            return data?.wallet ?? data?.data?.wallet ?? data?.walletDetails ?? data?.result ?? data?.data ?? data ?? null;
        };

        const findWalletFromList = (searchText) => {
            const needle = searchText.toLowerCase();
            return wallets.find((wallet) => {
                const user = wallet.user || {};
                const candidateValues = [
                    wallet?._id,
                    wallet?.walletId,
                    user?._id,
                    user?.id,
                    user?.userId,
                    user?.email,
                    user?.fullName,
                ].filter(Boolean).map((value) => String(value).toLowerCase());

                return candidateValues.some((value) => value.includes(needle));
            }) ?? null;
        };

        try {
            let wallet = null;

            if (!wallet) {
                try {
                    const res = await getWalletDetailsByWalletIdUserIdOrEmail(query);
                    wallet = normalizeWallet(res?.data ?? res ?? {});
                } catch (err) {
                    console.warn('First wallet lookup failed, trying alternate route.', err);
                }
            }

            if (!wallet) {
                try {
                    const res = await getWalletDetailsByWalletIdUserIdOrEmail(query);
                    wallet = normalizeWallet(res?.data?.data ?? res?.data ?? res ?? {});
                } catch (err) {
                    console.warn('Alternate wallet lookup also failed.', err);
                }
            }

            // if (!wallet) {
            //     const fallbackWallet = findWalletFromList(query);
            //     if (!fallbackWallet) {
            //         setSingleWalletError('No wallet found for this search. Try a user ID, wallet ID, or email.');
            //         return;
            //     }
            //     wallet = fallbackWallet;
            // }

            setSingleUserWallet(wallet);
        } catch (err) {
            console.error('Failed to fetch wallet by user lookup', err);
            setSingleWalletError('Unable to load wallet for this user.');
        } finally {
            setSingleWalletLoading(false);
        }
    };

    const clearWalletFilters = () => {
        setWalletEmailFilter('');
        setWalletIdFilter('');
        setWalletStatusFilter('all');
        setMinBalanceFilter('');
        setMaxBalanceFilter('');
        setLastTransactionFilter('');
    };

    // FIXED FILTER LOGIC
    const filteredWallets = useMemo(() => {
        const emailQuery = walletEmailFilter.trim().toLowerCase();
        const walletIdQuery = walletIdFilter.trim().toLowerCase();
        const statusQuery = walletStatusFilter.toLowerCase();

        // Only parse if not empty
        const minBal = minBalanceFilter !== '' ? Number(minBalanceFilter) : null;
        const maxBal = maxBalanceFilter !== '' ? Number(maxBalanceFilter) : null;
        const lastDate = lastTransactionFilter ? new Date(`${lastTransactionFilter}T00:00:00`) : null;

        return wallets.filter((wallet) => {
            const user = wallet.user || {};
            const walletStatus = (wallet.status || 'active').toLowerCase();
            const balanceInNaira = Number(wallet.balance ?? 0) / 100;

            if (emailQuery && !(user.email || '').toLowerCase().includes(emailQuery)) return false;
            if (walletIdQuery && !(wallet._id || '').toLowerCase().includes(walletIdQuery)) return false;
            if (statusQuery !== 'all' && walletStatus !== statusQuery) return false;
            if (minBal !== null && !Number.isNaN(minBal) && balanceInNaira < minBal) return false;
            if (maxBal !== null && !Number.isNaN(maxBal) && balanceInNaira > maxBal) return false;
            if (lastDate) {
                const txDate = wallet.lastTransactionAt ? new Date(wallet.lastTransactionAt) : null;
                if (!txDate || txDate < lastDate) return false;
            }
            return true;
        });
    }, [wallets, walletEmailFilter, walletIdFilter, walletStatusFilter, minBalanceFilter, maxBalanceFilter, lastTransactionFilter]);

    return (
        <Box p={6} bg="brand.background" minH="100vh" pb={40}>
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                    <Box>
                        <Heading size="lg" color="teal.600">User Wallets</Heading>
                        <Text color="gray.600">All customer wallet balances and wallet statuses</Text>
                    </Box>
                    <Button colorScheme="teal" onClick={() => fetchWallets(1, DEFAULT_WALLET_PAGE_LIMIT)} isLoading={loading}>
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
                                placeholder="Enter User ID or Wallet ID or Email"
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
                                        <Text fontWeight="bold">{formatCurrency((singleUserWallet.balance ?? 0) / 100)}</Text>
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
                                            <Button size="sm" colorScheme="red" bg="red.500" _hover={{ bg: "red.600" }}>
                                                Debit wallet
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
                                    <option value={1000}>All</option>
                                </Select>
                            </HStack>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <Flex wrap="wrap" gap={3} mb={3} align="center">
                            <Input
                                placeholder="Filter by email"
                                value={walletEmailFilter}
                                onChange={(e) => setWalletEmailFilter(e.target.value)}
                                maxW="220px"
                            />
                            <Input
                                placeholder="Wallet ID"
                                value={walletIdFilter}
                                onChange={(e) => setWalletIdFilter(e.target.value)}
                                maxW="180px"
                            />
                            <Select value={walletStatusFilter} onChange={(e) => setWalletStatusFilter(e.target.value)} maxW="180px">
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="frozen">Frozen</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </Select>
                            <Input
                                type="number"
                                placeholder="Min balance"
                                value={minBalanceFilter}
                                onChange={(e) => setMinBalanceFilter(e.target.value)}
                                maxW="140px"
                            />
                            <Input
                                type="number"
                                placeholder="Max balance"
                                value={maxBalanceFilter}
                                onChange={(e) => setMaxBalanceFilter(e.target.value)}
                                maxW="140px"
                            />
                            <Input
                                type="date"
                                value={lastTransactionFilter}
                                onChange={(e) => setLastTransactionFilter(e.target.value)}
                                maxW="180px"
                            />
                            <Button size="sm" variant="outline" colorScheme="gray" onClick={clearWalletFilters}>
                                Clear filters
                            </Button>
                        </Flex>

                        <Flex justify="space-between" align="center" mb={4} gap={2} flexWrap="wrap">
                            <Text fontSize="xs" color="gray.500">Active filters: {walletEmailFilter || walletIdFilter || walletStatusFilter !== 'all' || minBalanceFilter || maxBalanceFilter || lastTransactionFilter ? 'Yes' : 'No'}</Text>
                            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                {filteredWallets.length} matching rows
                            </Badge>
                        </Flex>

                        {loading ? (
                            <Flex justify="center" p={10}><Spinner /></Flex>
                        ) : filteredWallets.length === 0 ? (
                            <Text color="gray.500">No wallets match the current filters.</Text>
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
                                        {filteredWallets.map((wallet) => {
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
                                                        <Text fontWeight="bold">{formatCurrency((wallet.balance ?? 0) / 100)}</Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={getStatusColor(wallet.status)}>{wallet.status || 'active'}</Badge>
                                                    </Td>
                                                    <Td>{formatDate(wallet.lastTransactionAt)}</Td>
                                                    <Td>{formatDate(wallet.createdAt)}</Td>
                                                    <Td>
                                                        <VStack align="stretch" spacing={2}>
                                                                <Input
                                                                    size="sm"
                                                                    placeholder="Reason"
                                                                    value={walletReasons[wallet._id] ?? ''}
                                                                    onChange={(e) => setWalletReasons((prev) => ({ ...prev, [wallet._id]: e.target.value }))}
                                                                />
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

                                                            <Button size="sm" colorScheme="green" variant="solid" onClick={() => handleWalletAction('Top up', wallet)}>
                                                                Top Up
                                                            </Button>
                                                            <Button size="sm" colorScheme="red" bg="red.500" _hover={{ bg: "red.600" }} onClick={() => handleWalletAction('Top up', wallet)}>
                                                                Debit Wallet
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
                                Showing {filteredWallets.length} of {wallets.length} wallets
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
