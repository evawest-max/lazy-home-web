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
    Button,
    VStack,
    Flex,
} from "@chakra-ui/react";
import { useState } from "react";
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

export default function AdminUserManagementDashboard({ onLogout, user }) {
    const [metrics, setMetrics] = useState({
        users: 0,
        properties: 0,
        transactions: 0,
        openDisputes: 0,
        pendingReports: 0,
        pendingVerifications: 0,
        revenue: 0,
    });

    const [verifications, setVerifications] = useState([]);
    const [reports, setReports] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);


    const revenueData = [
        { name: "Revenue", value: metrics.revenue },
    ];
    const disputeReportData = [
        { name: "Disputes", value: metrics.openDisputes },
        { name: "Reports", value: metrics.pendingReports },
    ];
    if (!metrics) {
        return <Spinner />;
    }

    return (
        <Box p={6} bg="brand.background" minH="100vh" mb={2} pb={58}>
            <Heading mb={6} textAlign="center" color="teal.600">
                Admin Dashboard
            </Heading>

            {/* Metrics Overview */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                <Card><CardHeader><Text>Users</Text></CardHeader><CardBody><Heading>{metrics.users}</Heading></CardBody></Card>
                <Card><CardHeader><Text>Properties</Text></CardHeader><CardBody><Heading>{metrics.properties}</Heading></CardBody></Card>
                <Card><CardHeader><Text>Transactions</Text></CardHeader><CardBody><Heading>{metrics.transactions}</Heading></CardBody></Card>
                <Card><CardHeader><Text>Open Disputes</Text></CardHeader><CardBody><Heading color="orange.500">{metrics.openDisputes}</Heading></CardBody></Card>
                <Card><CardHeader><Text>Pending Reports</Text></CardHeader><CardBody><Heading color="pink.500">{metrics.pendingReports}</Heading></CardBody></Card>
                <Card><CardHeader><Text>Pending property Verifications</Text></CardHeader><CardBody><Heading color="purple.500">{metrics.pendingVerifications}</Heading></CardBody></Card>
                {/* <Card><CardHeader><Text>Revenue</Text></CardHeader><CardBody><Heading color="green.600">${metrics.revenue}</Heading></CardBody></Card> */}
            </SimpleGrid>

            {/* Charts */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
                <Card>
                    <CardHeader><Heading size="sm">Revenue</Heading></CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={revenueData}>
                                <XAxis dataKey="name" /><YAxis /><Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#38A169" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader><Heading size="sm">Disputes vs Reports</Heading></CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={disputeReportData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" /><YAxis /><Tooltip />
                                <Bar dataKey="value" fill="#3182CE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Pending Verifications Table */}
            <Card mb={6}>
                <CardHeader><Heading size="sm">Pending Verifications</Heading></CardHeader>
                <CardBody>
                    <Table variant="striped" size="sm">
                        <Thead><Tr><Th>User</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
                        <Tbody>
                            {verifications.map((v) => (
                                <Tr key={v._id}>
                                    <Td>{v.user?.fullName}</Td>
                                    <Td><Badge colorScheme="orange">{v.verificationStatus}</Badge></Td>
                                    <Td><Button size="sm" colorScheme="teal">Review</Button></Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* Pending Reports Table */}
            <Card mb={6}>
                <CardHeader><Heading size="sm">Pending Reports</Heading></CardHeader>
                <CardBody>
                    <Table variant="striped" size="sm">
                        <Thead><Tr><Th>ID</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
                        <Tbody>
                            {reports.map((r) => (
                                <Tr key={r._id}>
                                    <Td>{r._id}</Td>
                                    <Td><Badge colorScheme="pink">{r.status}</Badge></Td>
                                    <Td><Button size="sm" colorScheme="teal">Review</Button></Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* Disputes Table */}
            <Card mb={6}>
                <CardHeader><Heading size="sm">Open Disputes</Heading></CardHeader>
                <CardBody>
                    <Table variant="striped" size="sm">
                        <Thead><Tr><Th>ID</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
                        <Tbody>
                            {disputes.map((d) => (
                                <Tr key={d._id}>
                                    <Td>{d._id}</Td>
                                    <Td><Badge colorScheme="orange">{d.status}</Badge></Td>
                                    <Td><Button size="sm" colorScheme="red">Start Review</Button></Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* Audit Logs Feed */}
            <Card>
                <CardHeader><Heading size="sm">Recent Admin Actions</Heading></CardHeader>
                <CardBody>
                    <VStack align="stretch" spacing={3}>
                        {auditLogs.map((log) => (
                            <Flex key={log._id} justify="space-between">
                                <Text>{log.action} on {log.targetType}</Text>
                                <Text fontSize="sm" color="gray.500">{new Date(log.createdAt).toLocaleString()}</Text>
                            </Flex>
                        ))}
                    </VStack>
                </CardBody>
            </Card>
            <AdminNavbar active="User Management" />
        </Box>
    );
}
