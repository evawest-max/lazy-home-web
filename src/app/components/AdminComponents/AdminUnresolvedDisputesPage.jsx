import { useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    HStack,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from '@chakra-ui/react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllUnresolvedDispute } from '../../../../api';
import AdminNavbar from './AdminNavbar';

const PAGE_SIZE = 20;

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

const formatMoney = (value, currency = 'NGN') => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '—';
    return amount.toLocaleString('en-NG', {
        style: 'currency',
        currency: currency || 'NGN',
        maximumFractionDigits: 0,
    });
};

const formatStatus = (value) => String(value || 'unknown').replace(/_/g, ' ');

export default function AdminUnresolvedDisputesPage() {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchDisputes = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getAllUnresolvedDispute({ page, limit: PAGE_SIZE });
                const payload = response?.data?.data ?? response?.data ?? response ?? {};
                const records = Array.isArray(payload?.disputes) ? payload.disputes : [];
                const pageInfo = payload?.pagination ?? {};
                const total = Number(pageInfo.total ?? records.length);
                const totalPages = Number(pageInfo.totalPages ?? pageInfo.pages)
                    || Math.max(1, Math.ceil(total / PAGE_SIZE));

                if (isMounted) {
                    setDisputes(records);
                    setPagination({
                        page: Number(pageInfo.page ?? page),
                        total,
                        totalPages,
                    });
                }
            } catch (requestError) {
                console.error('Failed to load unresolved disputes:', requestError);
                if (isMounted) {
                    setDisputes([]);
                    setPagination({ page: 1, total: 0, totalPages: 1 });
                    setError(
                        requestError?.response?.data?.message
                        || 'Unable to load unresolved disputes. Please try again.',
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDisputes();
        return () => {
            isMounted = false;
        };
    }, [page, refreshKey]);

    const formatAddress = (property) => {
        const address = property?.address;
        if (!address) {
            return [property?.city, property?.state].filter(Boolean).join(', ') || '—';
        }
        if (typeof address === 'string') return address;
        return [
            address.streetAddress,
            address.area,
            address.lga,
            address.state,
        ].filter(Boolean).join(', ') || '—';
    };

    return (
        <Box p={{ base: 4, md: 6 }} bg="brand.background" minH="100vh" pb="100px">
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                    <Box>
                        <Button
                            variant="ghost"
                            leftIcon={<ArrowLeft size={16} />}
                            onClick={() => navigate('/admin-inspections')}
                            mb={2}
                        >
                            Inspections
                        </Button>
                        <Heading size="lg" color="teal.600">All Unresolved Disputes</Heading>
                        <Text color="gray.600" mt={1}>
                            Review inspection disputes that are awaiting resolution.
                        </Text>
                    </Box>
                    <Button
                        leftIcon={<RefreshCw size={16} />}
                        onClick={() => setRefreshKey((key) => key + 1)}
                        isLoading={loading}
                    >
                        Refresh
                    </Button>
                </Flex>

                <Card shadow="sm">
                    <CardHeader>
                        <HStack justify="space-between" flexWrap="wrap">
                            <Heading size="md">Unresolved disputes</Heading>
                            {!loading && !error && (
                                <Text color="gray.600" fontSize="sm">
                                    {pagination.total} dispute{pagination.total === 1 ? '' : 's'}
                                </Text>
                            )}
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        {loading ? (
                            <Flex justify="center" py={12}>
                                <Spinner size="lg" color="teal.500" />
                            </Flex>
                        ) : error ? (
                            <VStack py={8} spacing={4}>
                                <Text color="red.600" textAlign="center">{error}</Text>
                                <Button
                                    colorScheme="teal"
                                    onClick={() => setRefreshKey((key) => key + 1)}
                                >
                                    Try again
                                </Button>
                            </VStack>
                        ) : disputes.length === 0 ? (
                            <Text color="gray.500" py={6}>No unresolved disputes found.</Text>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th>Property</Th>
                                                <Th>Tenant</Th>
                                                <Th>Landlord</Th>
                                                <Th>Dispute</Th>
                                                <Th>Scheduled</Th>
                                                <Th>Status</Th>
                                                <Th>Payment</Th>
                                                <Th>Deposit</Th>
                                                <Th>Raised</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {disputes.map((dispute, index) => (
                                                <Tr key={dispute._id || `dispute-${index}`}>
                                                    <Td minW="220px">
                                                        <Text fontWeight="600">
                                                            {dispute.property?.title || '—'}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {formatAddress(dispute.property)}
                                                        </Text>
                                                    </Td>
                                                    <Td minW="180px">
                                                        <Text>{dispute.tenant?.fullName || '—'}</Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {dispute.tenant?.email || '—'}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {dispute.tenant?.phone || ''}
                                                        </Text>
                                                    </Td>
                                                    <Td minW="180px">
                                                        <Text>{dispute.landlord?.fullName || '—'}</Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {dispute.landlord?.email || '—'}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {dispute.landlord?.phone || ''}
                                                        </Text>
                                                    </Td>
                                                    <Td minW="240px">
                                                        <Text>{dispute.dispute?.reason || 'Reason not provided'}</Text>
                                                        {dispute.dispute?.evidence?.length > 0 && (
                                                            <Text fontSize="xs" color="teal.600" mt={1}>
                                                                {dispute.dispute.evidence.length} evidence item
                                                                {dispute.dispute.evidence.length === 1 ? '' : 's'}
                                                            </Text>
                                                        )}
                                                    </Td>
                                                    <Td whiteSpace="nowrap">{formatDate(dispute.scheduledAt)}</Td>
                                                    <Td>
                                                        <Badge colorScheme="red">
                                                            {formatStatus(dispute.viewingStatus)}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{formatStatus(dispute.paymentStatus)}</Td>
                                                    <Td whiteSpace="nowrap">
                                                        {formatMoney(dispute.depositAmount)}
                                                    </Td>
                                                    <Td whiteSpace="nowrap">
                                                        {formatDate(dispute.dispute?.raisedAt)}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                                {pagination.totalPages > 1 && (
                                    <HStack justify="center" spacing={4} mt={5}>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage((currentPage) => currentPage - 1)}
                                            isDisabled={pagination.page <= 1 || loading}
                                        >
                                            Previous
                                        </Button>
                                        <Text fontSize="sm" color="gray.600">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </Text>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage((currentPage) => currentPage + 1)}
                                            isDisabled={pagination.page >= pagination.totalPages || loading}
                                        >
                                            Next
                                        </Button>
                                    </HStack>
                                )}
                            </>
                        )}
                    </CardBody>
                </Card>
            </VStack>
            <AdminNavbar active="User Management" />
        </Box>
    );
}
