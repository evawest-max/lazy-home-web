import {
    Box,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    VStack,
    Flex,
    Spinner,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Progress,
    Button,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line,
} from "recharts";
import AdminNavbar from "./AdminNavbar";
import { getAdminModerationDashboardSummary } from "../../../../api";

const formatNumber = (value) => Number(value ?? 0).toLocaleString();

const formatMoney = (value) =>
    Number(value ?? 0).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    });

const formatCompactMoney = (value) =>
    Number(value ?? 0).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        notation: "compact",
        maximumFractionDigits: 1,
    });

export default function AdminUserManagementDashboard({ onLogout, user }) {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState({
        summary: null,
        growth: null,
        financial: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getAdminModerationDashboardSummary();
                const payload = res?.data?.data ?? res?.data ?? res ?? {};
                setDashboard({
                    summary: payload?.summary ?? {},
                    growth: payload?.growth ?? {},
                    financial: payload?.financial ?? {},
                });
            } catch (err) {
                console.error('Failed to load moderation dashboard summary', err);
                setError('Unable to load dashboard summary. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardSummary();
    }, []);

    const summary = dashboard.summary ?? {};
    const users = summary.users ?? {};
    const properties = summary.properties ?? {};
    const financial = summary.financial ?? {};
    const disputes = summary.disputes ?? {};
    const verification = summary.verification ?? {};
    const escrows = summary.escrows ?? {};
    const tenancy = summary.tenancies ?? {};
    const recentAudits = summary.recentAudits ?? [];
    const userRoleData = Array.isArray(users.byRole) ? users.byRole : [];
    const disputeTypeData = Array.isArray(disputes.byType) ? disputes.byType : [];

    const monthlyUsers = Array.isArray(dashboard.growth?.monthlyUsers) ? dashboard.growth.monthlyUsers : [];
    const monthlyProperties = Array.isArray(dashboard.growth?.monthlyProperties) ? dashboard.growth.monthlyProperties : [];

    const revenueGrowthData = useMemo(() => {
        const data = [...monthlyUsers].map((item) => ({
            month: item?._id?.month ? `M${item._id.month}` : 'N/A',
            users: item?.count ?? 0,
        }));
        return data.length ? data : [{ month: 'Current', users: users.total ?? 0 }];
    }, [monthlyUsers, users.total]);

    const propertyGrowthData = useMemo(() => {
        const data = [...monthlyProperties].map((item) => ({
            month: item?._id?.month ? `M${item._id.month}` : 'N/A',
            properties: item?.count ?? 0,
        }));
        return data.length ? data : [{ month: 'Current', properties: properties.total ?? 0 }];
    }, [monthlyProperties, properties.total]);

    const summaryCards = [
        { label: 'Total Users', value: formatNumber(users.total), helper: `${formatNumber(users.newThisMonth)} new this month`, accent: 'teal' },
        { label: 'Verified Users', value: formatNumber(users.verified), helper: `${formatNumber(users.suspended)} suspended`, accent: 'green' },
        { label: 'Total Properties', value: formatNumber(properties.total), helper: `${formatNumber(properties.pending)} pending`, accent: 'purple' },
        { label: 'Active Escrows', value: formatNumber(escrows.active), helper: formatMoney(escrows.heldAmount), accent: 'orange' },
        { label: 'Open Disputes', value: formatNumber(disputes.open), helper: `${formatNumber(disputes.total)} total disputes`, accent: 'red' },
        { label: 'Wallet Balance', value: formatCompactMoney(financial.walletBalance/100), helper: `${formatNumber(financial.frozenWallets)} frozen wallets`, accent: 'cyan' },
    ];

    if (loading) {
        return (
            <Box p={6} bg="brand.background" minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="lg" color="teal.500" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={6} bg="brand.background" minH="100vh" pb={20}>
                <Card border="1px solid" borderColor="red.200" bg="red.50">
                    <CardBody>
                        <Text color="red.600">{error}</Text>
                    </CardBody>
                </Card>
                <AdminNavbar active="User Management" />
            </Box>
        );
    }

    return (
        <Box p={6} bg="brand.background" minH="100vh" mb={2} pb={58}>
            <VStack spacing={6} align="stretch">
                <Box>
                    <Heading mb={2} color="teal.600">Moderation Dashboard</Heading>
                    <Text color="gray.600">Operational overview of users, properties, verification, financial health, and fraud activity.</Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                    {summaryCards.map((card) => (
                        <Card
                            key={card.label}
                            borderLeft="4px solid"
                            borderLeftColor={`${card.accent}.500`}
                            shadow="sm"
                            cursor={card.label === 'Total Users' || card.label === 'Total Properties' ? 'pointer' : 'default'}
                            onClick={
                                card.label === 'Total Users'
                                    ? () => navigate('/all-users')
                                    : card.label === 'Total Properties'
                                        ? () => navigate('/all-properties')
                                        : undefined
                            }
                            _hover={card.label === 'Total Users' || card.label === 'Total Properties' ? { transform: 'translateY(-1px)', boxShadow: 'md' } : undefined}
                        >
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

                <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                    <Card>
                        <CardHeader>
                            <Heading size="sm">User Growth</Heading>
                        </CardHeader>
                        <CardBody h="320px">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="users" stroke="#38A169" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Heading size="sm">Property Growth</Heading>
                        </CardHeader>
                        <CardBody h="320px">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={propertyGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="properties" fill="#805AD5" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
                    <Card>
                        <CardHeader>
                            <Heading size="sm">User Distribution</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={3}>
                                {userRoleData.map((role) => (
                                    <Box key={role._id}>
                                        <Flex justify="space-between" mb={1}>
                                            <Text textTransform="capitalize">{role._id}</Text>
                                            <Text fontWeight="bold">{formatNumber(role.count)}</Text>
                                        </Flex>
                                        <Progress value={Math.min(100, ((role.count ?? 0) / (users.total || 1)) * 100)} colorScheme="teal" />
                                    </Box>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Heading size="sm">Property Status</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={3}>
                                {[
                                    { label: 'Available', value: properties.available },
                                    { label: 'Rented', value: properties.rented },
                                    { label: 'Pending', value: properties.pending },
                                    { label: 'Rejected', value: properties.rejected },
                                ].map((item) => (
                                    <Flex key={item.label} justify="space-between" align="center">
                                        <Text>{item.label}</Text>
                                        <Badge colorScheme={item.label === 'Pending' ? 'orange' : item.label === 'Rejected' ? 'red' : 'green'}>{formatNumber(item.value)}</Badge>
                                    </Flex>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Heading size="sm">Dispute Breakdown</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={3}>
                                {disputeTypeData.map((type) => (
                                    <Flex key={type._id} justify="space-between" align="center">
                                        <Text textTransform="replace">{type._id.replace(/_/g, ' ')}</Text>
                                        <Badge colorScheme="red">{formatNumber(type.count)}</Badge>
                                    </Flex>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                    <Card>
                        <CardHeader>
                            <Heading size="sm">Financial Overview</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <Flex justify="space-between"><Text>Total wallet balance</Text><Text fontWeight="bold">{formatMoney(financial.walletBalance/100)}</Text></Flex>
                                {/* <Flex justify="space-between"><Text>Revenue</Text><Text fontWeight="bold">{formatMoney(financial.revenue?.total ?? financial.revenue)}</Text></Flex> */}
                                <Flex justify="space-between"><Text>Pending withdrawals</Text><Text fontWeight="bold">{formatNumber(dashboard.financial?.withdrawals?.pending?.count ?? summary.financial?.pendingWithdrawals ?? 0)}</Text></Flex>
                                <Flex justify="space-between"><Text>Held in escrows</Text><Text fontWeight="bold">{formatMoney(escrows.heldAmount)}</Text></Flex>
                                <Flex justify="space-between"><Text>Active tenancies</Text><Text fontWeight="bold">{formatNumber(tenancy.active)}</Text></Flex>
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Heading size="sm">Verification & Moderation</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <Flex justify="space-between"><Text>Pending verifications</Text><Text fontWeight="bold">{formatNumber(verification.pending)}</Text></Flex>
                                <Flex justify="space-between"><Text>Pending withdrawals</Text><Text fontWeight="bold">{formatNumber(financial.pendingWithdrawals ?? summary.financial?.pendingWithdrawals ?? 0)}</Text></Flex>
                                <Flex justify="space-between"><Text>Suspended users</Text><Text fontWeight="bold">{formatNumber(users.suspended)}</Text></Flex>
                                <Flex justify="space-between"><Text>Frozen wallets</Text><Text fontWeight="bold">{formatNumber(financial.frozenWallets)}</Text></Flex>
                                <Flex justify="space-between"><Text>Available properties</Text><Text fontWeight="bold">{formatNumber(properties.available)}</Text></Flex>
                            </VStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <Card>
                    <CardHeader>
                        <Heading size="sm">Recent Admin Audits</Heading>
                    </CardHeader>
                    <CardBody>
                        <Table variant="striped" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Admin</Th>
                                    <Th>Action</Th>
                                    <Th>Target</Th>
                                    <Th>Time</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {recentAudits.length ? recentAudits.map((audit) => (
                                    <Tr key={audit._id}>
                                        <Td>{audit.admin?.fullName || 'System'}</Td>
                                        <Td><Badge colorScheme="teal">{audit.action}</Badge></Td>
                                        <Td>{audit.targetType} / {audit.targetId}</Td>
                                        <Td>{new Date(audit.createdAt).toLocaleString()}</Td>
                                    </Tr>
                                )) : (
                                    <Tr>
                                        <Td colSpan={4}><Text color="gray.500">No recent audit events available.</Text></Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>
            </VStack>

            <AdminNavbar active="User Management" />
        </Box>
    );
}
