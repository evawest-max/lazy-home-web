import { useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Divider,
    HStack,
    FormControl,
    FormLabel,
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
    Textarea,
    Spinner,
    Text,
    VStack,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Calendar, ChevronDown, Mail, Phone, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
    acceptInspectionBooking,
    confirmInspectionAttendance,
    declineInspectionBooking,
    getManagedPropertyInspectionsByProperty,
    inspectionRequestResponse,
    reportInspectionNoShow,
} from '../../../api';
import Navbar from './Navbar';

const PAGE_SIZE = 20;

const formatDate = (value) => {
    if (!value) return 'Not specified';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not specified' : date.toLocaleString();
};

const formatStatus = (value) => String(value || 'unknown').replace(/_/g, ' ');

export default function ManagedPropertyInspections() {
    const { propertyId } = useParams();
    const [property, setProperty] = useState(null);
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
    const [noShowReason, setNoShowReason] = useState('');
    const [noShowEvidence, setNoShowEvidence] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [selectedBookingAction, setSelectedBookingAction] = useState(null);
    const [bookingActionLoading, setBookingActionLoading] = useState(false);
    const [bookingActionError, setBookingActionError] = useState('');
    const {
        isOpen: isAttendanceOpen,
        onOpen: onOpenAttendance,
        onClose: onCloseAttendance,
    } = useDisclosure();
    const {
        isOpen: isNoShowOpen,
        onOpen: onOpenNoShow,
        onClose: onCloseNoShow,
    } = useDisclosure();
    const {
        isOpen: isBookingDecisionOpen,
        onOpen: onOpenBookingDecision,
        onClose: onCloseBookingDecision,
    } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
        return () => clearInterval(timer);
    }, []);

    const openNoShowModal = (inspection) => {
        setSelectedActionInspection(inspection);
        setNoShowReason('');
        setNoShowEvidence([{ file: null, reason: '' }]);
        setActionError('');
        onOpenNoShow();
    };

    const closeNoShowModal = () => {
        if (actionLoading) return;
        setSelectedActionInspection(null);
        setNoShowReason('');
        setNoShowEvidence([]);
        setActionError('');
        onCloseNoShow();
    };

    const openBookingDecisionModal = (inspection, action) => {
        setSelectedBookingAction({ inspection, action });
        setBookingActionError('');
        onOpenBookingDecision();
    };

    const closeBookingDecisionModal = () => {
        if (bookingActionLoading) return;
        setSelectedBookingAction(null);
        setBookingActionError('');
        onCloseBookingDecision();
    };

    const submitBookingDecision = async () => {
        const inspection = selectedBookingAction?.inspection;
        const inspectionId = inspection?._id || inspection?.id;
        if (!inspectionId) {
            setBookingActionError('This inspection is missing its ID. Refresh and try again.');
            return;
        }

        setBookingActionLoading(true);
        setBookingActionError('');
        try {
            if (selectedBookingAction.action === 'accept') {
                await acceptInspectionBooking(inspectionId);
            } else {
                await declineInspectionBooking(inspectionId);
            }

            const actionLabel = selectedBookingAction.action === 'accept' ? 'accepted' : 'declined';
            setSelectedBookingAction(null);
            onCloseBookingDecision();
            setRefreshKey((key) => key + 1);
            toast({
                title: `Booking ${actionLabel}`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to respond to inspection booking:', requestError);
            setBookingActionError(
                requestError?.response?.data?.message || 'Unable to update this booking. Please try again.',
            );
        } finally {
            setBookingActionLoading(false);
        }
    };

    const submitNoShowReport = async () => {
        const inspectionId = selectedActionInspection?._id || selectedActionInspection?.id;
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
        if (noShowReason.trim().length > 1000 || noShowEvidence.some((item) => item.reason.trim().length > 1000)) {
            setActionError('The report reason and each evidence reason must be 1000 characters or fewer.');
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
            console.error('Failed to report managed property inspection no-show:', requestError);
            setActionError(
                requestError?.response?.data?.message || 'Unable to submit the no-show report. Please try again.',
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

    const submitRescheduleResponse = async () => {
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
            setRefreshKey((key) => key + 1);
            toast({
                title: `Reschedule request ${decision}`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
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
                const response = await getManagedPropertyInspectionsByProperty(propertyId, {
                    page,
                    limit: PAGE_SIZE,
                });
                const payload = response?.data?.data || response?.data || {};
                console.log('Fetched managed property inspections:', payload);
                const pagination = payload.pagination || {};
                const result = Array.isArray(payload.inspections) ? payload.inspections : [];

                if (isMounted) {
                    setProperty(payload.property || null);
                    setInspections(result);
                    setPage(Number(pagination.page || page));
                    setTotal(Number(pagination.total ?? result.length));
                    setTotalPages(
                        Number(pagination.totalPages || pagination.pages)
                        || Math.max(1, Math.ceil(Number(pagination.total ?? result.length) / PAGE_SIZE)),
                    );
                }
            } catch (requestError) {
                console.error('Failed to load managed property inspections:', requestError);
                if (isMounted) {
                    setProperty(null);
                    setInspections([]);
                    setTotal(0);
                    setTotalPages(1);
                    setError(
                        requestError?.response?.data?.message
                        || 'Unable to load inspections for this property. Please try again.',
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (propertyId) fetchInspections();
        else {
            setError('A property ID is required to view inspections.');
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [propertyId, page, refreshKey]);

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
                            Property Inspections
                        </Text>
                        <Text color="whiteAlpha.800" mt={1}>
                            {property?.title || 'Inspection requests for your property'}
                        </Text>
                    </Box>
                </VStack>
            </Box>

            <VStack align="stretch" spacing={4} maxW="1000px" mx="auto" px={{ base: 4, md: 8 }} py={6}>
                {loading ? (
                    <VStack py={16} spacing={4}>
                        <Spinner size="xl" color="brand.primary" />
                        <Text color="brand.gray.600">Loading property inspections...</Text>
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
                            No inspections for this property
                        </Text>
                    </Box>
                ) : (
                    <>
                        <Text fontSize="sm" color="brand.gray.600">
                            {total} inspection{total === 1 ? '' : 's'}
                        </Text>
                        {inspections.map((inspection, index) => {
                            const tenant = inspection.tenant || {};
                            const inspectionId = inspection._id || `inspection-${index}`;
                            const viewingStatus = inspection.viewingStatus || 'unknown';
                            const paymentStatus = inspection.paymentStatus || 'unknown';
                            const hasPendingReschedule = inspection.rescheduleRequest?.status === 'pending';
                            const normalizedStatus = String(viewingStatus).toLowerCase().replace(/[\s-]+/g, '_');
                            const canRespondToBooking = normalizedStatus === 'pending_landlord_approval';
                            const canManage = !['cancelled', 'canceled', 'completed', 'rejected'].includes(normalizedStatus);
                            const canConfirmAttendance = normalizedStatus === 'scheduled' || normalizedStatus === 'rescheduled';
                            const gracePeriodMinutes = Number(inspection.gracePeriodMinutes);
                            const scheduledTime = new Date(inspection.scheduledAt).getTime();
                            const canReportNoShow = inspection.attendance?.landlordConfirmed === true
                                && inspection.attendance?.tenantConfirmed === true
                                && Number.isFinite(gracePeriodMinutes)
                                && Number.isFinite(scheduledTime)
                                && currentTime >= scheduledTime + gracePeriodMinutes * 60 * 1000;

                            return (
                                <Box key={inspectionId} bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="sm">
                                    <HStack justify="space-between" align="start" spacing={3} flexWrap="wrap">
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                                                {tenant.fullName || 'Tenant'}
                                            </Text>
                                            <Text fontSize="sm" color="brand.gray.600">
                                                {inspection.property?.title || property?.title || 'Property inspection'}
                                            </Text>
                                        </Box>
                                        <HStack spacing={2} flexWrap="wrap">
                                            <Badge colorScheme={viewingStatus === 'cancelled' ? 'red' : 'teal'}>
                                                {formatStatus(viewingStatus)}
                                            </Badge>
                                            <Badge colorScheme={paymentStatus === 'held' ? 'green' : 'gray'}>
                                                Payment: {formatStatus(paymentStatus)}
                                            </Badge>
                                            {canRespondToBooking && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="green"
                                                        onClick={() => openBookingDecisionModal(inspection, 'accept')}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="outline"
                                                        onClick={() => openBookingDecisionModal(inspection, 'decline')}
                                                    >
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                            {(canConfirmAttendance || canReportNoShow || hasPendingReschedule) && (
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
                                        {tenant.fullName && (
                                            <HStack spacing={2}>
                                                <User size={16} color="#00695C" />
                                                <Box>
                                                    <Text fontSize="xs" color="brand.gray.500">Tenant</Text>
                                                    <Text fontSize="sm" fontWeight="600">{tenant.fullName}</Text>
                                                </Box>
                                            </HStack>
                                        )}
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
                                                        Proposed date: {formatDate(inspection.rescheduleRequest.proposedDate)}
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
                                    {inspection.specialRequests && (
                                        <Text fontSize="sm" color="brand.gray.600" mt={2}>
                                            Request: {inspection.specialRequests}
                                        </Text>
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
                            onClick={submitRescheduleResponse}
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

            <Modal isOpen={isNoShowOpen} onClose={closeNoShowModal} isCentered size="xl">
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
                        <Button variant="ghost" onClick={closeNoShowModal} isDisabled={actionLoading}>
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

            <Modal isOpen={isBookingDecisionOpen} onClose={closeBookingDecisionModal} isCentered>
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>
                        {selectedBookingAction?.action === 'accept' ? 'Accept booking?' : 'Decline booking?'}
                    </ModalHeader>
                    <ModalCloseButton isDisabled={bookingActionLoading} />
                    <ModalBody>
                        <Text color="brand.gray.600">
                            {selectedBookingAction?.action === 'accept'
                                ? 'Confirm that you want to accept this inspection booking.'
                                : 'Confirm that you want to decline this inspection booking.'}
                        </Text>
                        {bookingActionError && (
                            <Text color="red.600" fontSize="sm" mt={3}>{bookingActionError}</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={closeBookingDecisionModal} isDisabled={bookingActionLoading}>
                            Cancel
                        </Button>
                        <Button
                            ml={3}
                            colorScheme={selectedBookingAction?.action === 'accept' ? 'green' : 'red'}
                            onClick={submitBookingDecision}
                            isLoading={bookingActionLoading}
                            loadingText="Submitting"
                        >
                            Confirm {selectedBookingAction?.action === 'accept' ? 'acceptance' : 'decline'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Navbar active="dashboard" />
        </Box>
    );
}
