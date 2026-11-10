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
    Image,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    VStack,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, ChevronDown, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getAllInspections,
    resolveInspectionDisputeFull,
    resolveInspectionDisputePartial,
} from '../../../../api';
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

export default function AdminInspectionsPage() {
    const navigate = useNavigate();
    const [inspections, setInspections] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [filterInputs, setFilterInputs] = useState({
        tenantId: '',
        landlordId: '',
        propertyId: '',
        viewingStatus: '',
        paymentStatus: '',
        disputedOnly: '',
        dateFrom: '',
        dateTo: '',
    });
    const [filters, setFilters] = useState({});
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [resolutionType, setResolutionType] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [resolvingDispute, setResolvingDispute] = useState(false);
    const toast = useToast();
    const {
        isOpen: isEvidenceOpen,
        onOpen: onEvidenceOpen,
        onClose: onEvidenceClose,
    } = useDisclosure();
    const {
        isOpen: isResolutionOpen,
        onOpen: onResolutionOpen,
        onClose: onResolutionClose,
    } = useDisclosure();

    useEffect(() => {
        let isMounted = true;

        const fetchInspections = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getAllInspections({
                    page,
                    limit: PAGE_SIZE,
                    disputedOnly: filters.disputedOnly ?? undefined,
                    ...filters,
                });
                const payload = response?.data?.data ?? response?.data ?? response ?? {};
                console.log('Admin inspections payload:', payload);
                const records = Array.isArray(payload?.inspections) ? payload.inspections : [];
                const pageInfo = payload?.pagination ?? {};
                const total = Number(pageInfo.total ?? records.length);
                const totalPages = Number(pageInfo.totalPages ?? pageInfo.pages)
                    || Math.max(1, Math.ceil(total / PAGE_SIZE));

                if (isMounted) {
                    setInspections(records);
                    setPagination({
                        page: Number(pageInfo.page ?? page),
                        total,
                        totalPages,
                    });
                }
            } catch (requestError) {
                console.error('Failed to load admin inspections:', requestError);
                if (isMounted) {
                    setInspections([]);
                    setPagination({ page: 1, total: 0, totalPages: 1 });
                    setError(
                        requestError?.response?.data?.message
                        || 'Unable to load inspections. Please try again.',
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInspections();
        return () => {
            isMounted = false;
        };
    }, [page, refreshKey, filters]);

    const applyFilters = () => {
        const nextFilters = Object.fromEntries(
            Object.entries(filterInputs)
                .map(([key, value]) => [key, value.trim()])
                .filter(([, value]) => value),
        );
        setFilters(nextFilters);
        setPage(1);
    };

    const clearFilters = () => {
        setFilterInputs({
            tenantId: '',
            landlordId: '',
            propertyId: '',
            viewingStatus: '',
            paymentStatus: '',
            disputedOnly: '',
            dateFrom: '',
            dateTo: '',
        });
        setFilters({});
        setPage(1);
    };

    const openEvidence = (inspection) => {
        setSelectedInspection(inspection);
        onEvidenceOpen();
    };

    const openResolution = (inspection, type) => {
        setSelectedInspection(inspection);
        setResolutionType(type);
        setAdminNotes('');
        onResolutionOpen();
    };

    const handleResolveDispute = async () => {
        const inspectionId = selectedInspection?._id || selectedInspection?.id;
        if (!inspectionId) {
            toast({
                title: 'Unable to resolve dispute',
                description: 'This inspection is missing its ID. Refresh and try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setResolvingDispute(true);
        try {
            const resolve = resolutionType === 'partial'
                ? resolveInspectionDisputePartial
                : resolveInspectionDisputeFull;
            await resolve(inspectionId, {
                adminNotes: adminNotes.trim(),
            });
            onResolutionClose();
            setSelectedInspection(null);
            setRefreshKey((key) => key + 1);
            toast({
                title: 'Dispute resolved',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to resolve inspection dispute:', requestError);
            toast({
                title: 'Unable to resolve dispute',
                description: requestError?.response?.data?.message
                    || 'Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setResolvingDispute(false);
        }
    };

    const formatAddress = (property) => {
        const addr = property?.address;
        if (!addr) {
            return [property?.city, property?.state].filter(Boolean).join(', ') || '—';
        }
        if (typeof addr === 'string') return addr;
        // addr is object
        return [addr.streetAddress, addr.area, addr.lga, addr.state, addr.landmark]
            .filter(Boolean)
            .join(', ') || '—';
    };

    return (
        <Box p={{ base: 4, md: 6 }} bg="brand.background" minH="100vh" pb="100px">
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                    <Box>
                        <Button
                            variant="ghost"
                            leftIcon={<ArrowLeft size={16} />}
                            onClick={() => navigate('/user-management')}
                            mb={2}
                        >
                            Dashboard
                        </Button>
                        <Heading size="lg" color="teal.600">Pending Inspections</Heading>
                        <Text color="gray.600" mt={1}>
                            Review the inspection records returned by the admin inspections service.
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
                            <Heading size="md">Inspections</Heading>
                            {!loading && !error && (
                                <Text color="gray.600" fontSize="sm">
                                    {pagination.total} record{pagination.total === 1 ? '' : 's'}
                                </Text>
                            )}
                        </HStack>
                    </CardHeader>
                    <Link  to="/admin-unresolved-disputes">
                        <Text ml={5} textDecoration="underline" >
                            All Unresolved Disputes
                        </Text>
                    </Link>
                    <CardBody>
                        <Flex gap={3} wrap="wrap" mb={5}>
                            {[
                                ['tenantId', 'Tenant ID'],
                                ['landlordId', 'Landlord ID'],
                                ['propertyId', 'Property ID'],
                            ].map(([field, label]) => (
                                <Input
                                    key={field}
                                    aria-label={label}
                                    placeholder={label}
                                    value={filterInputs[field]}
                                    onChange={(event) => setFilterInputs((current) => ({
                                        ...current,
                                        [field]: event.target.value,
                                    }))}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') applyFilters();
                                    }}
                                    minW={{ base: '10%', md: '180px' }}
                                    flex="1"
                                />
                            ))}
                            <Select
                                aria-label="Viewing status"
                                placeholder="All viewing statuses"
                                value={filterInputs.viewingStatus}
                                onChange={(event) => setFilterInputs((current) => ({
                                    ...current,
                                    viewingStatus: event.target.value,
                                }))}
                                minW={{ base: '20%', md: '180px' }}
                                flex="1"
                            >
                                {[
                                    'pending_payment',
                                    'scheduled',
                                    'attended',
                                    'no_show_reported',
                                    'disputed',
                                    'cancelled',
                                    'rescheduled',
                                    'completed',
                                ].map((status) => (
                                    <option key={status} value={status}>{formatStatus(status)}</option>
                                ))}
                            </Select>
                            <Select
                                aria-label="Payment status"
                                placeholder="All payment statuses"
                                value={filterInputs.paymentStatus}
                                onChange={(event) => setFilterInputs((current) => ({
                                    ...current,
                                    paymentStatus: event.target.value,
                                }))}
                                minW={{ base: '20%', md: '180px' }}
                                flex="1"
                            >
                                {[
                                    'pending',
                                    'held',
                                    'refund_pending',
                                    'refunded',
                                    'credited_to_rent',
                                    'partially_forfeited',
                                ].map((status) => (
                                    <option key={status} value={status}>{formatStatus(status)}</option>
                                ))}
                            </Select>
                            <Select
                                aria-label="Disputed only"
                                value={filterInputs.disputedOnly}
                                onChange={(event) => setFilterInputs((current) => ({
                                    ...current,
                                    disputedOnly: event.target.value,
                                }))}
                                minW={{ base: '20%', md: '180px' }}
                                flex="1"
                            >
                                <option value="">All inspections</option>
                                <option value="true">Disputed only</option>
                                <option value="false">Non-disputed only</option>
                            </Select>
                            <Input
                                aria-label="Date from"
                                type="date"
                                value={filterInputs.dateFrom}
                                onChange={(event) => setFilterInputs((current) => ({
                                    ...current,
                                    dateFrom: event.target.value,
                                }))}
                                minW={{ base: '30%', md: '180px' }}
                                flex="1"
                            />
                            <Input
                                aria-label="Date to"
                                type="date"
                                value={filterInputs.dateTo}
                                onChange={(event) => setFilterInputs((current) => ({
                                    ...current,
                                    dateTo: event.target.value,
                                }))}
                                minW={{ base: '30%', md: '180px' }}
                                flex="1"
                            />
                            <Button colorScheme="teal" onClick={applyFilters} isLoading={loading} size="md">
                                Filter
                            </Button>
                            <Button variant="ghost" onClick={clearFilters} isDisabled={loading} size="md">
                                Clear
                            </Button>
                        </Flex>
                        {loading ? (
                            <Flex justify="center" py={12}>
                                <Spinner size="lg" color="teal.500" />
                            </Flex>
                        ) : error ? (
                            <VStack py={8} spacing={4}>
                                <Text color="red.600" textAlign="center">{error}</Text>
                                <Button colorScheme="teal" onClick={() => setRefreshKey((key) => key + 1)}>
                                    Try again
                                </Button>
                            </VStack>
                        ) : inspections.length === 0 ? (
                            <Text color="gray.500" py={6}>No inspections found.</Text>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th>Property</Th>
                                                <Th>Tenant</Th>
                                                <Th>Landlord</Th>
                                                <Th>Scheduled</Th>
                                                <Th>Status</Th>
                                                <Th>Payment</Th>
                                                <Th>Deposit</Th>
                                                <Th>Dispute</Th>
                                                <Th>Created</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {inspections.map((inspection, index) => (
                                                <Tr key={inspection._id || `inspection-${index}`}>
                                                    <Td minW="220px">
                                                        <Text fontWeight="600">{inspection.property?.title || '—'}</Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {formatAddress(inspection.property)}
                                                        </Text>
                                                    </Td>
                                                    <Td minW="180px">
                                                        <Text>{inspection.tenant?.fullName || '—'}</Text>
                                                        <Text fontSize="xs" color="gray.600">{inspection.tenant?.email || '—'}</Text>
                                                        <Text fontSize="xs" color="gray.600">{inspection.tenant?.phone || ''}</Text>
                                                    </Td>
                                                    <Td minW="180px">
                                                        <Text>{inspection.landlord?.fullName || '—'}</Text>
                                                        <Text fontSize="xs" color="gray.600">{inspection.landlord?.email || '—'}</Text>
                                                        <Text fontSize="xs" color="gray.600">{inspection.landlord?.phone || ''}</Text>
                                                    </Td>
                                                    <Td whiteSpace="nowrap">{formatDate(inspection.scheduledAt)}</Td>
                                                    <Td>
                                                        <Badge colorScheme={inspection.viewingStatus === 'disputed' ? 'red' : 'teal'}>
                                                            {formatStatus(inspection.viewingStatus)}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Text>{formatStatus(inspection.paymentStatus)}</Text>
                                                        {inspection.settlement?.status && (
                                                            <Text fontSize="xs" color="gray.600">
                                                                Settlement: {formatStatus(inspection.settlement.status)}
                                                            </Text>
                                                        )}
                                                    </Td>
                                                    <Td whiteSpace="nowrap">
                                                        {formatMoney((inspection.depositAmount / 100), inspection.currency)}
                                                    </Td>
                                                    <Td minW="240px">
                                                        {inspection.dispute?.raised ? (
                                                            <>
                                                                <Text fontSize="sm">{inspection.dispute.reason || 'Reason not provided'}</Text>
                                                                <Text fontSize="xs" color="gray.600">
                                                                    By {inspection.dispute.raisedBy?.fullName || 'Unknown'} · {formatDate(inspection.dispute.raisedAt)}
                                                                </Text>
                                                                {inspection.dispute.evidence?.length > 0 && (
                                                                    <Text fontSize="xs" color="teal.600">
                                                                        {inspection.dispute.evidence.length} evidence item{inspection.dispute.evidence.length === 1 ? '' : 's'}
                                                                    </Text>
                                                                )}
                                                            </>
                                                        ) : '—'}
                                                    </Td>
                                                    <Td whiteSpace="nowrap">{formatDate(inspection.createdAt)}</Td>
                                                    <Td>
                                                        {/* {inspection.dispute?.raised && ( */}
                                                        <Menu>
                                                            <MenuButton
                                                                as={Button}
                                                                size="sm"
                                                                variant="outline"
                                                                rightIcon={<ChevronDown size={14} />}
                                                            >
                                                                Actions
                                                            </MenuButton>
                                                            <MenuList>
                                                                <MenuItem onClick={() => openEvidence(inspection)}>
                                                                    View evidence
                                                                </MenuItem>
                                                                {inspection.dispute?.raised && inspection.viewingStatus === "completed" && inspection.viewingStatus === "cancelled" && (
                                                                    <MenuItem onClick={() => openResolution(inspection, 'full')}>
                                                                        Resolve full
                                                                    </MenuItem>)}
                                                                {inspection.dispute?.raised && inspection.viewingStatus === "completed" && inspection.viewingStatus === "cancelled" && (
                                                                    <MenuItem onClick={() => openResolution(inspection, 'partial')}>
                                                                        Resolve partial
                                                                    </MenuItem>)}
                                                            </MenuList>
                                                        </Menu>
                                                        {/* )} */}
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

            <Modal isOpen={isEvidenceOpen} onClose={onEvidenceClose} size="2xl">
                <ModalOverlay />
                <ModalContent maxH="90vh" overflowY="auto">
                    <ModalHeader>Dispute evidence</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedInspection?.dispute?.evidence?.length ? (
                            <VStack align="stretch" spacing={5}>
                                {selectedInspection.dispute.evidence.map((item, index) => {
                                    const evidenceUrl = typeof item === 'string'
                                        ? item.trim()
                                        : item?.url?.trim();
                                    const submittedBy = item?.submittedBy;
                                    const submitterName = typeof submittedBy === 'object'
                                        ? submittedBy?.fullName
                                        || submittedBy?.name
                                        || submittedBy?.email
                                        || submittedBy?._id
                                        : submittedBy;
                                    let isSafeUrl = false;
                                    try {
                                        isSafeUrl = Boolean(evidenceUrl)
                                            && ['http:', 'https:'].includes(new URL(evidenceUrl).protocol);
                                    } catch {
                                        isSafeUrl = false;
                                    }

                                    return (
                                        <Box
                                            key={`${evidenceUrl || item?.ipfsHash || 'evidence'}-${index}`}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            p={4}
                                        >
                                            <Text fontWeight="semibold" mb={3}>
                                                Evidence {index + 1}
                                            </Text>
                                            <VStack align="stretch" spacing={2} mb={isSafeUrl ? 3 : 0}>
                                                <Text>
                                                    <Text as="span" fontWeight="medium">Description: </Text>
                                                    {item?.description || 'No description provided.'}
                                                </Text>
                                                <Text overflowWrap="anywhere">
                                                    <Text as="span" fontWeight="medium">IPFS hash: </Text>
                                                    {item?.ipfsHash || 'Not available'}
                                                </Text>
                                                <Text>
                                                    <Text as="span" fontWeight="medium">Submitted by: </Text>
                                                    {submitterName || 'Unknown'}
                                                </Text>
                                                <Text>
                                                    <Text as="span" fontWeight="medium">Submitted at: </Text>
                                                    {formatDate(item?.submittedAt)}
                                                </Text>
                                            </VStack>
                                            {isSafeUrl ? (
                                                <VStack align="stretch" spacing={2}>
                                                    <Image
                                                        src={evidenceUrl}
                                                        alt={`Dispute evidence ${index + 1}`}
                                                        maxH="400px"
                                                        objectFit="contain"
                                                        borderRadius="md"
                                                    />
                                                    <Button
                                                        as="a"
                                                        href={evidenceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        variant="link"
                                                        colorScheme="teal"
                                                        mt={2}
                                                    >
                                                        {evidenceUrl}
                                                    </Button>
                                                </VStack>
                                            ) : (
                                                <Text overflowWrap="anywhere" color="gray.500">
                                                    Evidence URL unavailable{evidenceUrl ? `: ${evidenceUrl}` : '.'}
                                                </Text>
                                            )}
                                        </Box>
                                    );
                                })}
                            </VStack>
                        ) : (
                            <Text color="gray.500">No evidence was submitted.</Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isResolutionOpen}
                onClose={onResolutionClose}
                closeOnOverlayClick={!resolvingDispute}
                closeOnEsc={!resolvingDispute}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Resolve dispute {resolutionType === 'partial' ? 'partially' : 'fully'}
                    </ModalHeader>
                    <ModalCloseButton isDisabled={resolvingDispute} />
                    <ModalBody>
                        <Textarea
                            aria-label="Admin note"
                            placeholder="Enter admin note"
                            value={adminNotes}
                            onChange={(event) => setAdminNotes(event.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button variant="ghost" onClick={onResolutionClose} isDisabled={resolvingDispute}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleResolveDispute}
                            isLoading={resolvingDispute}
                        >
                            Confirm resolution
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
