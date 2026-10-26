import { useEffect, useRef, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Input,
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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Calendar, ChevronDown, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    cancelInspectionBooking,
    confirmInspectionAttendance,
    disputeViewingNoShow,
    getMyInspectionBookings,
    reportInspectionNoShow,
    requestInspectionReschedule,
} from '../../../api';
import Navbar from './Navbar';

const PAGE_SIZE = 10;

const formatDate = (date) => {
    if (!date) return 'Not specified';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'Not specified' : parsed.toLocaleString();
};

export default function MyInspectionBookings() {
    const [bookings, setBookings] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [proposedDate, setProposedDate] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [attendanceEvidence, setAttendanceEvidence] = useState([]);
    const [noShowReason, setNoShowReason] = useState('');
    const [noShowEvidence, setNoShowEvidence] = useState([]);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeEvidence, setDisputeEvidence] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const { isOpen: isRescheduleOpen, onOpen: onOpenReschedule, onClose: onCloseReschedule } = useDisclosure();
    const { isOpen: isCancelOpen, onOpen: onOpenCancel, onClose: onCloseCancel } = useDisclosure();
    const { isOpen: isAttendanceOpen, onOpen: onOpenAttendance, onClose: onCloseAttendance } = useDisclosure();
    const { isOpen: isNoShowOpen, onOpen: onOpenNoShow, onClose: onCloseNoShow } = useDisclosure();
    const { isOpen: isDisputeOpen, onOpen: onOpenDispute, onClose: onCloseDispute } = useDisclosure();
    const cancelRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
        return () => clearInterval(timer);
    }, []);

    const openReschedule = (booking) => {
        setSelectedBooking(booking);
        setProposedDate('');
        setRescheduleReason('');
        setActionError('');
        onOpenReschedule();
    };

    const openCancelConfirmation = (booking) => {
        setSelectedBooking(booking);
        setActionError('');
        onOpenCancel();
    };

    const openAttendanceModal = (booking) => {
        setSelectedBooking(booking);
        setAttendanceEvidence([{ file: null, description: '' }]);
        setActionError('');
        onOpenAttendance();
    };

    const updateAttendanceEvidence = (index, field, value) => {
        setAttendanceEvidence((currentEvidence) => currentEvidence.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const handleAttendanceConfirmation = async () => {
        const bookingId = selectedBooking?._id || selectedBooking?.id;
        if (!bookingId) {
            setActionError('This inspection is missing its booking ID. Refresh and try again.');
            return;
        }
        if (attendanceEvidence.length === 0 || attendanceEvidence.some((item) => !item.file || !item.description.trim())) {
            setActionError('Upload an image and enter a description for every evidence item.');
            return;
        }
        if (attendanceEvidence.length > 5) {
            setActionError('You can submit no more than 5 image evidence items.');
            return;
        }
        if (attendanceEvidence.some((item) => item.description.trim().length > 1000)) {
            setActionError('Each evidence description must be 1000 characters or fewer.');
            return;
        }
        if (attendanceEvidence.some((item) => !item.file.type.startsWith('image/'))) {
            setActionError('Only image files can be uploaded as attendance evidence.');
            return;
        }

        const evidence = attendanceEvidence.map((item) => ({
            file: item.file,
            description: item.description.trim(),
        }));

        setActionLoading(true);
        setActionError('');
        try {
            await confirmInspectionAttendance(bookingId, evidence);
            onCloseAttendance();
            setSelectedBooking(null);
            setAttendanceEvidence([]);
            setRefreshKey((currentKey) => currentKey + 1);
            toast({
                title: 'Attendance confirmed',
                description: 'Your attendance confirmation and evidence have been submitted.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to confirm inspection attendance:', requestError);
            setActionError(requestError?.response?.data?.message || 'Unable to confirm attendance. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const openNoShowModal = (booking) => {
        setSelectedBooking(booking);
        setNoShowReason('');
        setNoShowEvidence([{ file: null, reason: '' }]);
        setActionError('');
        onOpenNoShow();
    };

    const updateNoShowEvidence = (index, field, value) => {
        setNoShowEvidence((items) => items.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const handleNoShowReport = async () => {
        const bookingId = selectedBooking?._id || selectedBooking?.id;
        if (!bookingId) {
            setActionError('This inspection is missing its booking ID. Refresh and try again.');
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

        const evidence = noShowEvidence.map(({ file, reason }) => ({
            file,
            reason: reason.trim(),
        }));

        setActionLoading(true);
        setActionError('');
        try {
            await reportInspectionNoShow(bookingId, noShowReason.trim(), evidence);
            onCloseNoShow();
            setSelectedBooking(null);
            setNoShowReason('');
            setNoShowEvidence([]);
            setRefreshKey((key) => key + 1);
            toast({
                title: 'No-show report submitted',
                description: 'Your report and evidence have been sent for review.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to report inspection no-show:', requestError);
            setActionError(requestError?.response?.data?.message || 'Unable to submit the no-show report. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const openDisputeModal = (booking) => {
        setSelectedBooking(booking);
        setDisputeReason('');
        setDisputeEvidence([{ url: '' }]);
        setActionError('');
        onOpenDispute();
    };

    const closeDisputeModal = () => {
        if (actionLoading) return;
        setSelectedBooking(null);
        setDisputeReason('');
        setDisputeEvidence([]);
        setActionError('');
        onCloseDispute();
    };

    const handleNoShowDispute = async () => {
        const bookingId = selectedBooking?._id || selectedBooking?.id;
        if (!bookingId) {
            setActionError('This inspection is missing its booking ID. Refresh and try again.');
            return;
        }
        if (!disputeReason.trim()) {
            setActionError('Enter a reason for disputing the no-show report.');
            return;
        }
        if (disputeEvidence.length === 0 || disputeEvidence.length > 5 || disputeEvidence.some((item) => !item.url.trim())) {
            setActionError('Provide an image URL for each of up to 5 evidence items.');
            return;
        }
        const invalidUrl = disputeEvidence.find((item) => {
            try {
                const url = new URL(item.url.trim());
                return !['http:', 'https:'].includes(url.protocol);
            } catch {
                return true;
            }
        });
        if (invalidUrl) {
            setActionError('Enter a valid HTTPS or HTTP image URL for each evidence item.');
            return;
        }

        const evidence = disputeEvidence.map(({ url }) => ({ url: url.trim() }));
        setActionLoading(true);
        setActionError('');
        try {
            await disputeViewingNoShow(bookingId, evidence, disputeReason.trim());
            onCloseDispute();
            setSelectedBooking(null);
            setDisputeReason('');
            setDisputeEvidence([]);
            setRefreshKey((key) => key + 1);
            toast({
                title: 'No-show dispute submitted',
                description: 'Your dispute and evidence have been sent for review.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to dispute inspection no-show:', requestError);
            setActionError(requestError?.response?.data?.message || 'Unable to submit the dispute. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async () => {
        const proposedDateValue = new Date(proposedDate);
        if (!selectedBooking?._id && !selectedBooking?.id) {
            setActionError('This inspection is missing its booking ID. Refresh and try again.');
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
                selectedBooking._id || selectedBooking.id,
                proposedDateValue.toISOString(),
                rescheduleReason.trim(),
            );
            onCloseReschedule();
            setSelectedBooking(null);
            setRefreshKey((currentKey) => currentKey + 1);
            toast({
                title: 'Reschedule request sent',
                description: 'Your proposed inspection date has been submitted.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to request inspection reschedule:', requestError);
            setActionError(requestError?.response?.data?.message || 'Unable to request a reschedule. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking?._id && !selectedBooking?.id) {
            setActionError('This inspection is missing its booking ID. Refresh and try again.');
            return;
        }

        setActionLoading(true);
        setActionError('');
        try {
            await cancelInspectionBooking(selectedBooking._id || selectedBooking.id);
            onCloseCancel();
            setSelectedBooking(null);
            setRefreshKey((currentKey) => currentKey + 1);
            toast({
                title: 'Inspection cancelled',
                description: 'Your inspection booking has been cancelled.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (requestError) {
            console.error('Failed to cancel inspection booking:', requestError);
            setActionError(requestError?.response?.data?.message || 'Unable to cancel this inspection. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const closeCancelDialog = () => {
        if (actionLoading) return;
        setSelectedBooking(null);
        setActionError('');
        onCloseCancel();
    };

    const closeRescheduleModal = () => {
        if (actionLoading) return;
        setSelectedBooking(null);
        setActionError('');
        onCloseReschedule();
    };

    const closeAttendanceModal = () => {
        if (actionLoading) return;
        setSelectedBooking(null);
        setAttendanceEvidence([]);
        setActionError('');
        onCloseAttendance();
    };

    const closeNoShowModal = () => {
        if (actionLoading) return;
        setSelectedBooking(null);
        setNoShowReason('');
        setNoShowEvidence([]);
        setActionError('');
        onCloseNoShow();
    };

    useEffect(() => {
        let isMounted = true;

        const fetchBookings = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await getMyInspectionBookings({
                    page,
                    limit: PAGE_SIZE,
                    sortBy: 'scheduledAt',
                    order: 'desc',
                });
                const payload = response?.data?.data || response?.data || {};
                console.log('Fetched inspection bookings:', payload);
                const results = Array.isArray(payload)
                    ? payload
                    : payload.commitments || payload.bookings || payload.viewingCommitments || payload.items || [];
                const list = Array.isArray(results) ? results : [];
                const pagination = payload.pagination || payload.meta || response?.data?.pagination || {};
                const pages = Number(pagination.totalPages || pagination.pages || pagination.pageCount)
                    || Math.max(1, Math.ceil(Number(pagination.total || list.length) / PAGE_SIZE));

                if (isMounted) {
                    setBookings(list);
                    setTotalPages(pages);
                    setTotal(Number(pagination.total ?? list.length));
                    setPage(Number(pagination.page || page));
                }
            } catch (requestError) {
                console.error('Failed to load inspection bookings:', requestError);
                if (isMounted) {
                    setBookings([]);
                    setTotal(0);
                    setTotalPages(1);
                    setError(requestError?.response?.data?.message || 'Unable to load your inspection bookings. Please try again.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchBookings();
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
                            My Inspections Bookings
                        </Text>
                        <Text color="whiteAlpha.800" mt={1}>
                            View the inspection requests you have booked.
                        </Text>
                    </Box>
                </VStack>
            </Box>

            <VStack align="stretch" spacing={4} maxW="1000px" mx="auto" px={{ base: 4, md: 8 }} py={6}>
                {loading ? (
                    <VStack py={16} spacing={4}>
                        <Spinner size="xl" color="brand.primary" />
                        <Text color="brand.gray.600">Loading your inspections...</Text>
                    </VStack>
                ) : error ? (
                    <VStack bg="white" p={8} borderRadius="xl" spacing={4}>
                        <Text color="red.600" textAlign="center">{error}</Text>
                        <Button colorScheme="teal" onClick={() => setRefreshKey((currentKey) => currentKey + 1)}>
                            Try again
                        </Button>
                    </VStack>
                ) : bookings.length === 0 ? (
                    <Box bg="white" p={8} borderRadius="xl" textAlign="center">
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            No inspections booked yet
                        </Text>
                        <Text mt={2} color="brand.gray.600">
                            Your inspection requests will appear here after you book one.
                        </Text>
                    </Box>
                ) : (
                    <>
                        <Text fontSize="sm" color="brand.gray.600">
                            {total} inspection{total === 1 ? '' : 's'}
                        </Text>
                        {bookings.map((booking, index) => {
                            const property = booking.property
                                || (typeof booking.propertyId === 'object' ? booking.propertyId : {});
                            const bookingId = booking._id || booking.id || `inspection-${index}`;
                            const status = booking.viewingStatus || booking.status || 'Pending';
                            const title = property.title || property.propertyType || booking.propertyTitle || 'Property inspection';
                            const normalizedStatus = String(status).toLowerCase().replace(/[\s-]+/g, '_');
                            const canManage = !['cancelled', 'canceled', 'completed', 'rejected'].includes(normalizedStatus);
                            const canConfirmAttendance = normalizedStatus === 'scheduled' || normalizedStatus === 'rescheduled';
                            const gracePeriodMinutes = Number(booking.gracePeriodMinutes);
                            const scheduledTime = new Date(booking.scheduledAt).getTime();
                            const canReportNoShow = booking.attendance?.tenantConfirmed === true
                                && booking.attendance?.landlordConfirmed === false
                                && Number.isFinite(gracePeriodMinutes)
                                && Number.isFinite(scheduledTime)
                                && currentTime >= scheduledTime + gracePeriodMinutes * 60 * 1000;
                            const canDisputeNoShow = normalizedStatus === 'no_show_reported'
                                && booking.attendance?.tenantConfirmed === false;
                            const address = property.address?.area
                                || property.address?.city
                                || property.location?.area
                                || property.location?.city
                                || (typeof property.address === 'string' ? property.address : '')
                                || '';

                            return (
                                <Box key={bookingId} bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="sm">
                                    <HStack justify="space-between" align="start" spacing={3} flexWrap="wrap">
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                                                {title}
                                            </Text>
                                            {address && (
                                                <HStack mt={1} spacing={1} color="brand.gray.600">
                                                    <MapPin size={14} />
                                                    <Text fontSize="sm">{address}</Text>
                                                </HStack>
                                            )}
                                        </Box>
                                        <Badge colorScheme={String(status).toLowerCase().includes('cancel') ? 'red' : 'teal'}>
                                            {String(status).replace(/_/g, ' ')}
                                        </Badge>
                                    </HStack>

                                    <Divider my={4} />

                                    <HStack align="start" spacing={{ base: 4, md: 10 }} flexWrap="wrap">
                                        <HStack spacing={2} align="start">
                                            <Calendar size={16} color="#00695C" />
                                            <Box>
                                                <Text fontSize="xs" color="brand.gray.500">Scheduled</Text>
                                                <Text fontSize="sm" fontWeight="600">{formatDate(booking.scheduledAt)}</Text>
                                            </Box>
                                        </HStack>
                                        <HStack spacing={2} align="start">
                                            <Users size={16} color="#00695C" />
                                            <Box>
                                                <Text fontSize="xs" color="brand.gray.500">Visitors</Text>
                                                <Text fontSize="sm" fontWeight="600">{booking.numberOfVisitors ?? 'Not specified'}</Text>
                                            </Box>
                                        </HStack>
                                        {booking.paymentStatus && (
                                            <Box>
                                                <Text fontSize="xs" color="brand.gray.500">Payment</Text>
                                                <Text fontSize="sm" fontWeight="600">{String(booking.paymentStatus).replace(/_/g, ' ')}</Text>
                                            </Box>
                                        )}
                                    </HStack>

                                    {booking.alternativeDate && (
                                        <Text fontSize="sm" color="brand.gray.600" mt={4}>
                                            Alternative date: {formatDate(booking.alternativeDate)}
                                        </Text>
                                    )}
                                    {booking.specialRequests && (
                                        <Text fontSize="sm" color="brand.gray.600" mt={2}>
                                            Request: {booking.specialRequests}
                                        </Text>
                                    )}
                                    {canManage && (
                                        <Menu>
                                            <MenuButton
                                                as={Button}
                                                mt={5}
                                                size="sm"
                                                variant="outline"
                                                rightIcon={<ChevronDown size={16} />}
                                            >
                                                More actions
                                            </MenuButton>
                                            <MenuList>
                                                {canConfirmAttendance && (
                                                    <MenuItem onClick={() => openAttendanceModal(booking)}>
                                                        Confirm attendance
                                                    </MenuItem>
                                                )}
                                                {canReportNoShow && (
                                                    <MenuItem color="red.600" onClick={() => openNoShowModal(booking)}>
                                                        Report no-show
                                                    </MenuItem>
                                                )}
                                                {canDisputeNoShow && (
                                                    <MenuItem color="orange.600" onClick={() => openDisputeModal(booking)}>
                                                        Dispute no-show
                                                    </MenuItem>
                                                )}
                                                <MenuItem onClick={() => openReschedule(booking)}>
                                                    Reschedule inspection
                                                </MenuItem>
                                                <MenuItem color="red.600" onClick={() => openCancelConfirmation(booking)}>
                                                    Cancel inspection
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
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
                                    onChange={(event) => setProposedDate(event.target.value)}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Reason (optional)</FormLabel>
                                <Textarea
                                    value={rescheduleReason}
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
                            onClick={handleReschedule}
                            isLoading={actionLoading}
                            loadingText="Sending request"
                        >
                            Send request
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isAttendanceOpen} onClose={closeAttendanceModal} isCentered size="xl">
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Confirm inspection attendance</ModalHeader>
                    <ModalCloseButton isDisabled={actionLoading} />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text color="brand.gray.600">
                                Upload up to 5 image evidence items and add a description for each.
                            </Text>
                            {attendanceEvidence.map((item, index) => (
                                <Box key={index} border="1px solid" borderColor="brand.gray.200" borderRadius="lg" p={4}>
                                    <HStack justify="space-between" mb={3}>
                                        <Text fontWeight="600">Evidence {index + 1}</Text>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            isDisabled={actionLoading}
                                            onClick={() => setAttendanceEvidence((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                                        >
                                            Remove
                                        </Button>
                                    </HStack>
                                    <VStack align="stretch" spacing={3}>
                                        <FormControl>
                                            <FormLabel>Image</FormLabel>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                isDisabled={actionLoading}
                                                onChange={(event) => updateAttendanceEvidence(index, 'file', event.target.files?.[0] || null)}
                                            />
                                            {item.file && (
                                                <Text fontSize="sm" color="brand.gray.600" mt={1}>
                                                    {item.file.name}
                                                </Text>
                                            )}
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Description</FormLabel>
                                            <Textarea
                                                value={item.description}
                                                maxLength={1000}
                                                isDisabled={actionLoading}
                                                onChange={(event) => updateAttendanceEvidence(index, 'description', event.target.value)}
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
                                    isDisabled={actionLoading}
                                    onClick={() => setAttendanceEvidence((items) => [
                                        ...items,
                                        { file: null, description: '' },
                                    ])}
                                >
                                    Add image evidence
                                </Button>
                            )}
                            {actionError && <Text color="red.600" fontSize="sm">{actionError}</Text>}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={closeAttendanceModal} isDisabled={actionLoading}>
                            Close
                        </Button>
                        <Button
                            colorScheme="teal"
                            ml={3}
                            onClick={handleAttendanceConfirmation}
                            isLoading={actionLoading}
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
                                Report that the other party did not attend after the grace period. Add an overall reason and up to 5 image evidence items, each with its own reason.
                            </Text>
                            <FormControl isRequired>
                                <FormLabel>Report reason</FormLabel>
                                <Textarea
                                    value={noShowReason}
                                    maxLength={1000}
                                    isDisabled={actionLoading}
                                    onChange={(event) => setNoShowReason(event.target.value)}
                                    placeholder="Explain what happened during the inspection"
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
                                            onClick={() => setNoShowEvidence((items) => items.filter((_, itemIndex) => itemIndex !== index))}
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
                                                onChange={(event) => updateNoShowEvidence(index, 'file', event.target.files?.[0] || null)}
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
                                                onChange={(event) => updateNoShowEvidence(index, 'reason', event.target.value)}
                                                placeholder="Explain what this image shows"
                                            />
                                            <Text textAlign="right" fontSize="xs" color="brand.gray.500">
                                                {item.reason.length}/1000
                                            </Text>
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
                            onClick={handleNoShowReport}
                            isLoading={actionLoading}
                            loadingText="Submitting report"
                        >
                            Submit report
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isDisputeOpen} onClose={closeDisputeModal} isCentered size="xl">
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
                                            onClick={() => setDisputeEvidence((items) => items.filter((_, itemIndex) => itemIndex !== index))}
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
                        <Button variant="ghost" onClick={closeDisputeModal} isDisabled={actionLoading}>
                            Close
                        </Button>
                        <Button
                            colorScheme="orange"
                            ml={3}
                            onClick={handleNoShowDispute}
                            isLoading={actionLoading}
                            loadingText="Submitting dispute"
                        >
                            Submit dispute
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isCancelOpen}
                leastDestructiveRef={cancelRef}
                onClose={closeCancelDialog}
                isCentered
                closeOnEsc={!actionLoading}
                closeOnOverlayClick={!actionLoading}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent mx={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Cancel inspection?
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to cancel this inspection booking? This action cannot be undone.
                            {actionError && <Text color="red.600" mt={3}>{actionError}</Text>}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={closeCancelDialog} isDisabled={actionLoading}>
                                Keep booking
                            </Button>
                            <Button
                                colorScheme="red"
                                ml={3}
                                onClick={handleCancelBooking}
                                isLoading={actionLoading}
                                loadingText="Cancelling"
                            >
                                Cancel inspection
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <Navbar active="dashboard" />
        </Box>
    );
}
