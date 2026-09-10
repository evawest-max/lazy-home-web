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
    getWithdrawals,
} from '../../../../api';

const COLORS = ["#3182CE", "#38A169", "#E53E3E", "#D69E2E", "#805AD5"];

export default function AdminFinancialSummary() {
    const [summary, setSummary] = useState({});
    const [withdrawals, setWithdrawals] = useState([]);
    const [escrows, setEscrows] = useState([]);
    const [escrowsLoading, setEscrowsLoading] = useState(false);
    const [escrowsPageInfo, setEscrowsPageInfo] = useState({ page: 1, limit: 6, pages: 1, total: 0 });
    const [reconciliation, setReconciliation] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const asArray = (v) => {
        if (!v) return [];
        return Array.isArray(v) ? v : typeof v === 'object' ? Object.values(v) : [v];
    };

    // Fetch a specific page of escrows (supports APIs that accept page & limit)
    const fetchEscrowsPage = async (page = 1, limit = 6) => {
        setEscrowsLoading(true);
        try {
            const res = await getEscrows({ page, limit });
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

    // pagination state for withdrawals table
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const totalPages = Math.max(1, Math.ceil((withdrawals?.length ?? 0) / pageSize));
    const paginatedWithdrawals = withdrawals.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const [expandedIds, setExpandedIds] = useState([]);

    const [escrowsExpandedIds, setEscrowsExpandedIds] = useState([]);

    const toggleEscrowExpanded = (id) => {
        setEscrowsExpandedIds((prev) => {
            const exists = prev.includes(id);
            if (exists) return prev.filter((x) => x !== id);
            return [...prev, id];
        });
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
                const [summaryRes, withdrawalsRes, escrowsRes, reconciliationRes] = await Promise.all([
                    getfinancialSummary(),
                    getWithdrawals(),
                    getEscrows(),
                    getFinanceReconcilation(),
                ]);

                const summaryData = summaryRes?.data?.data ?? summaryRes?.data ?? summaryRes ?? {};
                const withdrawalData = withdrawalsRes?.data?.data ?? withdrawalsRes?.data ?? withdrawalsRes ?? {};
                const escrowData = escrowsRes?.data?.data ?? escrowsRes?.data ?? escrowsRes ?? {};
                const reconciliationData = reconciliationRes?.data?.data ?? reconciliationRes?.data ?? reconciliationRes ?? {};
                console.log('Fetched financial data:', { summaryData, withdrawalData, escrowData, reconciliationData });
                setSummary(summaryData);
                setWithdrawals(asArray(withdrawalData?.withdrawals ?? withdrawalData?.items ?? withdrawalData?.data ?? withdrawalData));
                // process escrows response: items + pagination if present
                const escItems = asArray(escrowData?.escrows ?? escrowData?.items ?? escrowData?.data ?? escrowData);
                const escPageInfo = {
                    page: escrowData?.page ?? escrowData?.pagination?.page ?? escrowsPageInfo.page,
                    limit: escrowData?.limit ?? escrowData?.pagination?.limit ?? escrowsPageInfo.limit,
                    pages: escrowData?.pages ?? escrowData?.pagination?.pages ?? Math.max(1, Math.ceil((escrowData?.total ?? escItems.length) / (escrowData?.limit ?? escrowsPageInfo.limit))),
                    total: escrowData?.total ?? escrowData?.pagination?.total ?? escItems.length,
                };
                setEscrows(escItems);
                setEscrowsPageInfo(escPageInfo);
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
        totalEscrow: summary?.escrows?.active ?? summary?.totalEscrows ?? 0,
        totalWithdrawals: summary?.withdrawals?.pending ?? summary?.totalWithdrawals ?? 0,
        totalCommissions: summary?.commissions?.pending ?? 0,
        totalBonuses: summary?.bonuses?.pending ?? 0,
    };

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
        <Box p={6} bg="gray.50" minH="100vh">
            <VStack spacing={6} align="stretch">
                <Flex align="center" justify="space-between">
                    <Heading size="lg" color="teal.600">Admin Financial Dashboard</Heading>
                    <HStack>
                        <Button colorScheme="teal" size="sm">Refresh</Button>
                    </HStack>
                </Flex>

                {/* Summary Cards */}
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    {Object.entries(totals).map(([key, value]) => (
                        <Card key={key} shadow="md" borderRadius="lg">
                            <CardHeader>
                                <Text fontSize="sm" color="gray.500">{value} Pending {key.replace('total', '')}</Text>
                            </CardHeader>
                            <CardBody>
                                <Heading size="md">{formatCurrency(value)}</Heading>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                {/* Charts Section */}
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
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
                </Grid>

                {/* Recent Withdrawals Table */}
                <Card>
                    <CardHeader><Heading size="sm">Recent Withdrawals</Heading></CardHeader>
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
                                            const id = w._id ?? w.id ?? ((currentPage - 1) * pageSize) + idx;
                                            const isOpen = expandedIds.includes(id);
                                            return (
                                                <>
                                                    <Tr key={id}>
                                                        <Td>
                                                            <IconButton size="sm" variant="ghost" aria-label={isOpen ? 'collapse' : 'expand'} icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />} onClick={() => toggleExpanded(id)} />
                                                        </Td>
                                                        <Td>{w._id ?? w.id ?? `#${(currentPage - 1) * pageSize + idx + 1}`}</Td>
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
                                                        <Td>{w.wallet ?? '—'}</Td>
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
                                <Select size="sm" width="80px" value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                </Select>
                                <Text fontSize="sm" color="gray.600">Showing {(withdrawals.length === 0) ? 0 : ((currentPage - 1) * pageSize + 1)} - {Math.min(currentPage * pageSize, withdrawals.length)} of {withdrawals.length}</Text>
                            </HStack>

                            <HStack>
                                <Button size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} isDisabled={currentPage <= 1}>Prev</Button>
                                <Text fontSize="sm">Page {currentPage} / {totalPages}</Text>
                                <Button size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} isDisabled={currentPage >= totalPages}>Next</Button>
                            </HStack>
                        </Flex>
                        </Box>
                        )}
                    </CardBody>
                </Card>

                {/* Escrows List */}
                    <Card>
                        <CardHeader><Heading size="sm">Escrows</Heading></CardHeader>
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

                        {/* Issues table */}
                        <Heading size="sm" mb={3}>Issues</Heading>
                        {(!reconciliation?.issues || reconciliation.issues.length === 0) ? (
                            <Text color="gray.500">No issues found</Text>
                        ) : (
                            <Table variant="striped" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>ID</Th>
                                        <Th>Description</Th>
                                        <Th>Severity</Th>
                                        <Th>Date</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {reconciliation.issues.map((issue, idx) => (
                                        <Tr key={issue.id ?? idx}>
                                            <Td>{issue.id ?? `#${idx + 1}`}</Td>
                                            <Td>{issue.description ?? "n/a"}</Td>
                                            <Td>{issue.severity ?? "n/a"}</Td>
                                            <Td>{new Date(issue.date ?? Date.now()).toLocaleString()}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
}
