import { useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
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
    Spinner,
    Text,
    Textarea,
    VStack,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Calendar, ChevronDown, Mail, Phone, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    confirmInspectionAttendance,
    disputeViewingNoShow,
    getManagedPropertyInspections,
    inspectionRequestResponse,
    reportInspectionNoShow,
    requestInspectionReschedule,
} from '../../../api';
import Navbar from './Navbar';

const PAGE_SIZE = 20;

const formatDate = (value) => {
    if (!value) return 'Not specified';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not specified' : date.toLocaleString();
};

const formatStatus = (value) => String(value || 'unknown').replace(/_/g, ' ');

export default function ManagedInspections() {
    const [inspections, setInspections] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [decision, setDecision] = useState('');
    const [responseNote, setResponseNote] = useState('');
    const [responding, setResponding] = useState(false);
    const [responseError, setResponseError] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedAttendanceInspection, setSelectedAttendanceInspection] = useState(null);
    const [attendanceEvidence, setAttendanceEvidence] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState('');
    const [selectedActionInspection, setSelectedActionInspection] = useState(null);
    const [proposedDate, setProposedDate] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [noShowReason, setNoShowReason] = useState('');
    const [noShowEvidence, setNoShowEvidence] = useState([]);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeEvidence, setDisputeEvidence] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [currentTime, setCurrentTime] = useState(Date.now());
    const {
        isOpen: isAttendanceOpen,
        onOpen: onOpenAttendance,
        onClose: onCloseAttendance,
    } = useDisclosure();
    const {
        isOpen: isRescheduleOpen,
        onOpen: onOpenReschedule,
        onClose: onCloseReschedule,
    } = useDisclosure();
    const {
        isOpen: isNoShowOpen,
        onOpen: onOpenNoShow,
        onClose: onCloseNoShow,
    } = useDisclosure();
    const {
        isOpen: isDisputeOpen,
        onOpen: onOpenDispute,
        onClose: onCloseDispute,
    } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
        return () => clearInterval(timer);
    }, []);

    const getSelectedInspectionId = () => (
        selectedActionInspection?._id || selectedActionInspection?.id
    );

    const openRescheduleModal = (inspection) => {
        setSelectedActionInspection(inspection);
        setProposedDate('');
        setRescheduleReason('');
        setActionError('');
        onOpenReschedule();
    };

    const closeRescheduleModal = () => {
        if (actionLoading) return;
        setSelectedActionInspection(null);
        setActionError('');
        onCloseReschedule();
    };

    const submitRescheduleRequest = async () => {
        const inspectionId = getSelectedInspectionId();
        const proposedDateValue = new Date(proposedDate);
        if (!inspectionId) {
            setActionError('This inspection is missing its ID. Refresh and try again.');
            return;
        }
        if (!proposedDate || Number.isNaN(proposedDateValue.getTime()) || proposedDateValue <= new Date()) {
            setActionError('Choose a valid date and time in the future.');
            return;
        }

        setActionLoading(true);
        setActionError('');
        try {
            await requestInspectionReschedule(
                inspectionId,
                proposedDateValue.toISOString(),
                rescheduleReason.trim(),
            );
            setSelectedActionInspection(null);
            onCloseReschedule();
            setRefreshKey((key) => key + 1);
            toast({
                title: 'Reschedule request sent',
                description: 'Your proposed inspection date has been submitted.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to request managed inspection reschedule:', requestError);
            setActionError(
                requestError?.response?.data?.message || 'Unable to request a reschedule. Please try again.',
            );
        } finally {
            setActionLoading(false);
        }
    };

    const openNoShowModal = (inspection) => {
        setSelectedActionInspection(inspection);
        setNoShowReason('');
        setNoShowEvidence([{ file: null, reason: '' }]);
        setActionError('');
        onOpenNoShow();
    };

    const submitNoShowReport = async () => {
        const inspectionId = getSelectedInspectionId();
        if (!inspectionId) {
            setActionError('This inspection is missing its ID. Refresh and try again.');
            return;
        }
        if (!noShowReason.trim()) {
            setActionError('Enter a reason for reporting the no-show.');
            return;
        }
        if (
            noShowEvidence.length === 0
            || noShowEvidence.length > 5
            || noShowEvidence.some((item) => !item.file || !item.reason.trim())
        ) {
            setActionError('Upload an image and enter a reason for each of up to 5 evidence items.');
            return;
        }
        if (noShowEvidence.some((item) => !item.file.type.startsWith('image/'))) {
            setActionError('Only image files can be uploaded as no-show evidence.');
            return;
        }
        if (noShowEvidence.some((item) => item.reason.trim().length > 1000)) {
            setActionError('Each evidence reason must be 1000 characters or fewer.');
            return;
        }

        setActionLoading(true);
        setActionError('');
        try {
            await reportInspectionNoShow(
                inspectionId,
                noShowReason.trim(),
                noShowEvidence.map(({ file, reason }) => ({ file, reason: reason.trim() })),
            );
            setSelectedActionInspection(null);
            onCloseNoShow();
            setRefreshKey((key) => key + 1);
            toast({
                title: 'No-show report submitted',
                description: 'The report and evidence have been sent for review.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to report managed inspection no-show:', requestError);
            setActionError(
                requestError?.response?.data?.message || 'Unable to submit the no-show report. Please try again.',
            );
        } finally {
            setActionLoading(false);
        }
    };

    const openDisputeModal = (inspection) => {
        setSelectedActionInspection(inspection);
        setDisputeReason('');
        setDisputeEvidence([{ url: '' }]);
        setActionError('');
        onOpenDispute();
    };

    const submitNoShowDispute = async () => {
        const inspectionId = getSelectedInspectionId();
        if (!inspectionId) {
            setActionError('This inspection is missing its ID. Refresh and try again.');
            return;
        }
        if (!disputeReason.trim()) {
            setActionError('Enter a reason for disputing the no-show report.');
            return;
        }
        if (
            disputeEvidence.length === 0
            || disputeEvidence.length > 5
            || disputeEvidence.some((item) => !item.url.trim())
        ) {
            setActionError('Provide an image URL for each of up to 5 evidence items.');
            return;
        }
        const hasInvalidUrl = disputeEvidence.some(({ url }) => {
            try {
                return !['http:', 'https:'].includes(new URL(url.trim()).protocol);
            } catch {
                return true;
            }
        });
        if (hasInvalidUrl) {
            setActionError('Enter a valid HTTPS or HTTP image URL for each evidence item.');
            return;
        }

        setActionLoading(true);
        setActionError('');
        try {
            await disputeViewingNoShow(
                inspectionId,
                disputeEvidence.map(({ url }) => ({ url: url.trim() })),
                disputeReason.trim(),
            );
            setSelectedActionInspection(null);
            onCloseDispute();
            setRefreshKey((key) => key + 1);
            toast({
                title: 'No-show dispute submitted',
                description: 'Your dispute and evidence have been sent for review.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to dispute managed inspection no-show:', requestError);
            setActionError(
                requestError?.response?.data?.message || 'Unable to submit the dispute. Please try again.',
            );
        } finally {
            setActionLoading(false);
        }
    };

    const openAttendanceModal = (inspection) => {
        setSelectedAttendanceInspection(inspection);
        setAttendanceEvidence([{ file: null, description: '' }]);
        setAttendanceError('');
        onOpenAttendance();
    };

    const closeAttendanceModal = () => {
        if (attendanceLoading) return;
        setSelectedAttendanceInspection(null);
        setAttendanceEvidence([]);
        setAttendanceError('');
        onCloseAttendance();
    };

    const updateAttendanceEvidence = (index, field, value) => {
        setAttendanceEvidence((items) => items.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const submitAttendanceConfirmation = async () => {
        if (!selectedAttendanceInspection?._id) {
            setAttendanceError('This inspection is missing its ID. Refresh and try again.');
            return;
        }
        if (
            attendanceEvidence.length === 0
            || attendanceEvidence.length > 5
            || attendanceEvidence.some((item) => !item.file || !item.description.trim())
        ) {
            setAttendanceError('Upload an image and enter a description for each of up to 5 evidence items.');
            return;
        }
        if (attendanceEvidence.some((item) => !item.file.type.startsWith('image/'))) {
            setAttendanceError('Only image files can be uploaded as attendance evidence.');
            return;
        }
        if (attendanceEvidence.some((item) => item.description.trim().length > 1000)) {
            setAttendanceError('Each evidence description must be 1000 characters or fewer.');
            return;
        }

        const evidence = attendanceEvidence.map(({ file, description }) => ({
            file,
            description: description.trim(),
        }));

        setAttendanceLoading(true);
        setAttendanceError('');
        try {
            await confirmInspectionAttendance(selectedAttendanceInspection._id, evidence);
            setSelectedAttendanceInspection(null);
            setAttendanceEvidence([]);
            onCloseAttendance();
            setRefreshKey((key) => key + 1);
            toast({
                title: 'Attendance confirmed',
                description: 'Attendance evidence has been submitted.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to confirm managed inspection attendance:', requestError);
            setAttendanceError(
                requestError?.response?.data?.message || 'Unable to confirm attendance. Please try again.',
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    const openResponseModal = (inspection) => {
        setSelectedInspection(inspection);
        setDecision('');
        setResponseNote('');
        setResponseError('');
        onOpen();
    };

    const closeResponseModal = () => {
        if (responding) return;
        setSelectedInspection(null);
        setDecision('');
        setResponseNote('');
        setResponseError('');
        onClose();
    };

    const respondToReschedule = async () => {
        if (!decision) {
            setResponseError('Choose approve or reject before submitting.');
            return;
        }
        if (!selectedInspection?._id) {
            setResponseError('This inspection is missing its ID. Refresh and try again.');
            return;
        }

        setResponding(true);
        setResponseError('');
        try {
            await inspectionRequestResponse(
                selectedInspection._id,
                decision,
                responseNote.trim(),
            );
            setSelectedInspection(null);
            setDecision('');
            setResponseNote('');
            onClose();
            toast({
                title: `Reschedule request ${decision}`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            setRefreshKey((key) => key + 1);
        } catch (requestError) {
            console.error('Failed to respond to inspection reschedule request:', requestError);
            setResponseError(
                requestError?.response?.data?.message || 'Unable to submit your response. Please try again.',
            );
        } finally {
            setResponding(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchInspections = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await getManagedPropertyInspections({
                    page,
                    limit: PAGE_SIZE,
                });
                const payload = response?.data?.data || response?.data || {};
                console.log('Fetched managed inspections:', payload);
                const result = Array.isArray(payload.inspections) ? payload.inspections : [];
                const pagination = payload.pagination || {};

                if (isMounted) {
                    setInspections(result);
                    setPage(Number(pagination.page || page));
                    setTotal(Number(pagination.total ?? result.length));
                    setTotalPages(
                        Number(pagination.totalPages || pagination.pages)
                        || Math.max(1, Math.ceil(Number(pagination.total ?? result.length) / PAGE_SIZE)),
                    );
                }
            } catch (requestError) {
                console.error('Failed to load managed inspections:', requestError);
                if (isMounted) {
                    setInspections([]);
                    setTotal(0);
                    setTotalPages(1);
                    setError(
                        requestError?.response?.data?.message
                        || 'Unable to load managed inspections. Please try again.',
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
    }, [page, refreshKey]);

    return (
        <Box minH="100vh" bg="brand.background" pb="100px">
            <Box bg="brand.primary" px={{ base: 4, md: 8 }} py={6}>
                <VStack align="stretch" spacing={4} maxW="1000px" mx="auto">
                    <Button
                        as={Link}
                        to="/dashboard"
                        alignSelf="flex-start"
                        leftIcon={<ArrowLeft size={16} />}
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                    >
                        Dashboard
                    </Button>
                    <Box>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="white">
                            All Property Inspections
                        </Text>
                        <Text color="whiteAlpha.800" mt={1}>
                            Review inspection bookings across your managed properties.
                        </Text>
                    </Box>
                </VStack>
            </Box>

            <VStack align="stretch" spacing={4} maxW="1000px" mx="auto" px={{ base: 4, md: 8 }} py={6}>
                {loading ? (
                    <VStack py={16} spacing={4}>
                        <Spinner size="xl" color="brand.primary" />
                        <Text color="brand.gray.600">Loading managed inspections...</Text>
                    </VStack>
                ) : error ? (
                    <VStack bg="white" p={8} borderRadius="xl" spacing={4}>
                        <Text color="red.600" textAlign="center">{error}</Text>
                        <Button colorScheme="teal" onClick={() => setRefreshKey((key) => key + 1)}>
                            Try again
                        </Button>
                    </VStack>
                ) : inspections.length === 0 ? (
                    <Box bg="white" p={8} borderRadius="xl" textAlign="center">
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            No property inspections found
                        </Text>
                    </Box>
                ) : (
                    <>
                        <Text fontSize="sm" color="brand.gray.600">
                            {total} inspection{total === 1 ? '' : 's'}
                        </Text>
                        {inspections.map((inspection, index) => {
                            const tenant = inspection.tenant || {};
                            const property = inspection.property || {};
                            const inspectionId = inspection._id || `inspection-${index}`;
                            const viewingStatus = inspection.viewingStatus || 'unknown';
                            const paymentStatus = inspection.paymentStatus || 'unknown';
                            const hasPendingReschedule = inspection.rescheduleRequest?.status === 'pending';
                            const normalizedStatus = String(viewingStatus).toLowerCase().replace(/[\s-]+/g, '_');
                            const canManage = !['cancelled', 'canceled', 'completed', 'rejected'].includes(normalizedStatus);
                            const canConfirmAttendance = normalizedStatus === 'scheduled' || normalizedStatus === 'rescheduled';
                            const gracePeriodMinutes = Number(inspection.gracePeriodMinutes);
                            const scheduledTime = new Date(inspection.scheduledAt).getTime();
                            const canReportNoShow = inspection.attendance?.landlordConfirmed === true
                                && inspection.attendance?.tenantConfirmed === true
                                && Number.isFinite(gracePeriodMinutes)
                                && Number.isFinite(scheduledTime)
                                && currentTime >= scheduledTime + gracePeriodMinutes * 60 * 1000;
                            const canDisputeNoShow = normalizedStatus === 'no_show_reported'
                                && inspection.attendance?.tenantConfirmed === false;

                            return (
                                <Box key={inspectionId} bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="sm">
                                    <HStack justify="space-between" align="start" spacing={3} flexWrap="wrap">
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                                                {property.title || 'Property inspection'}
                                            </Text>
                                            <Text fontSize="sm" color="brand.gray.600">
                                                Tenant: {tenant.fullName || 'Not specified'}
                                            </Text>
                                        </Box>
                                        <HStack spacing={2} flexWrap="wrap">
                                            <Badge colorScheme={viewingStatus === 'cancelled' ? 'red' : 'teal'}>
                                                {formatStatus(viewingStatus)}
                                            </Badge>
                                            <Badge colorScheme={paymentStatus === 'held' ? 'green' : 'gray'}>
                                                Payment: {formatStatus(paymentStatus)}
                                            </Badge>
                                            {(canManage || hasPendingReschedule) && (
                                                <Menu>
                                                    <MenuButton
                                                        as={Button}
                                                        size="sm"
                                                        variant="outline"
                                                        rightIcon={<ChevronDown size={16} />}
                                                    >
                                                        Actions
                                                    </MenuButton>
                                                    <MenuList>
                                                        {hasPendingReschedule && (
                                                            <MenuItem onClick={() => openResponseModal(inspection)}>
                                                                Respond to reschedule
                                                            </MenuItem>
                                                        )}
                                                        {canConfirmAttendance && (
                                                            <MenuItem onClick={() => openAttendanceModal(inspection)}>
                                                                Confirm attendance
                                                            </MenuItem>
                                                        )}
                                                        {canReportNoShow && (
                                                            <MenuItem color="red.600" onClick={() => openNoShowModal(inspection)}>
                                                                Report no-show
                                                            </MenuItem>
                                                        )}
                                                        {canDisputeNoShow && (
                                                            <MenuItem color="orange.600" onClick={() => openDisputeModal(inspection)}>
                                                                Dispute no-show
                                                            </MenuItem>
                                                        )}
                                                        {canManage && (
                                                            <MenuItem onClick={() => openRescheduleModal(inspection)}>
                                                                Reschedule inspection
                                                            </MenuItem>
                                                        )}
                                                    </MenuList>
                                                </Menu>
                                            )}
                                        </HStack>
                                    </HStack>

                                    <Divider my={4} />

                                    <HStack align="start" spacing={{ base: 4, md: 8 }} flexWrap="wrap">
                                        <HStack spacing={2}>
                                            <Calendar size={16} color="#00695C" />
                                            <Box>
                                                <Text fontSize="xs" color="brand.gray.500">Scheduled</Text>
                                                <Text fontSize="sm" fontWeight="600">{formatDate(inspection.scheduledAt)}</Text>
                                            </Box>
                                        </HStack>
                                        <HStack spacing={2}>
                                            <Users size={16} color="#00695C" />
                                            <Box>
                                                <Text fontSize="xs" color="brand.gray.500">Visitors</Text>
                                                <Text fontSize="sm" fontWeight="600">{inspection.numberOfVisitors ?? 'Not specified'}</Text>
                                            </Box>
                                        </HStack>
                                        {tenant.email && (
                                            <HStack spacing={2}>
                                                <Mail size={16} color="#00695C" />
                                                <Text fontSize="sm">{tenant.email}</Text>
                                            </HStack>
                                        )}
                                        {tenant.phone && (
                                            <HStack spacing={2}>
                                                <Phone size={16} color="#00695C" />
                                                <Text fontSize="sm">{tenant.phone}</Text>
                                            </HStack>
                                        )}
                                    </HStack>

                                    {inspection.rescheduleRequest && (
                                        <Box mt={4} p={4} bg="brand.background" borderRadius="lg">
                                            <HStack justify="space-between" align="start" spacing={3} flexWrap="wrap">
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                                                        Reschedule request: {formatStatus(inspection.rescheduleRequest.status)}
                                                    </Text>
                                                    <Text fontSize="sm" color="brand.gray.600" mt={1}>
                                                        Proposed time: {formatDate(inspection.rescheduleRequest.proposedDate)}
                                                    </Text>
                                                    {inspection.rescheduleRequest.reason && (
                                                        <Text fontSize="sm" color="brand.gray.600" mt={1}>
                                                            Reason: {inspection.rescheduleRequest.reason}
                                                        </Text>
                                                    )}
                                                </Box>
                                            </HStack>
                                        </Box>
                                    )}

                                    {inspection.depositAmount != null && (
                                        <Text fontSize="sm" color="brand.gray.600" mt={4}>
                                            Deposit: {inspection.currency || 'NGN'} {(Number(inspection.depositAmount) / 100).toLocaleString()}
                                        </Text>
                                    )}
                                    {inspection.cancellationDeadline && (
                                        <Text fontSize="sm" color="brand.gray.600" mt={1}>
                                            Cancellation deadline: {formatDate(inspection.cancellationDeadline)}
                                        </Text>
                                    )}
                                </Box>
                            );
                        })}

                        {totalPages > 1 && (
                            <HStack justify="center" spacing={4} pt={2}>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((currentPage) => currentPage - 1)}
                                    isDisabled={page <= 1 || loading}
                                >
                                    Previous
                                </Button>
                                <Text fontSize="sm" color="brand.gray.600">
                                    Page {page} of {totalPages}
                                </Text>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((currentPage) => currentPage + 1)}
                                    isDisabled={page >= totalPages || loading}
                                >
                                    Next
                                </Button>
                            </HStack>
                        )}
                    </>
                )}
            </VStack>

            <Modal isOpen={isOpen} onClose={closeResponseModal} isCentered>
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Respond to reschedule request</ModalHeader>
                    <ModalCloseButton isDisabled={responding} />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text color="brand.gray.600">
                                Proposed date: {formatDate(selectedInspection?.rescheduleRequest?.proposedDate)}
                            </Text>
                            {selectedInspection?.rescheduleRequest?.reason && (
                                <Text color="brand.gray.600">
                                    Tenant's reason: {selectedInspection.rescheduleRequest.reason}
                                </Text>
                            )}
                            <FormControl isRequired>
                                <FormLabel>Decision</FormLabel>
                                <HStack>
                                    <Button
                                        flex={1}
                                        colorScheme="green"
                                        variant={decision === 'approved' ? 'solid' : 'outline'}
                                        onClick={() => setDecision('approved')}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        flex={1}
                                        colorScheme="red"
                                        variant={decision === 'rejected' ? 'solid' : 'outline'}
                                        onClick={() => setDecision('rejected')}
                                    >
                                        Reject
                                    </Button>
                                </HStack>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Response note (optional)</FormLabel>
                                <Textarea
                                    value={responseNote}
                                    onChange={(event) => setResponseNote(event.target.value)}
                                    placeholder="Add a note for the tenant"
                                />
                            </FormControl>
                            {responseError && <Text color="red.600" fontSize="sm">{responseError}</Text>}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={closeResponseModal} isDisabled={responding}>
                            Close
                        </Button>
                        <Button
                            colorScheme="teal"
                            ml={3}
                            onClick={respondToReschedule}
                            isLoading={responding}
                            loadingText="Submitting"
                        >
                            Submit response
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isAttendanceOpen} onClose={closeAttendanceModal} isCentered size="xl">
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Confirm inspection attendance</ModalHeader>
                    <ModalCloseButton isDisabled={attendanceLoading} />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text color="brand.gray.600">
                                Upload up to 5 image evidence items and provide a description for each.
                            </Text>
                            {attendanceEvidence.map((item, index) => (
                                <Box
                                    key={index}
                                    border="1px solid"
                                    borderColor="brand.gray.200"
                                    borderRadius="lg"
                                    p={4}
                                >
                                    <HStack justify="space-between" mb={3}>
                                        <Text fontWeight="600">Evidence {index + 1}</Text>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            isDisabled={attendanceLoading}
                                            onClick={() => setAttendanceEvidence((items) => (
                                                items.filter((_, itemIndex) => itemIndex !== index)
                                            ))}
                                        >
                                            Remove
                                        </Button>
                                    </HStack>
                                    <VStack align="stretch" spacing={3}>
                                        <FormControl isRequired>
                                            <FormLabel>Image</FormLabel>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                isDisabled={attendanceLoading}
                                                onChange={(event) => updateAttendanceEvidence(
                                                    index,
                                                    'file',
                                                    event.target.files?.[0] || null,
                                                )}
                                            />
                                            {item.file && (
                                                <Text fontSize="sm" color="brand.gray.600" mt={1}>
                                                    {item.file.name}
                                                </Text>
                                            )}
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Description</FormLabel>
                                            <Textarea
                                                value={item.description}
                                                maxLength={1000}
                                                isDisabled={attendanceLoading}
                                                onChange={(event) => updateAttendanceEvidence(
                                                    index,
                                                    'description',
                                                    event.target.value,
                                                )}
                                                placeholder="Describe this image evidence"
                                            />
                                            <Text textAlign="right" fontSize="xs" color="brand.gray.500">
                                                {item.description.length}/1000
                                            </Text>
                                        </FormControl>
                                    </VStack>
                                </Box>
                            ))}
                            {attendanceEvidence.length < 5 && (
                                <Button
                                    alignSelf="flex-start"
                                    size="sm"
                                    variant="outline"
                                    isDisabled={attendanceLoading}
                                    onClick={() => setAttendanceEvidence((items) => [
                                        ...items,
                                        { file: null, description: '' },
                                    ])}
                                >
                                    Add image evidence
                                </Button>
                            )}
                            {attendanceError && (
                                <Text color="red.600" fontSize="sm">{attendanceError}</Text>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={closeAttendanceModal} variant="ghost" isDisabled={attendanceLoading}>
                            Close
                        </Button>
                        <Button
                            ml={3}
                            colorScheme="teal"
                            onClick={submitAttendanceConfirmation}
                            isLoading={attendanceLoading}
                            loadingText="Submitting"
                        >
                            Submit attendance
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isRescheduleOpen} onClose={closeRescheduleModal} isCentered>
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Request a new inspection time</ModalHeader>
                    <ModalCloseButton isDisabled={actionLoading} />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text color="brand.gray.600">
                                Select a proposed date and time. The inspection is not rescheduled until the request is reviewed.
                            </Text>
                            <FormControl isRequired>
                                <FormLabel>Proposed date and time</FormLabel>
                                <Input
                                    type="datetime-local"
                                    value={proposedDate}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 60000).toISOString().slice(0, 16)}
                                    isDisabled={actionLoading}
                                    onChange={(event) => setProposedDate(event.target.value)}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Reason (optional)</FormLabel>
                                <Textarea
                                    value={rescheduleReason}
                                    isDisabled={actionLoading}
                                    onChange={(event) => setRescheduleReason(event.target.value)}
                                    placeholder="Tell us why you need to reschedule"
                                />
                            </FormControl>
                            {actionError && <Text color="red.600" fontSize="sm">{actionError}</Text>}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={closeRescheduleModal} isDisabled={actionLoading}>
                            Close
                        </Button>
                        <Button
                            colorScheme="teal"
                            ml={3}
                            onClick={submitRescheduleRequest}
                            isLoading={actionLoading}
                            loadingText="Sending request"
                        >
                            Send request
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isNoShowOpen} onClose={() => {
                if (actionLoading) return;
                setSelectedActionInspection(null);
                setNoShowReason('');
                setNoShowEvidence([]);
                setActionError('');
                onCloseNoShow();
            }} isCentered size="xl">
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Report inspection no-show</ModalHeader>
                    <ModalCloseButton isDisabled={actionLoading} />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text color="brand.gray.600">
                                Explain the no-show and provide up to 5 image evidence items with a reason for each.
                            </Text>
                            <FormControl isRequired>
                                <FormLabel>Reason for report</FormLabel>
                                <Textarea
                                    value={noShowReason}
                                    maxLength={1000}
                                    isDisabled={actionLoading}
                                    onChange={(event) => setNoShowReason(event.target.value)}
                                    placeholder="Explain why you are reporting this no-show"
                                />
                            </FormControl>
                            {noShowEvidence.map((item, index) => (
                                <Box key={index} border="1px solid" borderColor="brand.gray.200" borderRadius="lg" p={4}>
                                    <HStack justify="space-between" mb={3}>
                                        <Text fontWeight="600">Evidence {index + 1}</Text>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            isDisabled={actionLoading}
                                            onClick={() => setNoShowEvidence((items) => (
                                                items.filter((_, itemIndex) => itemIndex !== index)
                                            ))}
                                        >
                                            Remove
                                        </Button>
                                    </HStack>
                                    <VStack align="stretch" spacing={3}>
                                        <FormControl isRequired>
                                            <FormLabel>Image</FormLabel>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                isDisabled={actionLoading}
                                                onChange={(event) => setNoShowEvidence((items) => items.map((evidenceItem, itemIndex) => (
                                                    itemIndex === index
                                                        ? { ...evidenceItem, file: event.target.files?.[0] || null }
                                                        : evidenceItem
                                                )))}
                                            />
                                            {item.file && (
                                                <Text fontSize="sm" color="brand.gray.600" mt={1}>
                                                    {item.file.name}
                                                </Text>
                                            )}
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Evidence reason</FormLabel>
                                            <Textarea
                                                value={item.reason}
                                                maxLength={1000}
                                                isDisabled={actionLoading}
                                                onChange={(event) => setNoShowEvidence((items) => items.map((evidenceItem, itemIndex) => (
                                                    itemIndex === index
                                                        ? { ...evidenceItem, reason: event.target.value }
                                                        : evidenceItem
                                                )))}
                                                placeholder="Explain what this image shows"
                                            />
                                        </FormControl>
                                    </VStack>
                                </Box>
                            ))}
                            {noShowEvidence.length < 5 && (
                                <Button
                                    alignSelf="flex-start"
                                    size="sm"
                                    variant="outline"
                                    isDisabled={actionLoading}
                                    onClick={() => setNoShowEvidence((items) => [...items, { file: null, reason: '' }])}
                                >
                                    Add image evidence
                                </Button>
                            )}
                            {actionError && <Text color="red.600" fontSize="sm">{actionError}</Text>}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="ghost"
                            isDisabled={actionLoading}
                            onClick={() => {
                                setSelectedActionInspection(null);
                                setNoShowReason('');
                                setNoShowEvidence([]);
                                setActionError('');
                                onCloseNoShow();
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            colorScheme="red"
                            ml={3}
                            onClick={submitNoShowReport}
                            isLoading={actionLoading}
                            loadingText="Submitting report"
                        >
                            Submit report
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isDisputeOpen} onClose={() => {
                if (actionLoading) return;
                setSelectedActionInspection(null);
                setDisputeReason('');
                setDisputeEvidence([]);
                setActionError('');
                onCloseDispute();
            }} isCentered size="xl">
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Dispute no-show report</ModalHeader>
                    <ModalCloseButton isDisabled={actionLoading} />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text color="brand.gray.600">
                                Explain why you are disputing this report and provide up to 5 image URLs as evidence.
                            </Text>
                            <FormControl isRequired>
                                <FormLabel>Reason for dispute</FormLabel>
                                <Textarea
                                    value={disputeReason}
                                    maxLength={1000}
                                    isDisabled={actionLoading}
                                    onChange={(event) => setDisputeReason(event.target.value)}
                                    placeholder="Explain why the no-show report is incorrect"
                                />
                            </FormControl>
                            {disputeEvidence.map((item, index) => (
                                <Box key={index} border="1px solid" borderColor="brand.gray.200" borderRadius="lg" p={4}>
                                    <HStack justify="space-between" mb={3}>
                                        <Text fontWeight="600">Image evidence {index + 1}</Text>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            isDisabled={actionLoading}
                                            onClick={() => setDisputeEvidence((items) => (
                                                items.filter((_, itemIndex) => itemIndex !== index)
                                            ))}
                                        >
                                            Remove
                                        </Button>
                                    </HStack>
                                    <FormControl isRequired>
                                        <FormLabel>Image URL</FormLabel>
                                        <Input
                                            type="url"
                                            value={item.url}
                                            isDisabled={actionLoading}
                                            onChange={(event) => setDisputeEvidence((items) => items.map((evidenceItem, itemIndex) => (
                                                itemIndex === index ? { ...evidenceItem, url: event.target.value } : evidenceItem
                                            )))}
                                            placeholder="https://example.com/evidence.jpg"
                                        />
                                    </FormControl>
                                </Box>
                            ))}
                            {disputeEvidence.length < 5 && (
                                <Button
                                    alignSelf="flex-start"
                                    size="sm"
                                    variant="outline"
                                    isDisabled={actionLoading}
                                    onClick={() => setDisputeEvidence((items) => [...items, { url: '' }])}
                                >
                                    Add image URL
                                </Button>
                            )}
                            {actionError && <Text color="red.600" fontSize="sm">{actionError}</Text>}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="ghost"
                            isDisabled={actionLoading}
                            onClick={() => {
                                setSelectedActionInspection(null);
                                setDisputeReason('');
                                setDisputeEvidence([]);
                                setActionError('');
                                onCloseDispute();
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            colorScheme="orange"
                            ml={3}
                            onClick={submitNoShowDispute}
                            isLoading={actionLoading}
                            loadingText="Submitting dispute"
                        >
                            Submit dispute
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Navbar active="dashboard" />
        </Box>
    );
}
