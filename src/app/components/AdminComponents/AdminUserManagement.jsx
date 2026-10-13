import {
    Box, SimpleGrid, Card, CardHeader, CardBody, Heading, Text, Badge, Table, Thead, Tbody, Tr, Th, Td, VStack, Flex, Spinner, Stat, StatLabel, StatNumber, StatHelpText, Progress, Button, Input, Select, HStack, TableContainer, IconButton
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, } from "recharts";
import AdminNavbar from "./AdminNavbar";
import { getAdminModerationDashboardSummary, getAuditLogs } from "../../../../api";

const formatNumber = (value) => Number(value ?? 0).toLocaleString();
const formatMoney = (value) => Number(value ?? 0).toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const formatCompactMoney = (value) => Number(value ?? 0).toLocaleString("en-NG", { style: "currency", currency: "NGN", notation: "compact", maximumFractionDigits: 1 });

export default function AdminUserManagementDashboard({ onLogout, user }) {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState({ summary: null, growth: null, financial: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // AUDIT STATES - NEW
    const [audits, setAudits] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditFilters, setAuditFilters] = useState({ action: '', targetType: '', search: '', from: '', to: '' });
    const [auditPagination, setAuditPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try {
                setLoading(true); setError('');
                const res = await getAdminModerationDashboardSummary();
                const payload = res?.data?.data ?? res?.data ?? res ?? {};
                console.log('Dashboard summary payload:', payload);
                setDashboard({
                    summary: payload?.summary ?? {},
                    growth: payload?.growth ?? {},
                    financial: payload?.financial ?? {},
                    reviews: payload?.reviews ?? {},
                    properties: payload?.properties ?? {},
                    disputes: payload?.disputes ?? {},
                    verification: payload?.verification ?? {},
                    escrows: payload?.escrows ?? {},
                    tenancies: payload?.tenancies ?? {},
                });
                // init audits from summary for first load
                setAudits(payload?.summary?.recentAudits ?? []);
            } catch (err) {
                setError('Unable to load dashboard summary. Please try again.');
            } finally { setLoading(false); }
        };
        fetchDashboardSummary();
    }, []);

    // AUDIT FETCH - NEW
    const fetchAudits = async (page = 1) => {
        setAuditLoading(true);
        try {
            const params = {
                page,
                limit: auditPagination.limit,
                ...(auditFilters.action && { action: auditFilters.action }),
                ...(auditFilters.targetType && { targetType: auditFilters.targetType }),
                ...(auditFilters.search && { search: auditFilters.search }),
                ...(auditFilters.from && { from: auditFilters.from }),
                ...(auditFilters.to && { to: auditFilters.to }),
            };
            const res = await getAuditLogs(params);
            const payload = res?.data?.data ?? res?.data ?? {};
            setAudits(payload?.logs ?? []);
            if (payload?.pagination) setAuditPagination(payload.pagination);
        } catch (e) { console.error('Audit fetch failed', e); } finally { setAuditLoading(false); }
    };

    useEffect(() => { fetchAudits(1); }, [auditFilters.action, auditFilters.targetType]);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => { fetchAudits(1); }, 600);
        return () => clearTimeout(t);
    }, [auditFilters.search, auditFilters.from, auditFilters.to]);

    const summary = dashboard.summary ?? {};
    const users = summary.users ?? {};
    const propertyData = dashboard.properties ?? summary.properties ?? {};
    const propertyListingStatus = propertyData.byListingStatus ?? {};
    const propertyVerificationStatus = propertyData.byVerificationStatus ?? {};
    const propertyRentStats = propertyData.rent ?? {};
    const properties = {
        total: Number(propertyData.total ?? propertyData.totals?.total ?? propertyData.recent?.length ?? 0),
        available: Number(propertyListingStatus.available ?? propertyData.totals?.available ?? 0),
        rented: Number(propertyListingStatus.rented ?? propertyData.totals?.rented ?? 0),
        pending: Number(propertyListingStatus.under_offer ?? propertyData.totals?.pending ?? 0),
        rejected: Number(propertyVerificationStatus.rejected ?? 0),
        archived: Number(propertyListingStatus.archived ?? 0),
        deleted: Number(propertyData.deleted ?? 0),
        featured: Number(propertyData.featured ?? 0),
        averageRent: Number(propertyRentStats.average ?? 0),
        totalValue: Number(propertyRentStats.totalValue ?? 0),
        totalViews: Number(propertyRentStats.totalViews ?? 0),
    };
    const financial = summary.financial ?? {};
    const disputes = summary.disputes ?? {};
    const verification = summary.verification ?? {};
    const escrows = summary.escrows ?? {};
    const tenancy = summary.tenancies ?? {};
    const reviewData = dashboard.reviews ?? {};
    const appReviewData = reviewData.appReviews ?? {};
    const landlordReviewData = reviewData.landlordReviews ?? {};
    const reviewMetrics = summary.reviews ?? summary.reviewStats ?? {};
    const userRoleData = Array.isArray(users.byRole) ? users.byRole : [];
    const disputeTypeData = Array.isArray(disputes.byType) ? disputes.byType : [];
    const monthlyUsers = Array.isArray(dashboard.growth?.monthlyUsers) ? dashboard.growth.monthlyUsers : [];
    const monthlyProperties = Array.isArray(dashboard.growth?.monthlyProperties) ? dashboard.growth.monthlyProperties : [];

    const revenueGrowthData = useMemo(() => {
        const data = [...monthlyUsers].map((item) => ({ month: item?._id?.month ? `M${item._id.month}` : 'N/A', users: item?.count ?? 0 }));
        return data.length ? data : [{ month: 'Current', users: users.total ?? 0 }];
    }, [monthlyUsers, users.total]);

    const propertyGrowthData = useMemo(() => {
        const data = [...monthlyProperties].map((item) => ({ month: item?._id?.month ? `M${item._id.month}` : 'N/A', properties: item?.count ?? 0 }));
        return data.length ? data : [{ month: 'Current', properties: properties.total ?? 0 }];
    }, [monthlyProperties, properties.total]);

    const appReviewTotal = Number(appReviewData.total ?? appReviewData.publishedCount ?? appReviewData.recent?.length ?? 0);
    const landlordReviewTotal = Number(landlordReviewData.total ?? landlordReviewData.publishedCount ?? landlordReviewData.recent?.length ?? 0);

    const summaryCards = [
        { label: 'Total Users', value: formatNumber(users.total), helper: `${formatNumber(users.newThisMonth)} new this month`, accent: 'teal' },
        { label: 'Verified Users', value: formatNumber(users.verified), helper: `${formatNumber(users.suspended)} suspended`, accent: 'green' },
        { label: 'Total Properties', value: formatNumber(properties.total), helper: `${formatNumber(properties.pending)} pending`, accent: 'purple' },
        { label: 'Active Escrows', value: formatNumber(escrows.active), helper: formatMoney(escrows.heldAmount), accent: 'orange' },
        { label: 'App Reviews', value: formatNumber(appReviewTotal), helper: `Avg ${Number(appReviewData.averageRating ?? 0).toFixed(1)}/5 • ${formatNumber(appReviewData.byStatus?.published ?? 0)} published`, accent: 'pink' },
        { label: 'Landlord Reviews', value: formatNumber(landlordReviewTotal), helper: `Avg ${Number(landlordReviewData.averageRating ?? 0).toFixed(1)}/5 • ${formatNumber(landlordReviewData.byStatus?.published ?? 0)} published`, accent: 'amber' },
        { label: 'Open Disputes', value: formatNumber(disputes.open), helper: `${formatNumber(disputes.total)} total disputes`, accent: 'red' },
        { label: 'Wallet Balance', value: formatCompactMoney(financial.walletBalance/100), helper: `${formatNumber(financial.frozenWallets)} frozen wallets`, accent: 'cyan' },
    ];

    if (loading) { return (<Box p={6} bg="brand.background" minH="100vh" display="flex" alignItems="center" justifyContent="center"><Spinner size="lg" color="teal.500" /></Box>); }
    if (error) { return (<Box p={6} bg="brand.background" minH="100vh" pb={20}><Card border="1px solid" borderColor="red.200" bg="red.50"><CardBody><Text color="red.600">{error}</Text></CardBody></Card><AdminNavbar active="User Management" /></Box>); }

    return (
        <Box p={6} bg="brand.background" minH="100vh" mb={2} pb={58}>
            <VStack spacing={6} align="stretch">
                <Box><Heading mb={2} color="teal.600">Moderation Dashboard</Heading><Text color="gray.600">Operational overview of users, properties, verification, financial health, Reviews and fraud activity.</Text></Box>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                    {summaryCards.map((card) => (
                        <Card key={card.label} borderLeft="4px solid" borderLeftColor={`${card.accent}.500`} shadow="sm" cursor={card.label === 'Total Users' || card.label === 'Total Properties' || card.label === 'Verified Users' || card.label === 'App Reviews' || card.label === 'Landlord Reviews' ? 'pointer' : 'default'} onClick={card.label === 'Total Users' ? () => navigate('/all-users') : card.label === 'Total Properties' ? () => navigate('/all-properties') : card.label === 'Verified Users' ? () => navigate('/admin-user-verification') : card.label === 'App Reviews' ? () => navigate('/admin-app-reviews') : card.label === 'Landlord Reviews' ? () => navigate('/admin-landlord-reviews') : undefined} _hover={card.label === 'Total Users' || card.label === 'Total Properties' || card.label === 'Verified Users' || card.label === 'App Reviews' || card.label === 'Landlord Reviews' ? { transform: 'translateY(-1px)', boxShadow: 'md' } : undefined}>
                            <CardBody><Stat><StatLabel>{card.label}</StatLabel><StatNumber fontSize="2xl" mt={2}>{card.value}</StatNumber><StatHelpText>{card.helper}</StatHelpText></Stat></CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                    <Card><CardHeader><Heading size="sm">User Growth</Heading></CardHeader><CardBody h="320px"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenueGrowthData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="users" stroke="#38A169" strokeWidth={3} /></LineChart></ResponsiveContainer></CardBody></Card>
                    <Card><CardHeader><Heading size="sm">Property Growth</Heading></CardHeader><CardBody h="320px"><ResponsiveContainer width="100%" height="100%"><BarChart data={propertyGrowthData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="properties" fill="#805AD5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardBody></Card>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
                    <Card><CardHeader><Heading size="sm">User Distribution</Heading></CardHeader><CardBody><VStack align="stretch" spacing={3}>{userRoleData.map((role) => (<Box key={role._id}><Flex justify="space-between" mb={1}><Text textTransform="capitalize">{role._id}</Text><Text fontWeight="bold">{formatNumber(role.count)}</Text></Flex><Progress value={Math.min(100, ((role.count ?? 0) / (users.total || 1)) * 100)} colorScheme="teal" /></Box>))}</VStack></CardBody></Card>
                    <Card><CardHeader><Heading size="sm">Property Status</Heading></CardHeader><CardBody><VStack align="stretch" spacing={3}>{[{ label: 'Available', value: properties.available }, { label: 'Rented', value: properties.rented }, { label: 'Under Offer', value: properties.pending }, { label: 'Rejected', value: properties.rejected }, { label: 'Archived', value: properties.archived }].map((item) => (<Flex key={item.label} justify="space-between" align="center"><Text>{item.label}</Text><Badge colorScheme={item.label === 'Under Offer' ? 'orange' : item.label === 'Rejected' ? 'red' : item.label === 'Archived' ? 'gray' : 'green'}>{formatNumber(item.value)}</Badge></Flex>))}</VStack></CardBody></Card>
                    <Card><CardHeader><Heading size="sm">Dispute Breakdown</Heading></CardHeader><CardBody><VStack align="stretch" spacing={3}>{disputeTypeData.map((type) => (<Flex key={type._id} justify="space-between" align="center"><Text textTransform="replace">{type._id.replace(/_/g, ' ')}</Text><Badge colorScheme="red">{formatNumber(type.count)}</Badge></Flex>))}</VStack></CardBody></Card>
                </SimpleGrid>

                <Card>
                    <CardHeader><Heading size="sm">Property Insights</Heading></CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                                <Text fontSize="xs" color="gray.500">Total properties</Text>
                                <Text fontSize="2xl" fontWeight="bold">{formatNumber(properties.total)}</Text>
                            </Box>
                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                                <Text fontSize="xs" color="gray.500">Average rent</Text>
                                <Text fontSize="2xl" fontWeight="bold">{formatMoney(properties.averageRent)}</Text>
                            </Box>
                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                                <Text fontSize="xs" color="gray.500">Total value</Text>
                                <Text fontSize="2xl" fontWeight="bold">{formatMoney(properties.totalValue)}</Text>
                            </Box>
                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                                <Text fontSize="xs" color="gray.500">Total views</Text>
                                <Text fontSize="2xl" fontWeight="bold">{formatNumber(properties.totalViews)}</Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader><Heading size="sm">Review Insights</Heading></CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                                <Text fontSize="xs" color="gray.500" mb={2}>App Reviews</Text>
                                <Text fontSize="2xl" fontWeight="bold">{formatNumber(appReviewTotal)}</Text>
                                <Text fontSize="sm" color="gray.600" mt={2}>Average rating: {Number(appReviewData.averageRating ?? 0).toFixed(1)}/5</Text>
                                <HStack mt={3} spacing={3} wrap="wrap">
                                    <Badge colorScheme="green">Published: {formatNumber(appReviewData.byStatus?.published ?? 0)}</Badge>
                                    <Badge colorScheme="gray">Hidden: {formatNumber(appReviewData.byStatus?.hidden ?? 0)}</Badge>
                                    <Badge colorScheme="red">Flagged: {formatNumber(appReviewData.byStatus?.flagged ?? 0)}</Badge>
                                </HStack>
                            </Box>
                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                                <Text fontSize="xs" color="gray.500" mb={2}>Landlord Reviews</Text>
                                <Text fontSize="2xl" fontWeight="bold">{formatNumber(landlordReviewTotal)}</Text>
                                <Text fontSize="sm" color="gray.600" mt={2}>Average rating: {Number(landlordReviewData.averageRating ?? 0).toFixed(1)}/5</Text>
                                <HStack mt={3} spacing={3} wrap="wrap">
                                    <Badge colorScheme="green">Published: {formatNumber(landlordReviewData.byStatus?.published ?? 0)}</Badge>
                                    <Badge colorScheme="gray">Hidden: {formatNumber(landlordReviewData.byStatus?.hidden ?? 0)}</Badge>
                                    <Badge colorScheme="red">Flagged: {formatNumber(landlordReviewData.byStatus?.flagged ?? 0)}</Badge>
                                </HStack>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                    <Card><CardHeader><Heading size="sm">Financial Overview</Heading></CardHeader><CardBody><VStack align="stretch" spacing={4}><Flex justify="space-between"><Text>Total wallet balance</Text><Text fontWeight="bold">{formatMoney(financial.walletBalance/100)}</Text></Flex><Flex justify="space-between"><Text>Pending withdrawals</Text><Text fontWeight="bold">{formatNumber(dashboard.financial?.withdrawals?.pending?.count ?? summary.financial?.pendingWithdrawals ?? 0)}</Text></Flex><Flex justify="space-between"><Text>Held in escrows</Text><Text fontWeight="bold">{formatMoney(escrows.heldAmount)}</Text></Flex><Flex justify="space-between"><Text>Active tenancies</Text><Text fontWeight="bold">{formatNumber(tenancy.active)}</Text></Flex></VStack></CardBody></Card>
                    <Card><CardHeader><Heading size="sm">Verification & Moderation</Heading></CardHeader><CardBody><VStack align="stretch" spacing={4}><Flex justify="space-between"><Text>Pending verifications</Text><Text fontWeight="bold">{formatNumber(verification.pending)}</Text></Flex><Flex justify="space-between"><Text>Pending withdrawals</Text><Text fontWeight="bold">{formatNumber(financial.pendingWithdrawals ?? summary.financial?.pendingWithdrawals ?? 0)}</Text></Flex><Flex justify="space-between"><Text>Suspended users</Text><Text fontWeight="bold">{formatNumber(users.suspended)}</Text></Flex><Flex justify="space-between"><Text>Frozen wallets</Text><Text fontWeight="bold">{formatNumber(financial.frozenWallets)}</Text></Flex><Flex justify="space-between"><Text>Available properties</Text><Text fontWeight="bold">{formatNumber(properties.available)}</Text></Flex></VStack></CardBody></Card>
                </SimpleGrid>

                {/* UPDATED AUDIT CARD ONLY */}
                <Card>
                    <CardHeader>
                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                            <Heading size="sm">Recent Admin Audits</Heading>
                            <Button size="xs" variant="outline" onClick={() => fetchAudits(auditPagination.page)} isLoading={auditLoading}>Refresh</Button>
                        </Flex>
                        {/* FILTERS */}
                        <Flex mt={4} gap={2} flexWrap="wrap">
                            <Input size="sm" placeholder="Search action, reason, email..." value={auditFilters.search} onChange={(e) => setAuditFilters(prev => ({ ...prev, search: e.target.value }))} maxW="260px" />
                            <Select size="sm" value={auditFilters.action} onChange={(e) => setAuditFilters(prev => ({ ...prev, action: e.target.value }))} maxW="180px">
                                <option value="">All Actions</option>
                                <option value="VERIFICATION_APPROVED">VERIFICATION_APPROVED</option>
                                <option value="VERIFICATION_REJECTED">VERIFICATION_REJECTED</option>
                                <option value="USER_SUSPEND">USER_SUSPEND</option>
                                <option value="WALLET_FREEZE">WALLET_FREEZE</option>
                                <option value="PROPERTY_APPROVED">PROPERTY_APPROVED</option>
                            </Select>
                            <Select size="sm" value={auditFilters.targetType} onChange={(e) => setAuditFilters(prev => ({ ...prev, targetType: e.target.value }))} maxW="160px">
                                <option value="">All Targets</option>
                                <option value="Verification">Verification</option>
                                <option value="User">User</option>
                                <option value="Property">Property</option>
                                <option value="Wallet">Wallet</option>
                                <option value="Dispute">Dispute</option>
                            </Select>
                            <Input size="sm" type="date" value={auditFilters.from} onChange={(e) => setAuditFilters(prev => ({ ...prev, from: e.target.value }))} maxW="150px" />
                            <Input size="sm" type="date" value={auditFilters.to} onChange={(e) => setAuditFilters(prev => ({ ...prev, to: e.target.value }))} maxW="150px" />
                            <Button size="sm" variant="ghost" onClick={() => setAuditFilters({ action: '', targetType: '', search: '', from: '', to: '' })}>Clear</Button>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        {auditLoading ? (
                            <Flex justify="center" py={8}><Spinner /></Flex>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead><Tr><Th>Date</Th><Th>Admin</Th><Th>Action</Th><Th>Target</Th><Th>Meta</Th></Tr></Thead>
                                        <Tbody>
                                            {audits.length ? audits.map((audit) => (
                                                <Tr key={audit._id}>
                                                    <Td fontSize="xs" whiteSpace="nowrap">{new Date(audit.createdAt).toLocaleString('en-NG')}</Td>
                                                    <Td><VStack align="start" spacing={0}><Text fontSize="sm" fontWeight="600">{audit.admin?.fullName || 'System'}</Text><Text fontSize="xs" color="gray.500">{audit.admin?.email || ''}</Text></VStack></Td>
                                                    <Td><Badge colorScheme={audit.action?.includes('APPROVED') ? 'green' : audit.action?.includes('REJECTED') || audit.action?.includes('SUSPEND') || audit.action?.includes('FREEZE') ? 'red' : 'teal'}>{audit.action}</Badge></Td>
                                                    <Td><Text fontSize="xs">{audit.targetType}</Text><Text fontSize="xs" color="gray.500" isTruncated maxW="120px">{audit.targetId}</Text><Text fontSize="xs" color="gray.500">{audit.metadata?.verificationType ? `• ${audit.metadata.verificationType}` : ''} {audit.metadata?.newStatus ? `→ ${audit.metadata.newStatus}` : ''}</Text></Td>
                                                    <Td><Text fontSize="xs" maxW="200px" isTruncated>{audit.metadata?.userEmail || audit.metadata?.reason || '-'}</Text></Td>
                                                </Tr>
                                            )) : (
                                                <Tr><Td colSpan={5}><Text color="gray.500" textAlign="center" py={4}>No audit events match filters.</Text></Td></Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                {/* PAGINATION */}
                                <Flex mt={4} justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                    <Text fontSize="sm" color="gray.600">
                                        Page {auditPagination.page} of {auditPagination.pages} • {auditPagination.total} total logs
                                    </Text>
                                    <HStack>
                                        <Select size="sm" value={auditPagination.limit} onChange={(e) => { setAuditPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 })); setTimeout(() => fetchAudits(1), 0); }} w="80px">
                                            <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                                        </Select>
                                        <Button size="sm" variant="outline" isDisabled={auditPagination.page <= 1} onClick={() => fetchAudits(auditPagination.page - 1)}>Prev</Button>
                                        <Button size="sm" variant="outline" isDisabled={auditPagination.page >= auditPagination.pages} onClick={() => fetchAudits(auditPagination.page + 1)}>Next</Button>
                                    </HStack>
                                </Flex>
                            </>
                        )}
                    </CardBody>
                </Card>
            </VStack>
            <AdminNavbar active="User Management" />
        </Box>
    );
}