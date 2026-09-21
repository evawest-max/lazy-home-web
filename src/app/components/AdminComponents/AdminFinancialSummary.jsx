import React, { useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    HStack,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
    Heading,
    Card,
    CardHeader,
    CardBody,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    TableContainer,
    Select,
    IconButton,
    Collapse,
    InputGroup,
    Input,
    InputRightElement,
    CloseButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import {
    getEscrows,
    getFinanceReconcilation,
    getfinancialSummary,
    getWalletFundings,
    getWithdrawals,
} from '../../../../api';
import AdminNavbar from './AdminNavbar';

const COLORS = ["#3182CE", "#38A169", "#E53E3E", "#D69E2E", "#805AD5"];

export default function AdminFinancialSummary() {
    const [summary, setSummary] = useState({});
    const [withdrawals, setWithdrawals] = useState([]);
    const [escrows, setEscrows] = useState([]);
    const [escrowsLoading, setEscrowsLoading] = useState(false);
    const [escrowsPageInfo, setEscrowsPageInfo] = useState({ page: 1, limit: 6, pages: 1, total: 0 });
    const [reconciliation, setReconciliation] = useState({});
    const [walletFundings, setWalletFundings] = useState([]);
    const [walletLoading, setWalletLoading] = useState(false);
    const [walletCurrentPage, setWalletCurrentPage] = useState(1);
    const [walletPageSize, setWalletPageSize] = useState(10);
    const [walletPageInfo, setWalletPageInfo] = useState({ page: 1, limit: 10, pages: 1, total: 0 });
    const [withdrawalCurrentPage, setWithdrawalCurrentPage] = useState(1);
    const [withdrawalPageSize, setWithdrawalPageSize] = useState(10);
    const [withdrawalSearch, setWithdrawalSearch] = useState('');
    const [withdrawalsPageInfo, setWithdrawalsPageInfo] = useState({ page: 1, limit: 10, pages: 1, total: 0 });
    const [escrowSearch, setEscrowSearch] = useState('');
    const [walletFundingSearch, setWalletFundingSearch] = useState('');
    const walletTotalPages = Math.max(1, Number(walletPageInfo.pages ?? 1));
    const walletPaginated = walletFundings;
    const [walletExpandedIds, setWalletExpandedIds] = useState([]);

    const toggleWalletExpanded = (id) => {
        setWalletExpandedIds((prev) => {
            const exists = prev.includes(id);
            if (exists) return prev.filter((x) => x !== id);
            return [...prev, id];
        });
    };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resolvedIssueRefs, setResolvedIssueRefs] = useState([]);
    const [resolvedFundingIssueRefs, setResolvedFundingIssueRefs] = useState([]);

    const escrowIssues = Array.isArray(reconciliation?.escrowIssues)
        ? reconciliation.escrowIssues
        : Array.isArray(reconciliation?.issues)
            ? reconciliation.issues
            : [];

    const fundingIssues = Array.isArray(reconciliation?.fundingIssues)
        ? reconciliation.fundingIssues
        : Array.isArray(reconciliation?.walletFundingIssues)
            ? reconciliation.walletFundingIssues
            : [];

    const handleResolveIssue = (issue) => {
        const key = issue?.reference || issue?.escrowId || issue?.id || issue?.type;
        if (!key) return;

        setResolvedIssueRefs((prev) => (prev.includes(key) ? prev : [...prev, key]));

        setReconciliation((prev) => ({
            ...prev,
            escrowIssues: (prev?.escrowIssues ?? prev?.issues ?? []).map((item) => {
                const itemKey = item?.reference || item?.escrowId || item?.id || item?.type;
                if (itemKey === key) {
                    return {
                        ...item,
                        status: 'resolved',
                        resolvedAt: new Date().toISOString(),
                    };
                }
                return item;
            }),
            issues: Array.isArray(prev?.issues)
                ? prev.issues.map((item) => {
                    const itemKey = item?.reference || item?.escrowId || item?.id || item?.type;
                    if (itemKey === key) {
                        return {
                            ...item,
                            status: 'resolved',
                            resolvedAt: new Date().toISOString(),
                        };
                    }
                    return item;
                })
                : prev?.issues,
        }));
    };

    const handleResolveFundingIssue = (issue) => {
        const key = issue?.reference || issue?.fundingId || issue?.id || issue?.type;
        if (!key) return;

        setResolvedFundingIssueRefs((prev) => (prev.includes(key) ? prev : [...prev, key]));

        setReconciliation((prev) => ({
            ...prev,
            fundingIssues: (prev?.fundingIssues ?? prev?.walletFundingIssues ?? []).map((item) => {
                const itemKey = item?.reference || item?.fundingId || item?.id || item?.type;
                if (itemKey === key) {
                    return {
                        ...item,
                        status: 'resolved',
                        resolvedAt: new Date().toISOString(),
                    };
                }
                return item;
            }),
            walletFundingIssues: Array.isArray(prev?.walletFundingIssues)
                ? prev.walletFundingIssues.map((item) => {
                    const itemKey = item?.reference || item?.fundingId || item?.id || item?.type;
                    if (itemKey === key) {
                        return {
                            ...item,
                            status: 'resolved',
                            resolvedAt: new Date().toISOString(),
                        };
                    }
                    return item;
                })
                : prev?.walletFundingIssues,
        }));
    };

    const asArray = (v) => {
        if (!v) return [];
        return Array.isArray(v) ? v : typeof v === 'object' ? Object.values(v) : [v];
    };

    // Fetch a specific page of escrows (supports APIs that accept page & limit)
    const fetchEscrowsPage = async (page = 1, limit = 6, searchTerm = escrowSearch) => {
        setEscrowsLoading(true);
        try {
            const params = { page, limit };
  if (searchTerm.trim()) params.search = searchTerm.trim(); // backend checks title + reference
  const res = await getEscrows(params);
            const escData = res?.data?.data ?? res?.data ?? res ?? {};
            const items = asArray(escData?.escrows ?? escData?.items ?? escData?.data ?? escData);

            const pageInfo = {
                page: escData?.page ?? escData?.pagination?.page ?? page,
                limit: escData?.limit ?? escData?.pagination?.limit ?? limit,
                pages: escData?.pages ?? escData?.pagination?.pages ?? Math.max(1, Math.ceil((escData?.total ?? items.length) / (escData?.limit ?? limit))),
                total: escData?.total ?? escData?.pagination?.total ?? items.length,
            };

            setEscrows(items);
            setEscrowsPageInfo(pageInfo);
        } catch (err) {
            console.error('Failed to fetch escrows page', err);
        } finally {
            setEscrowsLoading(false);
        }
    };

    const totalPages = Math.max(1, Number(withdrawalsPageInfo.pages ?? 1));
    const paginatedWithdrawals = withdrawals;
    const [expandedIds, setExpandedIds] = useState([]);

    const [escrowsExpandedIds, setEscrowsExpandedIds] = useState([]);

    const toggleEscrowExpanded = (id) => {
        setEscrowsExpandedIds((prev) => {
            const exists = prev.includes(id);
            if (exists) return prev.filter((x) => x !== id);
            return [...prev, id];
        });
    };

    const fetchWithdrawalsPage = async (page = 1, limit = withdrawalPageSize, searchTerm = withdrawalSearch) => {
        try {
            const params = { page, limit };
  if (searchTerm.trim()) params.search = searchTerm.trim(); // backend checks reference + paystackTransferId
  const res = await getWithdrawals(params);
            const withdrawalData = res?.data?.data ?? res?.data ?? res ?? {};
            const items = asArray(withdrawalData?.withdrawals ?? withdrawalData?.items ?? withdrawalData?.data ?? withdrawalData);
            const pageInfo = {
                page: Number(withdrawalData?.page ?? withdrawalData?.pagination?.page ?? page),
                limit: Number(withdrawalData?.limit ?? withdrawalData?.pagination?.limit ?? limit),
                pages: Number(withdrawalData?.pages ?? withdrawalData?.pagination?.pages ?? Math.max(1, Math.ceil((withdrawalData?.total ?? items.length) / (withdrawalData?.limit ?? limit)))),
                total: Number(withdrawalData?.total ?? withdrawalData?.pagination?.total ?? items.length),
            };
            setWithdrawals(items);
            setWithdrawalsPageInfo(pageInfo);
            setWithdrawalCurrentPage(pageInfo.page);
            setWithdrawalPageSize(pageInfo.limit);
        } catch (err) {
            console.error('Failed to fetch withdrawals page', err);
        }
    };

    const fetchWalletFundingsPage = async (page = 1, limit = walletPageSize, searchTerm = walletFundingSearch) => {
        setWalletLoading(true);
        try {
            const params = { page, limit };
  if (searchTerm.trim()) params.search = searchTerm.trim(); // backend checks reference + walletId
  const res = await getWalletFundings(params);
            const walletFundingsData = res?.data?.data ?? res?.data ?? res ?? {};
            const items = asArray(walletFundingsData?.fundings ?? walletFundingsData?.items ?? walletFundingsData?.data ?? walletFundingsData);
            const pageInfo = {
                page: Number(walletFundingsData?.page ?? walletFundingsData?.pagination?.page ?? page),
                limit: Number(walletFundingsData?.limit ?? walletFundingsData?.pagination?.limit ?? limit),
                pages: Number(walletFundingsData?.pages ?? walletFundingsData?.pagination?.pages ?? Math.max(1, Math.ceil((walletFundingsData?.total ?? items.length) / (walletFundingsData?.limit ?? limit)))),
                total: Number(walletFundingsData?.total ?? walletFundingsData?.pagination?.total ?? items.length),
            };
            setWalletFundings(items);
            setWalletPageInfo(pageInfo);
            setWalletCurrentPage(pageInfo.page);
            setWalletPageSize(pageInfo.limit);
        } catch (err) {
            console.error('Failed to fetch wallet fundings page', err);
        } finally {
            setWalletLoading(false);
        }
    };

    // WITHDRAWALS
const handleWithdrawalSearch = () => {
  setWithdrawalCurrentPage(1);
  fetchWithdrawalsPage(1, withdrawalPageSize, withdrawalSearch);
};
const handleWithdrawalClear = () => {
  setWithdrawalSearch('');
  setWithdrawalCurrentPage(1);
  fetchWithdrawalsPage(1, withdrawalPageSize, '');
};

// ESCROWS
const handleEscrowSearch = () => {
  fetchEscrowsPage(1, escrowsPageInfo.limit, escrowSearch);
};
const handleEscrowClear = () => {
  setEscrowSearch('');
  fetchEscrowsPage(1, escrowsPageInfo.limit, '');
};

// WALLET FUNDINGS
const handleWalletFundingSearch = () => {
  setWalletCurrentPage(1);
  fetchWalletFundingsPage(1, walletPageSize, walletFundingSearch);
};
const handleWalletFundingClear = () => {
  setWalletFundingSearch('');
  setWalletCurrentPage(1);
  fetchWalletFundingsPage(1, walletPageSize, '');
};

    const toggleExpanded = (id) => {
        setExpandedIds((prev) => {
            const exists = prev.includes(id);
            if (exists) return prev.filter((x) => x !== id);
            return [...prev, id];
        });
    };

    useEffect(() => {
        const fetchFinancialData = async () => {
            setLoading(true);
            setError('');
            try {
                const [summaryRes, withdrawalsRes, escrowsRes, reconciliationRes, walletFundingsRes] = await Promise.all([
                    getfinancialSummary(),
                    getWithdrawals({ page: withdrawalCurrentPage, limit: withdrawalPageSize, ...(withdrawalSearch ? { search: withdrawalSearch } : {}) }),
                    getEscrows({ page: escrowsPageInfo.page, limit: escrowsPageInfo.limit, ...(escrowSearch ? { search: escrowSearch } : {}) }),
                    getFinanceReconcilation(),
                    getWalletFundings({ page: walletCurrentPage, limit: walletPageSize, ...(walletFundingSearch ? { search: walletFundingSearch } : {}) })
                ]);

                const summaryData = summaryRes?.data?.data ?? summaryRes?.data ?? summaryRes ?? {};
                const withdrawalData = withdrawalsRes?.data?.data ?? withdrawalsRes?.data ?? withdrawalsRes ?? {};
                const escrowData = escrowsRes?.data?.data ?? escrowsRes?.data ?? escrowsRes ?? {};
                const reconciliationData = reconciliationRes?.data?.data ?? reconciliationRes?.data ?? reconciliationRes ?? {};
                const walletFundingsData = walletFundingsRes?.data?.data ?? walletFundingsRes?.data ?? walletFundingsRes ?? {};

                setSummary(summaryData);
                const withdrawalItems = asArray(withdrawalData?.withdrawals ?? withdrawalData?.items ?? withdrawalData?.data ?? withdrawalData);
                setWithdrawals(withdrawalItems);
                setWithdrawalsPageInfo({
                    page: Number(withdrawalData?.page ?? withdrawalData?.pagination?.page ?? withdrawalCurrentPage),
                    limit: Number(withdrawalData?.limit ?? withdrawalData?.pagination?.limit ?? withdrawalPageSize),
                    pages: Number(withdrawalData?.pages ?? withdrawalData?.pagination?.pages ?? Math.max(1, Math.ceil((withdrawalData?.total ?? withdrawalItems.length) / (withdrawalData?.limit ?? withdrawalPageSize)))),
                    total: Number(withdrawalData?.total ?? withdrawalData?.pagination?.total ?? withdrawalItems.length),
                });

                const escItems = asArray(escrowData?.escrows ?? escrowData?.items ?? escrowData?.data ?? escrowData);
                const escPageInfo = {
                    page: Number(escrowData?.page ?? escrowData?.pagination?.page ?? escrowsPageInfo.page),
                    limit: Number(escrowData?.limit ?? escrowData?.pagination?.limit ?? escrowsPageInfo.limit),
                    pages: Number(escrowData?.pages ?? escrowData?.pagination?.pages ?? Math.max(1, Math.ceil((escrowData?.total ?? escItems.length) / (escrowData?.limit ?? escrowsPageInfo.limit)))),
                    total: Number(escrowData?.total ?? escrowData?.pagination?.total ?? escItems.length),
                };
                setEscrows(escItems);
                setEscrowsPageInfo(escPageInfo);

                const walletItems = asArray(walletFundingsData?.fundings ?? walletFundingsData?.items ?? walletFundingsData?.data ?? walletFundingsData);
                setWalletFundings(walletItems);
                setWalletPageInfo({
                    page: Number(walletFundingsData?.page ?? walletFundingsData?.pagination?.page ?? walletCurrentPage),
                    limit: Number(walletFundingsData?.limit ?? walletFundingsData?.pagination?.limit ?? walletPageSize),
                    pages: Number(walletFundingsData?.pages ?? walletFundingsData?.pagination?.pages ?? Math.max(1, Math.ceil((walletFundingsData?.total ?? walletItems.length) / (walletFundingsData?.limit ?? walletPageSize)))),
                    total: Number(walletFundingsData?.total ?? walletFundingsData?.pagination?.total ?? walletItems.length),
                });
                setReconciliation(reconciliationData);
            } catch (err) {
                console.error('Failed to load admin financial data', err);
                setError('Unable to load the financial dashboard. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchFinancialData();
    }, []);

    const formatCurrency = (v) => {
        const n = Number(v || 0);
        return n.toLocaleString(undefined, { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 });
    };

    const renderJSONShort = (obj, max = 120) => {
        if (obj === null || obj === undefined) return '—';
        try {
            const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
            if (s.length > max) return s.slice(0, max) + '…';
            return s;
        } catch (e) {
            return String(obj);
        }
    };

    const totals = {
        heldInEscrow: summary?.totals?.heldInEscrow ?? summary?.escrows?.heldAmount ?? 0,
        walletBalance: summary?.totals?.totalWalletBalance ?? summary?.wallets?.totalBalance ?? 0,
        totalLiability: summary?.totals?.totalLiability ?? ((summary?.totals?.heldInEscrow ?? 0) + (summary?.totals?.totalWalletBalance ?? summary?.wallets?.totalBalance ?? 0)),
        totalRevenue: summary?.totals?.totalRevenue ?? summary?.revenue?.total ?? 0,
        totalWithdrawn: summary?.totals?.totalWithdrawn ?? summary?.withdrawals?.completed?.amount ?? 0,
        totalCommissionsPaid: summary?.totals?.totalCommissionsPaid ?? summary?.commissions?.paid?.amount ?? 0,
        totalBonusesPaid: summary?.totals?.totalBonusesPaid ?? summary?.bonuses?.paid?.amount ?? 0,
        totalWithdrawalFees: summary?.totals?.totalWithdrawalFees ?? summary?.revenue?.withdrawalFees ?? 0,
    };

    const summaryCards = [
        {
            title: 'Held in Escrow',
            value: totals.heldInEscrow,
            subtext: `${summary?.escrows?.active ?? 0} active • ${summary?.escrows?.released ?? 0} released`,
            accent: 'blue',
        },
        {
            title: 'Wallet Balance',
            value: totals.walletBalance / 100,
            subtext: `${summary?.wallets?.totalWallets ?? 0} wallets • ${summary?.wallets?.activeWallets ?? 0} active`,
            accent: 'cyan',
        },
        {
            title: 'Total Liability',
            value: totals.totalLiability / 100,
            subtext: `Escrow + wallet balance`,
            accent: 'red',
        },
        {
            title: 'Total Revenue',
            value: totals.totalRevenue,
            subtext: `Gross ${formatCurrency(summary?.revenue?.gross ?? 0)} • Pending ${formatCurrency(summary?.revenue?.pending ?? 0)}`,
            accent: 'green',
        },
        {
            title: 'Total Withdrawn',
            value: totals.totalWithdrawn / 100,
            subtext: `${summary?.withdrawals?.completed?.count ?? 0} completed • ${summary?.withdrawals?.pending?.count ?? 0} pending`,
            accent: 'purple',
        },
        {
            title: 'Total Fees',
            value: totals.totalWithdrawalFees,
            subtext: `${formatCurrency(totals.totalCommissionsPaid)} commissions • ${formatCurrency(totals.totalBonusesPaid)} bonuses`,
            accent: 'orange',
        },
    ];

    const breakdownCards = [
        {
            title: 'Withdrawals',
            rows: [
                { label: 'Pending', value: `${summary?.withdrawals?.pending?.count ?? 0} • ${formatCurrency(summary?.withdrawals?.pending?.amount ?? 0)}` },
                { label: 'Completed', value: `${(summary?.withdrawals?.completed?.count ?? 0) / 100} • ${formatCurrency(summary?.withdrawals?.completed?.amount ?? 0)}` },
                { label: 'Failed', value: `${summary?.withdrawals?.failed?.count ?? 0} • ${formatCurrency(summary?.withdrawals?.failed?.amount ?? 0)}` },
                { label: 'Net amount', value: formatCurrency(summary?.withdrawals?.pending?.netAmount ?? 0) },
                { label: 'Fees', value: formatCurrency(summary?.withdrawals?.pending?.fee ?? summary?.totals?.totalWithdrawalFees ?? summary?.revenue?.withdrawalFees ?? 0) },
            ],
        },
        {
            title: 'Escrows',
            rows: [
                { label: 'Active', value: `${summary?.escrows?.active ?? 0}` },
                { label: 'Released', value: `${summary?.escrows?.released ?? 0}` },
                { label: 'Held amount', value: formatCurrency(summary?.escrows?.heldAmount ?? summary?.totals?.heldInEscrow ?? 0) },
                { label: 'Platform fees', value: formatCurrency(summary?.escrows?.heldPlatformFees ?? 0) },
                { label: 'Released volume', value: formatCurrency(summary?.escrows?.releasedVolume ?? 0) },
            ],
        },
        {
            title: 'Commissions',
            rows: [
                { label: 'Pending', value: `${summary?.commissions?.pending ?? 0}` },
                { label: 'Paid count', value: `${summary?.commissions?.paid?.count ?? 0}` },
                { label: 'Paid amount', value: formatCurrency(summary?.commissions?.paid?.amount ?? summary?.totals?.totalCommissionsPaid ?? 0) },
            ],
        },
        {
            title: 'Bonuses',
            rows: [
                { label: 'Pending', value: `${summary?.bonuses?.pending ?? 0}` },
                { label: 'Paid count', value: `${summary?.bonuses?.paid?.count ?? 0}` },
                { label: 'Paid amount', value: formatCurrency(summary?.bonuses?.paid?.amount ?? summary?.totals?.totalBonusesPaid ?? 0) },
            ],
        },
        {
            title: 'Wallets',
            rows: [
                { label: 'Total balance', value: formatCurrency((summary?.wallets?.totalBalance ?? summary?.totals?.totalWalletBalance ?? 0) / 100) },
                { label: 'Total wallets', value: `${summary?.wallets?.totalWallets ?? 0}` },
                { label: 'Active wallets', value: `${summary?.wallets?.activeWallets ?? 0}` },
                { label: 'Frozen wallets', value: `${summary?.wallets?.frozenWallets ?? 0}` },
                { label: 'Average balance', value: formatCurrency((summary?.wallets?.avgBalance ?? 0) / 100) },
            ],
        },
        {
            title: 'Revenue',
            rows: [
                { label: 'Total', value: formatCurrency(summary?.revenue?.total ?? summary?.totals?.totalRevenue ?? 0) },
                { label: 'Pending', value: formatCurrency(summary?.revenue?.pending ?? 0) },
                { label: 'Withdrawal fees', value: formatCurrency(summary?.revenue?.withdrawalFees ?? summary?.totals?.totalWithdrawalFees ?? 0) },
                { label: 'Gross', value: formatCurrency(summary?.revenue?.gross ?? 0) },
            ],
        },
        {
            title: 'Totals',
            rows: [
                { label: 'Held in escrow', value: formatCurrency((summary?.totals?.heldInEscrow ?? 0) / 100) },
                { label: 'Wallet balance', value: formatCurrency((summary?.totals?.totalWalletBalance ?? summary?.wallets?.totalBalance ?? 0) / 100) },
                { label: 'Total liability', value: formatCurrency((summary?.totals?.totalLiability ?? 0) / 100) },
                { label: 'Total revenue', value: formatCurrency(summary?.totals?.totalRevenue ?? 0) },
                { label: 'Commissions paid', value: formatCurrency((summary?.totals?.totalCommissionsPaid ?? 0)) },
                { label: 'Bonuses paid', value: formatCurrency((summary?.totals?.totalBonusesPaid ?? 0) / 100) },
                { label: 'Total withdrawn', value: formatCurrency((summary?.totals?.totalWithdrawn ?? 0) / 100) },
                { label: 'Total withdrawal fees', value: formatCurrency((summary?.totals?.totalWithdrawalFees ?? 0) / 100) },
            ],
        },
    ];

    // derive a checked-stats object for reconciliation display (defensive defaults)
    const checked = reconciliation?.checked ?? {
        matched: reconciliation?.matched ?? 0,
        unmatched: reconciliation?.unmatched ?? reconciliation?.unreconciled ?? 0,
        reconciled: reconciliation?.reconciled ?? 0,
        pending: reconciliation?.pending ?? 0,
    };

    // Chart data
    const withdrawalChart = [
        { name: "Pending", value: summary?.withdrawals?.pending ?? 0 },
        { name: "Failed", value: summary?.withdrawals?.failed ?? 0 },
    ];
    const escrowChart = [
        { name: "Active", value: summary?.escrows?.active ?? 0 },
        { name: "Released", value: summary?.escrows?.released ?? 0 },
    ];

    return (
        <Box p={6} bg="brand.background" minH="100vh" pb={58} mb={2}>
            <VStack spacing={6} align="stretch">
                <Flex align="center" justify="space-between">
                    <Heading size="lg" color="teal.600">Admin Financial Dashboard</Heading>
                    <HStack>
                        <Button colorScheme="teal" size="sm">Refresh</Button>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                    {summaryCards.map((card) => (
                        <Card key={card.title} shadow="md" borderRadius="lg" borderLeft="4px solid" borderLeftColor={`${card.accent}.500`}>
                            <CardBody p={5}>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.500">{card.title}</Text>
                                <Heading size="lg" mt={2}>{formatCurrency(card.value)}</Heading>
                                <Text fontSize="xs" color="gray.500" mt={3}>{card.subtext}</Text>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                    {breakdownCards.map((card) => (
                        <Card key={card.title} shadow="sm" borderRadius="lg" bg="white">
                            <CardHeader pb={2}>
                                <Heading size="sm">{card.title}</Heading>
                            </CardHeader>
                            <CardBody pt={0}>
                                <VStack spacing={3} align="stretch">
                                    {card.rows.map((row) => (
                                        <Flex key={`${card.title}-${row.label}`} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                            <Text fontSize="sm" color="gray.600">{row.label}</Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="gray.800">{row.value}</Text>
                                        </Flex>
                                    ))}
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                {/* Charts Section */}
                {/* <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                    <Card>
                        <CardHeader><Heading size="sm">Withdrawals Status</Heading></CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={withdrawalChart} dataKey="value" nameKey="name" outerRadius={80} label>
                                        {withdrawalChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader><Heading size="sm">Escrows Status</Heading></CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={escrowChart}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3182CE" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </Grid> */}

                {/* Recent Withdrawals Table */}
                <Card>
                    <CardHeader>
  <VStack spacing={3} align="stretch">
    <Heading size="sm">Recent Withdrawals</Heading>
    <HStack spacing={2}>
      <InputGroup maxW="320px">
        <Input
          placeholder="Search by reference, transferId, paystack ID..."
          value={withdrawalSearch}
          onChange={(e) => setWithdrawalSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleWithdrawalSearch()}
        />
        {withdrawalSearch && (
          <InputRightElement>
            <CloseButton size="sm" onClick={handleWithdrawalClear} />
          </InputRightElement>
        )}
      </InputGroup>
      <Button size="sm" colorScheme="teal" onClick={handleWithdrawalSearch}>Search</Button>
      <Button size="sm" variant="outline" onClick={handleWithdrawalClear}>Clear</Button>
    </HStack>
  </VStack>
</CardHeader>
                    <CardBody>
                        {loading ? (
                            <Spinner />
                        ) : (
                            <Box>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th></Th>
                                                <Th>_id</Th>
                                                <Th>reference</Th>
                                                <Th>amount</Th>
                                                <Th>netAmount</Th>
                                                <Th>fee</Th>
                                                <Th>status</Th>
                                                <Th>transferMode</Th>
                                                <Th>transferCode</Th>
                                                <Th>paystackTransferId</Th>
                                                <Th>paystackResponse</Th>
                                                <Th>accountSnapshot</Th>
                                                <Th>settlementAccount</Th>
                                                <Th>wallet</Th>
                                                <Th>walletTransaction</Th>
                                                <Th>user</Th>
                                                <Th>createdAt</Th>
                                                <Th>initiatedAt</Th>
                                                <Th>completedAt</Th>
                                                <Th>updatedAt</Th>
                                                <Th>metadata</Th>
                                                <Th>__v</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {withdrawals.length === 0 && (
                                                <Tr><Td colSpan={22}>No withdrawals found</Td></Tr>
                                            )}
                                            {paginatedWithdrawals.map((w, idx) => {
                                                const id = w._id ?? w.id ?? ((withdrawalCurrentPage - 1) * withdrawalPageSize) + idx;
                                                const isOpen = expandedIds.includes(id);
                                                return (
                                                    <>
                                                        <Tr key={id}>
                                                            <Td>
                                                                <IconButton size="sm" variant="ghost" aria-label={isOpen ? 'collapse' : 'expand'} icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />} onClick={() => toggleExpanded(id)} />
                                                            </Td>
                                                            <Td>{w._id ?? w.id ?? `#${(withdrawalCurrentPage - 1) * withdrawalPageSize + idx + 1}`}</Td>
                                                            <Td>{w.reference ?? '—'}</Td>
                                                            <Td>{formatCurrency((w.amount ?? w.value ?? 0) / 100)}</Td>
                                                            <Td>{formatCurrency((w.netAmount ?? 0) / 100)}</Td>
                                                            <Td>{formatCurrency((w.fee ?? 0) / 100)}</Td>
                                                            <Td><Badge colorScheme={w.status === 'failed' ? 'red' : w.status === 'completed' ? 'green' : 'gray'}>{w.status ?? 'unknown'}</Badge></Td>
                                                            <Td>{w.transferMode ?? '—'}</Td>
                                                            <Td>{w.transferCode ?? '—'}</Td>
                                                            <Td>{w.paystackTransferId ?? '—'}</Td>
                                                            <Td>{renderJSONShort(w.paystackResponse)}</Td>
                                                            <Td>{renderJSONShort(w.accountSnapshot)}</Td>
                                                            <Td>{renderJSONShort(w.settlementAccount)}</Td>
                                                            <Td>{renderJSONShort(w.wallet)}</Td>
                                                            <Td>{renderJSONShort(w.walletTransaction)}</Td>
                                                            <Td>{renderJSONShort(w.user)}</Td>
                                                            <Td>{w.createdAt ? new Date(w.createdAt).toLocaleString() : '—'}</Td>
                                                            <Td>{w.initiatedAt ? new Date(w.initiatedAt).toLocaleString() : '—'}</Td>
                                                            <Td>{w.completedAt ? new Date(w.completedAt).toLocaleString() : '—'}</Td>
                                                            <Td>{w.updatedAt ? new Date(w.updatedAt).toLocaleString() : '—'}</Td>
                                                            <Td>{renderJSONShort(w.metadata)}</Td>
                                                            <Td>{w.__v ?? '—'}</Td>
                                                        </Tr>
                                                        <Tr key={`${id}-details`}>
                                                            <Td colSpan={22} p={0}>
                                                                <Collapse in={isOpen} animateOpacity>
                                                                    <Box p={3} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                                                                        <Box as="pre" whiteSpace="pre-wrap" fontSize="12px">{JSON.stringify(w, null, 2)}</Box>
                                                                    </Box>
                                                                </Collapse>
                                                            </Td>
                                                        </Tr>
                                                    </>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                                {/* Pagination controls */}
                                <Flex mt={3} justify="space-between" align="center">
                                    <HStack spacing={3}>
                                        <Text fontSize="sm">Rows per page:</Text>
                                        <Select size="sm" width="80px" value={String(withdrawalPageSize)} onChange={(e) => { const nextLimit = Number(e.target.value); setWithdrawalPageSize(nextLimit); setWithdrawalCurrentPage(1); fetchWithdrawalsPage(1, nextLimit); }}>
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                        </Select>
                                        <Text fontSize="sm" color="gray.600">Showing {withdrawalsPageInfo.total === 0 ? 0 : ((withdrawalsPageInfo.page - 1) * withdrawalsPageInfo.limit + 1)} - {Math.min(withdrawalsPageInfo.page * withdrawalsPageInfo.limit, withdrawalsPageInfo.total)} of {withdrawalsPageInfo.total}</Text>
                                    </HStack>

                                    <HStack>
                                        <Button size="sm" onClick={() => fetchWithdrawalsPage(Math.max(1, withdrawalCurrentPage - 1), withdrawalPageSize)} isDisabled={withdrawalCurrentPage <= 1}>Prev</Button>
                                        <Text fontSize="sm">Page {withdrawalCurrentPage} / {totalPages}</Text>
                                        <Button size="sm" onClick={() => fetchWithdrawalsPage(Math.min(totalPages, withdrawalCurrentPage + 1), withdrawalPageSize)} isDisabled={withdrawalCurrentPage >= totalPages}>Next</Button>
                                    </HStack>
                                </Flex>
                            </Box>
                        )}
                    </CardBody>
                </Card>

                {/* Escrows List */}
                <Card>
                    <CardHeader>
  <VStack spacing={3} align="stretch">
    <Heading size="sm">Escrows</Heading>
    <HStack spacing={2}>
      <InputGroup maxW="320px">
        <Input
          placeholder="Search by title or reference..."
          value={escrowSearch}
          onChange={(e) => setEscrowSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEscrowSearch()}
        />
        {escrowSearch && (
          <InputRightElement>
            <CloseButton size="sm" onClick={handleEscrowClear} />
          </InputRightElement>
        )}
      </InputGroup>
      <Button size="sm" colorScheme="teal" onClick={handleEscrowSearch}>Search</Button>
      <Button size="sm" variant="outline" onClick={handleEscrowClear}>Clear</Button>
    </HStack>
  </VStack>
</CardHeader>
                    <CardBody>
                        {escrowsLoading ? (
                            <Spinner />
                        ) : (
                            <Box>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th></Th>
                                                <Th>_id</Th>
                                                <Th>reference</Th>
                                                <Th>amount</Th>
                                                <Th>status</Th>
                                                <Th>escrowType</Th>
                                                <Th>payoutStatus</Th>
                                                <Th>releasedAmount</Th>
                                                <Th>releasedAt</Th>
                                                <Th>landlord</Th>
                                                <Th>tenant</Th>
                                                <Th>property</Th>
                                                <Th>payoutBreakdown</Th>
                                                <Th>paymentDate</Th>
                                                <Th>createdAt</Th>
                                                <Th>updatedAt</Th>
                                                <Th>walletTransaction</Th>
                                                <Th>transfers</Th>
                                                <Th>timeline</Th>
                                                <Th>__v</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {escrows.length === 0 && (
                                                <Tr><Td colSpan={20}>No escrows found</Td></Tr>
                                            )}
                                            {escrows.map((e, i) => {
                                                const id = e._id ?? e.id ?? `${escrowsPageInfo.page}-${i}`;
                                                const isOpen = escrowsExpandedIds.includes(id);
                                                return (
                                                    <React.Fragment key={id}>
                                                        <Tr>
                                                            <Td>
                                                                <IconButton size="sm" variant="ghost" aria-label={isOpen ? 'collapse' : 'expand'} icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />} onClick={() => toggleEscrowExpanded(id)} />
                                                            </Td>
                                                            <Td>{e._id ?? e.id ?? `#${(escrowsPageInfo.page - 1) * escrowsPageInfo.limit + i + 1}`}</Td>
                                                            <Td>{e.reference ?? '—'}</Td>
                                                            <Td>{formatCurrency(e.amount ?? e.totalPaid ?? 0)}</Td>
                                                            <Td>{e.status ?? '—'}</Td>
                                                            <Td>{e.escrowType ?? '—'}</Td>
                                                            <Td>{e.payoutStatus ?? '—'}</Td>
                                                            <Td>{formatCurrency(e.releasedAmount ?? 0)}</Td>
                                                            <Td>{e.releasedAt ? new Date(e.releasedAt).toLocaleString() : '—'}</Td>
                                                            <Td>{renderJSONShort(e.landlord ?? e.landlordDetails)}</Td>
                                                            <Td>{renderJSONShort(e.tenant)}</Td>
                                                            <Td>{renderJSONShort(e.property?.title ?? e.property)}</Td>
                                                            <Td>{renderJSONShort(e.payoutBreakdown)}</Td>
                                                            <Td>{e.paymentDate ? new Date(e.paymentDate).toLocaleString() : '—'}</Td>
                                                            <Td>{e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}</Td>
                                                            <Td>{e.updatedAt ? new Date(e.updatedAt).toLocaleString() : '—'}</Td>
                                                            <Td>{e.walletTransaction ?? '—'}</Td>
                                                            <Td>{(e.transfers && e.transfers.length) ? e.transfers.length : 0}</Td>
                                                            <Td>{(e.timeline && e.timeline.length) ? e.timeline.length : 0}</Td>
                                                            <Td>{e.__v ?? '—'}</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td colSpan={20} p={0}>
                                                                <Collapse in={isOpen} animateOpacity>
                                                                    <Box p={3} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                                                                        <Box as="pre" whiteSpace="pre-wrap" fontSize="12px">{JSON.stringify(e, null, 2)}</Box>
                                                                    </Box>
                                                                </Collapse>
                                                            </Td>
                                                        </Tr>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                {/* Escrows pagination controls */}
                                <Flex mt={3} justify="space-between" align="center">
                                    <HStack spacing={3}>
                                        <Text fontSize="sm">Rows per page:</Text>
                                        <Select size="sm" width="80px" value={String(escrowsPageInfo.limit)} onChange={(e) => { fetchEscrowsPage(1, Number(e.target.value)); }}>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                        </Select>
                                        <Text fontSize="sm" color="gray.600">Showing {escrowsPageInfo.total === 0 ? 0 : ((escrowsPageInfo.page - 1) * escrowsPageInfo.limit + 1)} - {Math.min(escrowsPageInfo.page * escrowsPageInfo.limit, escrowsPageInfo.total)} of {escrowsPageInfo.total}</Text>
                                    </HStack>

                                    <HStack>
                                        <Button size="sm" onClick={() => fetchEscrowsPage(Math.max(1, escrowsPageInfo.page - 1), escrowsPageInfo.limit)} isDisabled={escrowsPageInfo.page <= 1 || escrowsLoading}>Prev</Button>
                                        <Text fontSize="sm">Page {escrowsPageInfo.page} / {escrowsPageInfo.pages}</Text>
                                        <Button size="sm" onClick={() => fetchEscrowsPage(Math.min(escrowsPageInfo.pages, escrowsPageInfo.page + 1), escrowsPageInfo.limit)} isDisabled={escrowsPageInfo.page >= escrowsPageInfo.pages || escrowsLoading}>Next</Button>
                                    </HStack>
                                </Flex>
                            </Box>
                        )}
                    </CardBody>
                </Card>

                {/* Wallet Fundings Table */}
                <Card>
                    <CardHeader>
  <VStack spacing={3} align="stretch">
    <Heading size="sm">Wallet Fundings</Heading>
    <HStack spacing={2}>
      <InputGroup maxW="320px">
        <Input
          placeholder="Search by reference or wallet ID..."
          value={walletFundingSearch}
          onChange={(e) => setWalletFundingSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleWalletFundingSearch()}
        />
        {walletFundingSearch && (
          <InputRightElement>
            <CloseButton size="sm" onClick={handleWalletFundingClear} />
          </InputRightElement>
        )}
      </InputGroup>
      <Button size="sm" colorScheme="teal" onClick={handleWalletFundingSearch}>Search</Button>
      <Button size="sm" variant="outline" onClick={handleWalletFundingClear}>Clear</Button>
    </HStack>
  </VStack>
</CardHeader>
                    <CardBody>
                        {walletLoading || loading ? (
                            <Spinner />
                        ) : (
                            <Box>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th></Th>
                                                <Th>_id</Th>
                                                <Th>amount</Th>
                                                <Th>netAmount</Th>
                                                <Th>fee</Th>
                                                <Th>status</Th>
                                                <Th>reference</Th>
                                                <Th>wallet</Th>
                                                <Th>user</Th>
                                                <Th>createdAt</Th>
                                                <Th>completedAt</Th>
                                                <Th>metadata</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {walletFundings.length === 0 && (
                                                <Tr><Td colSpan={12}>No wallet fundings found</Td></Tr>
                                            )}
                                            {walletPaginated.map((w, idx) => {
                                                const id = w._id ?? w.id ?? ((walletCurrentPage - 1) * walletPageSize) + idx;
                                                const isOpen = walletExpandedIds.includes(id);
                                                return (
                                                    <React.Fragment key={id}>
                                                        <Tr>
                                                            <Td>
                                                                <IconButton size="sm" variant="ghost" aria-label={isOpen ? 'collapse' : 'expand'} icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />} onClick={() => toggleWalletExpanded(id)} />
                                                            </Td>
                                                            <Td>{w._id ?? w.id ?? `#${(walletCurrentPage - 1) * walletPageSize + idx + 1}`}</Td>
                                                            <Td>{formatCurrency((w.amount ?? w.value ?? 0) / 100)}</Td>
                                                            <Td>{formatCurrency((w.netAmount ?? 0) / 100)}</Td>
                                                            <Td>{formatCurrency((w.fee ?? 0) / 100)}</Td>
                                                            <Td><Badge colorScheme={w.status === 'failed' ? 'red' : w.status === 'completed' ? 'green' : 'gray'}>{w.status ?? 'unknown'}</Badge></Td>
                                                            <Td>{w.reference ?? '—'}</Td>
                                                            <Td>{renderJSONShort(w.wallet)}</Td>
                                                            <Td>{renderJSONShort(w.user)}</Td>
                                                            <Td>{w.createdAt ? new Date(w.createdAt).toLocaleString() : '—'}</Td>
                                                            <Td>{w.completedAt ? new Date(w.completedAt).toLocaleString() : '—'}</Td>
                                                            <Td>{renderJSONShort(w.metadata)}</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td colSpan={12} p={0}>
                                                                <Collapse in={isOpen} animateOpacity>
                                                                    <Box p={3} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                                                                        <Box as="pre" whiteSpace="pre-wrap" fontSize="12px">{JSON.stringify(w, null, 2)}</Box>
                                                                    </Box>
                                                                </Collapse>
                                                            </Td>
                                                        </Tr>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                <Flex mt={3} justify="space-between" align="center">
                                    <HStack spacing={3}>
                                        <Text fontSize="sm">Rows per page:</Text>
                                        <Select size="sm" width="80px" value={String(walletPageSize)} onChange={(e) => { const nextLimit = Number(e.target.value); setWalletPageSize(nextLimit); setWalletCurrentPage(1); fetchWalletFundingsPage(1, nextLimit); }}>
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                        </Select>
                                        <Text fontSize="sm" color="gray.600">Showing {walletPageInfo.total === 0 ? 0 : ((walletPageInfo.page - 1) * walletPageInfo.limit + 1)} - {Math.min(walletPageInfo.page * walletPageInfo.limit, walletPageInfo.total)} of {walletPageInfo.total}</Text>
                                    </HStack>

                                    <HStack>
                                        <Button size="sm" onClick={() => fetchWalletFundingsPage(Math.max(1, walletCurrentPage - 1), walletPageSize)} isDisabled={walletCurrentPage <= 1}>Prev</Button>
                                        <Text fontSize="sm">Page {walletCurrentPage} / {walletTotalPages}</Text>
                                        <Button size="sm" onClick={() => fetchWalletFundingsPage(Math.min(walletTotalPages, walletCurrentPage + 1), walletPageSize)} isDisabled={walletCurrentPage >= walletTotalPages}>Next</Button>
                                    </HStack>
                                </Flex>
                            </Box>
                        )}
                    </CardBody>
                </Card>


                {/* Reconciliation Data */}
                <Card>
                    <CardHeader>
                        <Heading size="sm">Finance Reconciliation</Heading>
                    </CardHeader>
                    <CardBody>
                        {/* Checked stats */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                            {Object.entries(checked).map(([key, value]) => (
                                <Stat key={key} p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                                    <StatLabel textTransform="capitalize">{key}</StatLabel>
                                    <StatNumber color={value > 0 ? "teal.600" : "gray.500"}>{value}</StatNumber>
                                </Stat>
                            ))}
                        </SimpleGrid>

                        {/* Other counts */}
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                            <Stat>
                                <StatLabel>Recovered Wallet Fundings</StatLabel>
                                <StatNumber>{reconciliation?.recoveredWalletFundings ?? 0}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Issue Count</StatLabel>
                                <StatNumber color="orange.500">{reconciliation?.issueCount ?? 0}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Critical Issues</StatLabel>
                                <StatNumber color="red.500">{reconciliation?.criticalCount ?? 0}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>High Issues</StatLabel>
                                <StatNumber color="pink.500">{reconciliation?.highCount ?? 0}</StatNumber>
                            </Stat>
                        </SimpleGrid>

                        {/* Escrow Issues table */}
                        <Heading size="sm" mb={3}>Escrow Issues</Heading>
                        {escrowIssues.length === 0 ? (
                            <Text color="gray.500">No escrow issues found</Text>
                        ) : (
                            <TableContainer mb={8}>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Escrow ID</Th>
                                            <Th>Message</Th>
                                            <Th>Reference</Th>
                                            <Th>Severity</Th>
                                            <Th>Status</Th>
                                            <Th>Type</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {escrowIssues.map((issue, idx) => {
                                            const key = issue?.reference || issue?.escrowId || issue?.id || issue?.type || idx;
                                            const isResolved = (issue?.status || '').toLowerCase() === 'resolved' || resolvedIssueRefs.includes(key);

                                            return (
                                                <Tr key={key}>
                                                    <Td>{issue?.escrowId ?? issue?.escrow_id ?? '—'}</Td>
                                                    <Td>{issue?.message ?? issue?.description ?? 'n/a'}</Td>
                                                    <Td>{issue?.reference ?? '—'}</Td>
                                                    <Td>
                                                        <Badge colorScheme={
                                                            (issue?.severity || '').toLowerCase() === 'critical' ? 'red' :
                                                                (issue?.severity || '').toLowerCase() === 'high' ? 'orange' :
                                                                    (issue?.severity || '').toLowerCase() === 'medium' ? 'yellow' : 'gray'
                                                        }>
                                                            {issue?.severity ?? 'n/a'}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={isResolved ? 'green' : 'blue'}>
                                                            {isResolved ? 'resolved' : (issue?.status ?? 'open')}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{issue?.type ?? '—'}</Td>
                                                    <Td>
                                                        <Button
                                                            size="sm"
                                                            colorScheme={isResolved ? 'gray' : 'green'}
                                                            variant={isResolved ? 'outline' : 'solid'}
                                                            isDisabled={isResolved}
                                                            onClick={() => handleResolveIssue(issue)}
                                                        >
                                                            {isResolved ? 'Resolved' : 'Resolve'}
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Wallet Funding Issues table */}
                        <Heading size="sm" mb={3}>Wallet Funding Issues</Heading>
                        {fundingIssues.length === 0 ? (
                            <Text color="gray.500">No wallet funding issues found</Text>
                        ) : (
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Funding ID</Th>
                                            <Th>Error</Th>
                                            <Th>Reference</Th>
                                            <Th>Status</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {fundingIssues.map((issue, idx) => {
                                            const key = issue?.reference || issue?.fundingId || issue?.id || issue?.type || idx;
                                            const isResolved = (issue?.status || '').toLowerCase() === 'resolved' || resolvedFundingIssueRefs.includes(key);

                                            return (
                                                <Tr key={key}>
                                                    <Td>{issue?.fundingId ?? '—'}</Td>
                                                    <Td>{issue?.error ?? issue?.message ?? 'n/a'}</Td>
                                                    <Td>{issue?.reference ?? '—'}</Td>
                                                    <Td>
                                                        <Badge colorScheme={isResolved ? 'green' : 'orange'}>
                                                            {isResolved ? 'resolved' : (issue?.status ?? 'open')}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Button
                                                            size="sm"
                                                            colorScheme={isResolved ? 'gray' : 'green'}
                                                            variant={isResolved ? 'outline' : 'solid'}
                                                            isDisabled={isResolved}
                                                            onClick={() => handleResolveFundingIssue(issue)}
                                                        >
                                                            {isResolved ? 'Resolved' : 'Resolve'}
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardBody>
                </Card>
            </VStack>
            <AdminNavbar active="Finance" />
        </Box>
    );
}
