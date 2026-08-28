import { useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Grid,
    Text,
    Badge,
    Button,
    Avatar,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerCloseButton,
    useToast,
    useDisclosure,
    PinInput,
    PinInputField,
    Spinner,
    Icon,
    Stack,
} from '@chakra-ui/react';
import {
    Search,
    MapPin,
    Home,
    User,
    FileText,
    ShieldCheck,
    Plus,
    TrendingUp,
    Building2,
    ClipboardList,
    Briefcase,
    VerifiedIcon,
    Bell,
} from 'lucide-react';
import { Menu, MenuButton, MenuList, MenuItem, FormControl, FormLabel } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import PropertyCard from './PropertyCard';
import TrustBanner from './TrustBanner';
import TestimonialCard from './TestimonialCard';
import BeforeAfter from './BeforeAfter';
import FilterSearch from './FilterSearch';
import { mockInspections, mockProperties } from './mockData';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { confirmInspection, deleteProperty, getAllEscrowPayments, getAnalyticsDashboardAndProperties, getUnreadCount, getUserProperties, releaseFunds, releaseKeys, refundEscrow, downloadTenancyDoc } from '../../../api';
import { reference } from '@popperjs/core';
import DownloadAgreementButton from './downloadAgreementButton';
// import DownloadAgreementButton from './downloadAgreementButton';


export default function Dashboard({ onNavigate, user, setUpdatedFormdata }) {
    const [activeTab, setActiveTab] = useState(0);
    const [transactionPin, setTransactionPin] = useState('');
    const [transactionAction, setTransactionAction] = useState('pay');
    const [listingsPage, setListingsPage] = useState(1);
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [myProperties, setMyProperties] = useState([])
    const [escrowTransactions, setEscrowTransactions] = useState([])
    const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [allData, setAllData] = useState({})
    const [loading, setLoading] = useState(true);
    const { isOpen: isReleaseOpen, onOpen: onOpenRelease, onClose: onCloseRelease } = useDisclosure();
    const [releaseCode, setReleaseCode] = useState('');
    const [selectedEscrowAction, setSelectedEscrowAction] = useState(null);
    const [releasing, setReleasing] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const { isOpen: isRefundOpen, onOpen: onOpenRefund, onClose: onCloseRefund } = useDisclosure();
    const [refundReason, setRefundReason] = useState('');
    const [refundAuthCode, setRefundAuthCode] = useState('');
    const [refunding, setRefunding] = useState(false);
    const { isOpen: isDetailOpen, onOpen: onOpenDetails, onClose: onCloseDetails } = useDisclosure();
    const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
    const [releasedEscrows, setReleasedEscrows] = useState("0")
    const [releasingEscrows, setReleasingEscrows] = useState("0")
    const [releaseFailedEscrows, setReleaseFailedEscrows] = useState("0")
    const [refundedEscrows, setRefundedEscrows] = useState("0")
    const [totalProperties, setTotalProperties] = useState(0)
    const [downloading, setDownloading] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState("0")

    const location = useLocation();

    const openPropertyDetails = (property) => {
        setSelectedPropertyDetails(property);
        onOpenDetails();
    };

    const { parameter } = location.state || {};
    const tab = parameter
    console.log("user tab", tab)

    const itemsPerPage = 4;
    const { isOpen: isPinOpen, onOpen: onOpenPin, onClose: onClosePin } = useDisclosure();

    const listingsTotalPages = Math.ceil(mockProperties.length / itemsPerPage);
    const navigate = useNavigate()
    // Pagination calculations for listings
    const listingsStartIndex = (listingsPage - 1) * itemsPerPage;
    const listingsEndIndex = listingsStartIndex + itemsPerPage;
    const paginatedListings = myProperties.slice(listingsStartIndex, listingsEndIndex);


    // Pagination calculations for transactions
    // transactions pagination handled by API; UI buttons use `transactionsTotalPages`

    useEffect(() => {
        if (tab == 1) {
            setActiveTab(1)
        }
        else if (tab == 2) {
            setActiveTab(2)
        } else {
            setActiveTab(0)
        }

        const fetchProperties = async () => {
            try {
                const analyticsResponse = await getAnalyticsDashboardAndProperties();
                setMyProperties(analyticsResponse.data.data.propertiesWithInquiries || []);
                setListingsPage(1)
                setTotalProperties(analyticsResponse.data.data.totalProperties / itemsPerPage)
                setAllData(analyticsResponse.data.data || {});
                console.log("this is the anyalytics", analyticsResponse)
            } catch (error) {
                console.error("Failed to fetch properties:", error);
                setMyProperties([]);
            }
        };

        const fetchUnreadCount = async () => {
            console.log("counting unread")
            try {
                const response = await getUnreadCount();
                const count = response?.data?.data?.count ?? response?.data?.count ?? response?.data ?? 0;
                setUnreadNotificationsCount(Number(count) || 0);
                console.log("count", count)
            } catch (error) {
                console.error('Failed to fetch unread notifications count:', error);
                setUnreadNotificationsCount(0);
            }
        };

        const loadDashboard = async () => {
            await Promise.all([fetchProperties(), fetchUnreadCount()]);
            setLoading(false);
        };

        loadDashboard();
    }, []);

    // Fetch escrow transactions for the current transactionsPage
    useEffect(() => {
        let mounted = true;
        const fetchEscrowPage = async (page = 1) => {
            setTransactionsLoading(true);
            try {
                const resp = await getAllEscrowPayments({ page, limit: itemsPerPage });
                console.log("escrow transactions response", resp);
                const data = resp?.data?.data?.escrow || resp?.data || {};
                console.log("escrow:", resp.data.data.pagination.total)
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data.payments)
                        ? data.payments
                        : Array.isArray(data.items)
                            ? data.items
                            : Array.isArray(data.transactions)
                                ? data.transactions
                                : [];

                const pagination = resp.data.data.pagination || resp?.data?.pagination || data.meta || {};
                const totalPages = pagination.pages || pagination.totalPages || pagination.pageCount || Math.ceil((pagination.total || list.length) / itemsPerPage) || 1;
                const released = resp.data.data.released
                const releasing = resp.data.data.releasing
                const release_failed = resp.data.data.release_failed
                const refunded = resp.data.data.refunded

                if (!mounted) return;
                setEscrowTransactions(list);
                setTransactionsTotalPages(totalPages);
                setReleasedEscrows(released)
                setReleasingEscrows(releasing)
                setReleaseFailedEscrows(release_failed)
                setRefundedEscrows(refunded)

            } catch (err) {
                console.error('Failed to load escrow transactions', err);
                if (mounted) setEscrowTransactions([]);
            } finally {
                if (mounted) setTransactionsLoading(false);
            }
        };

        fetchEscrowPage(transactionsPage);
        return () => { mounted = false; };
    }, [transactionsPage]);


    const openPinModal = (action) => {
        setTransactionAction(action);
        onOpenPin();
    };

    const handlePinSubmit = () => {
        if (transactionPin.trim().length < 4) {
            alert('Please enter your 4-digit transaction PIN.');
            return;
        }

        const actionLabel = transactionAction === 'refund' ? 'refund request' : 'payment';

        setTransactionPin('');
        onClosePin();
        alert(`Transaction initiated. Please check your email to complete the ${actionLabel}.`);
    };

    const deleteMyProperty = (id) => {
        (async () => {
            try {
                const response = await deleteProperty(id);
                console.log("item deleted", response);
                toast({ title: 'Property deleted', status: 'success' });

            } catch (error) {
                console.log("not deleted", error.response);
                toast({ title: error.response.data.message, status: 'error' });
            }
        })();
    }

    const toast = useToast();

    const handleEscrowAction = async (action, escrow) => {
        // placeholder handlers - replace with real API calls as needed
        console.log(`escrow action: ${action}`, escrow);
        switch (action) {
            case 'release':
                setSelectedEscrowAction(escrow);
                setReleaseCode('');
                onOpenRelease();
                return;
            case 'refund':
                setSelectedEscrowAction(escrow);
                setRefundReason('');
                setRefundAuthCode('');
                onOpenRefund();
                return;
            case 'dispute':
                toast({ title: 'Dispute submitted', status: 'warning' });
                break;
            case 'inspected':
                handleInspected(escrow)
                toast({ title: 'Inspection confirmed', status: 'success' });
                break;
            default:
                toast({ title: 'Action triggered', status: 'info' });
        }
    };

    const editProperty = (data) => {
        setUpdatedFormdata(data);
        navigate("/update-listing/steps", { state: { propertyId: data._id } })
    }

    const handleReleasedKeys = async (id) => {
        try {
            const res = await releaseKeys(id);
            console.log(res)
            toast({ title: 'Release confirmation', discription: res.data.data.message || res.data.message, status: 'success' });
        } catch (error) {
            console.log(error)
            toast({ title: 'Release confirmation', discription: error.response.data.message, status: 'info' });
        }
    }

    const handleInspected = async (escrow) => {
        console.log("called inspect");
        try {
            const res = await confirmInspection(escrow._id);
            console.log(res?.data?.data?.message);

            toast({
                title: 'Inspection confirmation',
                description: res?.data?.data?.message,
                status: 'success',
            });

            setEscrowTransactions(prev =>
                prev.map(item =>
                    item._id === escrow._id
                        ? { ...item, status: "inspection_confirmed" }
                        : item
                )
            );
        } catch (error) {
            console.log("this is the error response:", error?.response?.data?.message);
            toast({
                title: 'Release confirmation',
                description: error?.response?.data?.message,
                status: 'info',
            });
        }
    };


    const submitRefund = async (escrow) => {
        if (!selectedEscrowAction) return;
        if (!refundReason || refundReason.trim().length < 5) {
            toast({ title: 'Enter a valid reason for refund (min 5 chars)', status: 'warning' });
            return;
        }
        if (!refundAuthCode || refundAuthCode.trim().length < 4) {
            toast({ title: 'Enter your authenticator code', status: 'warning' });
            return;
        }

        setRefunding(true);
        try {
            const id = selectedEscrowAction._id || selectedEscrowAction.id || selectedEscrowAction.reference;
            const res = await refundEscrow(id, refundReason, refundAuthCode);
            toast({ title: res?.data?.message || 'Refund requested', status: 'success' });

            onCloseRefund();
            setSelectedEscrowAction(null);
            setRefundReason('');
            setRefundAuthCode('');
            setEscrowTransactions(prev =>
                prev.map(item =>
                    item._id === selectedEscrowAction._id
                        ? { ...item, status: "refunded" }
                        : item
                )
            );
        } catch (err) {
            console.error('Refund failed', err);
            toast({ title: err?.response?.data?.message || 'Failed to request refund', status: 'error' });
        } finally {
            setRefunding(false);
        }
    }

    const downloadAgreement = async (escrowId) => {
        setDownloading(true);
        try {
            const response = await downloadTenancyDoc(escrowId); // already blob
            const blob = response.data; // axios puts blob in .data
            console.log(response)
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `LazyHome-Tenancy-${escrowId}.pdf`; // use escrowId or tenancyId
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    };

    // const downloadAgreement = async (id) => {
    //     const token = localStorage.getItem("accessToken");
    //     const res = await fetch(`/api/v1/escrow/tenancy/${id}/download`, {
    //         headers: { Authorization: `Bearer ${token}` }
    //     });
    //     const blob = await res.blob();
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = `tenancy-${id}.pdf`;
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    // };



    if (loading) {
        return (
            <Box
                minH="100vh"
                bg="brand.background"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <VStack spacing={4} p={8} bg="white" borderRadius="xl" boxShadow="lg">
                    <Spinner size="xl" color="brand.primary" thickness="4px" />
                    <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
                        Loading my Dashboard
                    </Text>
                </VStack>
            </Box>
        );
    }

    if (!myProperties) {
        return (
            <Box
                minH="100vh"
                bg="brand.background"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <VStack spacing={4} p={8} bg="white" borderRadius="xl" boxShadow="lg">
                    <Icon as={AlertCircle} w={10} h={10} color="red.500" />
                    <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
                        My properties not found.
                    </Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg="brand.background" pb="80px">
            <VStack spacing={0} align="stretch">
                <Box bg="brand.primary" px={6} pt={12} pb={4}>
                    <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold" color="white">
                                SafeTenants
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.800">
                                Welcome back, {user.fullName.split(' ')[0]}!
                            </Text>
                        </VStack>

                        <HStack spacing={3} align="center">
                            {/* {Number(unreadNotificationsCount) <= 0 && ( */}
                            <Link to="/notifications" >
                                <Box position="relative" display="flex" alignItems="center" justifyContent="center">
                                    <Box
                                        bg="whiteAlpha.200"
                                        border="1px solid"
                                        borderColor="whiteAlpha.300"
                                        borderRadius="full"
                                        p={2.5}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        cursor="pointer"
                                    >
                                        <Icon as={Bell} color="white" boxSize={4} />
                                    </Box>
                                    <Badge
                                        position="absolute"
                                        top="-4px"
                                        right="-2px"
                                        borderRadius="full"
                                        colorScheme="red"
                                        fontSize="10px"
                                        px={1.5}
                                        minW="18px"
                                        h="18px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {unreadNotificationsCount}
                                    </Badge>
                                </Box>
                            </Link>
                            {/* )} */}
                            <Avatar
                                size="md"
                                name={user.fullName || "John Adeyemi"}
                                src={user.image || "https://i.pravatar.cc/150?img=33"}
                                cursor="pointer"
                            />
                        </HStack>
                    </HStack>

                    <Tabs
                        index={activeTab}
                        onChange={setActiveTab}
                        variant="unstyled"
                        colorScheme="whiteAlpha"
                    >
                        <TabList
                            bg="whiteAlpha.200"
                            borderRadius="lg"
                            p={1}
                            overflowX="auto"
                            css={{
                                '&::-webkit-scrollbar': { display: 'none' },
                                scrollbarWidth: 'none',
                            }}
                        >

                            <Tab
                                fontSize="sm"
                                fontWeight="600"
                                color="whiteAlpha.800"
                                _selected={{
                                    bg: 'white',
                                    color: 'brand.primary',
                                    borderRadius: 'md',
                                }}
                                flex={1}
                                minW="fit-content"
                                py={2}
                            >
                                <HStack spacing={2}>
                                    <Building2 size={16} />
                                    <Text>My Listings</Text>
                                </HStack>
                            </Tab>
                            <Tab
                                fontSize="sm"
                                fontWeight="600"
                                color="whiteAlpha.800"
                                _selected={{
                                    bg: 'white',
                                    color: 'brand.primary',
                                    borderRadius: 'md',
                                }}
                                flex={1}
                                minW="fit-content"
                                py={2}
                            >
                                <HStack spacing={2}>
                                    <ClipboardList size={16} />
                                    <Text>My Deals</Text>
                                </HStack>
                            </Tab>
                            <Tab
                                fontSize="sm"
                                fontWeight="600"
                                color="whiteAlpha.800"
                                _selected={{
                                    bg: 'white',
                                    color: 'brand.primary',
                                    borderRadius: 'md',
                                }}
                                flex={1}
                                minW="fit-content"
                                py={2}
                            >
                                <HStack spacing={2}>
                                    <Briefcase size={16} />
                                    <Text>Stats</Text>
                                </HStack>
                            </Tab>
                        </TabList>

                        <TabPanels>


                            {/* MY LISTINGS TAB */}
                            <TabPanel p={0}>
                                <VStack spacing={4} align="stretch" pt={4}>
                                    <Button
                                        as={Link}
                                        to="/create-listing/steps"
                                        variant="solid"
                                        size="lg"
                                        bg="white"
                                        color="brand.primary"
                                        leftIcon={<Plus size={20} />}
                                        _hover={{ bg: 'whiteAlpha.900' }}
                                    >
                                        Create New Listing
                                    </Button>

                                    <Box bg="white" borderRadius="lg" p={4}>
                                        <HStack justify="space-between">
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                                                    {myProperties.reduce((total, property) => total + (property.approved ? 1 : 0), 0)}
                                                </Text>
                                                <Text fontSize="xs" color="brand.gray.600">
                                                    Active Listings
                                                </Text>
                                            </VStack>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="2xl" fontWeight="bold" color="brand.success">
                                                    ₦{myProperties.reduce((total, property) => total + property.rentAmount, 0).toLocaleString()}
                                                </Text>
                                                <Text fontSize="xs" color="brand.gray.600">
                                                    Total Value
                                                </Text>
                                            </VStack>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="2xl" fontWeight="bold" color="brand.warning">
                                                    {myProperties.reduce((total, property) => total + (property.approved === false ? 1 : 0), 0)}
                                                </Text>
                                                <Text fontSize="xs" color="brand.gray.600">
                                                    Pending approval
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                </VStack>
                            </TabPanel>

                            {/* MY DEALS TAB */}
                            <TabPanel p={0}>
                                <VStack spacing={4} align="stretch" pt={4}>
                                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                        <Box bg="white" borderRadius="lg" p={4} textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                                                {releasedEscrows}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Released
                                            </Text>
                                        </Box>
                                        <Box bg="white" borderRadius="lg" p={4} textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.success">
                                                {releasingEscrows}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Releasing
                                            </Text>
                                        </Box>
                                        <Box bg="white" borderRadius="lg" p={4} textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.accent">
                                                {refundedEscrows}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Refunded
                                            </Text>
                                        </Box>
                                        <Box bg="white" borderRadius="lg" p={4} textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.warning">
                                                {releaseFailedEscrows}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Release faid
                                            </Text>
                                        </Box>
                                    </Grid>

                                    <Text fontSize="sm" fontWeight="600" color="white">
                                        Recent Activity
                                    </Text>
                                </VStack>
                            </TabPanel>

                            {/* STATS TAB */}
                            <TabPanel p={0}>
                                <VStack spacing={4} align="stretch" pt={4}>
                                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                        <Box bg="white" borderRadius="lg" p={4}>
                                            <Stat>
                                                <StatLabel color="brand.gray.600" fontSize="xs">
                                                    Total Earnings
                                                </StatLabel>
                                                <StatNumber color="brand.primary" fontSize="xl">
                                                    ₦{allData.totalRevenue}
                                                </StatNumber>
                                                <StatHelpText color="brand.success" fontSize="xs">
                                                    <TrendingUp size={12} style={{ display: 'inline' }} /> +15%
                                                </StatHelpText>
                                            </Stat>
                                        </Box>

                                        <Box bg="white" borderRadius="lg" p={4}>
                                            <Stat>
                                                <StatLabel color="brand.gray.600" fontSize="xs">
                                                    Rating
                                                </StatLabel>
                                                <StatNumber color="brand.primary" fontSize="xl">
                                                    4.8
                                                </StatNumber>
                                                <StatHelpText color="brand.gray.600" fontSize="xs">
                                                    142 reviews
                                                </StatHelpText>
                                            </Stat>
                                        </Box>

                                        <Box bg="white" borderRadius="lg" p={4}>
                                            <Stat>
                                                <StatLabel color="brand.gray.600" fontSize="xs">
                                                    Total Properties listed
                                                </StatLabel>
                                                <StatNumber color="brand.primary" fontSize="xl">
                                                    {allData.totalProperties}
                                                </StatNumber>
                                                <StatHelpText color="brand.success" fontSize="xs">
                                                    +2 this month
                                                </StatHelpText>
                                            </Stat>
                                        </Box>

                                        <Box bg="white" borderRadius="lg" p={4}>
                                            <Stat>
                                                <StatLabel color="brand.gray.600" fontSize="xs">
                                                    Success Rate
                                                </StatLabel>
                                                <StatNumber color="brand.success" fontSize="xl">
                                                    94%
                                                </StatNumber>
                                                <StatHelpText color="brand.gray.600" fontSize="xs">
                                                    Last 30 days
                                                </StatHelpText>
                                            </Stat>
                                        </Box>
                                    </Grid>

                                    <Text fontSize="sm" fontWeight="600" color="white">
                                        Performance Overview
                                    </Text>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>


                {activeTab === 0 && (
                    <VStack align="stretch" px={6} pt={6} spacing={4}>
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            My Property Listings
                        </Text>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                            {paginatedListings.map((item, index) => (
                                <Stack
                                    p={4}
                                    bg="white"
                                    borderRadius="lg"
                                    spacing={4}
                                    boxShadow="sm"
                                    cursor="pointer"
                                    _hover={{ boxShadow: 'md' }}
                                    direction={{ base: 'column', md: 'row' }}
                                >
                                    <Image
                                        src={item.media.images[0].url}
                                        alt="item"
                                        borderRadius="lg"
                                        h={{ base: '180px', md: '100px' }}
                                        w={{ base: '100%', md: '100px' }}
                                        objectFit="cover"
                                    />

                                    <VStack align="start" flex={1} spacing={1}>
                                        <Text fontWeight="600" fontSize="sm">
                                            {item.title} {item.verificationStatus == "fully_verified" && (
                                                <Badge
                                                    colorScheme="green"
                                                    variant="default"
                                                    borderRadius="full"
                                                    p={0.5}
                                                >
                                                    <Icon as={VerifiedIcon} boxSize={3.5} />
                                                </Badge>
                                            )}
                                        </Text>
                                        <Text fontSize="xs" color="brand.gray.600">
                                            {item.address.area}, {item.address.state}
                                        </Text>
                                        <HStack>
                                            {item.listingStatus == "rented" ? (
                                                <Badge variant="verified" fontSize="xs">Rent Paid</Badge>
                                            ) : (
                                                <Text fontSize="xs" color="brand.gray.600">{item.listingStatus}</Text>
                                            )}
                                        </HStack>
                                        <Text fontSize="xs" color="brand.gray.600">₦{item.rentAmount.toLocaleString()} {item.rentDuration}</Text>
                                    </VStack>

                                    <VStack align={{ base: 'start', md: 'stretch' }} spacing={1} textAlign={{ base: 'left', md: 'right' }}>
                                        <Menu>
                                            <HStack gap={1} width={{ base: '100%', md: 'auto' }}>
                                                <Button onClick={() => openPropertyDetails(item)} width={{ base: '100%', md: 'auto' }} size="sm">
                                                    Details
                                                </Button>
                                                <MenuButton size="sm" as={Button} rightIcon={<ChevronDownIcon />} >

                                                </MenuButton>
                                            </HStack>
                                            <MenuList>
                                                {item.listingStatus == "under_offer" && (
                                                    <MenuItem onClick={() => handleReleasedKeys(item._id)}>Released keys</MenuItem>
                                                )}
                                                <MenuItem >Decline Offer</MenuItem>
                                                <MenuItem>Share Property</MenuItem>
                                                <MenuItem onClick={() => editProperty(item)}>Edit property</MenuItem>
                                                <MenuItem onClick={() => deleteMyProperty(item._id)}>Delete Property</MenuItem>
                                            </MenuList>
                                        </Menu>
                                        <Text fontSize="xs" color="brand.gray.500">
                                            {item.approved ? 'Approved' : 'Pending Approval'}
                                        </Text>
                                        <Text fontSize="xs" color="brand.gray.500">
                                            {item.inquiries.length} new inquiries
                                        </Text>
                                        <Text fontSize="xs" color="red.500">
                                            {allData.disputedProperties.reduce((count, prop) => prop._id === item._id ? count + 1 : count, 0)} new dispute
                                        </Text>
                                    </VStack>
                                </Stack>
                            ))}
                        </Grid>

                        <HStack justify="center" spacing={2} mt={4}>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setListingsPage((prev) => Math.max(prev - 1, 1))}
                                isDisabled={listingsPage === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalProperties }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    size="sm"
                                    variant={listingsPage === page ? 'primary' : 'outline'}
                                    onClick={() => setListingsPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setListingsPage((prev) => Math.min(prev + 1, totalProperties))}
                                isDisabled={listingsPage === totalProperties}
                            >
                                Next
                            </Button>
                        </HStack>


                    </VStack>
                )}

                {activeTab === 1 && (
                    <VStack align="stretch" px={6} pt={6} spacing={4}>
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            Escrow Transactions
                        </Text>

                        <VStack align="stretch" spacing={3}>
                            <Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                                {escrowTransactions.map((escrow) => {
                                    const id = escrow._id || escrow.id || escrow.transactionId || escrow.reference;
                                    const title = 'Escrow Transaction';
                                    const status = escrow.status || escrow.state || 'unknown';
                                    const rawAmount = escrow.amount || escrow.payment?.amount || escrow.amountPaid || 0;
                                    const amount = Number(rawAmount) * 100 || 0;
                                    const created = new Date(escrow.createdAt || escrow.created_at || escrow.paymentDate || Date.now()).toLocaleString();
                                    const payer = escrow.payer?.name || escrow.payerName || escrow.user?.name || escrow.initiator || 'N/A';
                                    const property = myProperties.find((p) => p._id === escrow.propertyId || p.id === escrow.propertyId) || mockProperties.find((p) => p.id === escrow.propertyId) || {};
                                    const propertyTitle = escrow.title || escrow.propertyTitle || 'Unknown property';

                                    const formatCurrency = (v) => {
                                        const n = Number(v) || 0;
                                        return `₦${(n / 100).toLocaleString()}`;
                                    };

                                    return (
                                        <Box key={id} bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                            <VStack align="stretch" spacing={3}>
                                                <HStack justify="space-between">
                                                    <HStack>
                                                        <Box boxSize="60px" borderRadius="md" bg="brand.background" >
                                                            <Image
                                                                src={escrow?.images?.[0]?.url || escrow?.propertyImages?.[0]?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpjDOEMVVmUKWc44itg3SRb8byRB3wlGPCqOL5ETrLKnTGSvGBBNWdOoSY&s=10"}
                                                                objectFit="cover"
                                                                alt="Escrow property image"
                                                                h="100%"
                                                                w="100%"
                                                            />

                                                        </Box>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" fontWeight="600">{title}</Text>
                                                            <Text fontSize="xs" color="brand.gray.600">{propertyTitle}</Text>
                                                            {/* <Text fontSize="xs" color="brand.gray.500">{payer}</Text> */}
                                                        </VStack>
                                                    </HStack>
                                                    <VStack align="end">
                                                        <Badge colorScheme={status.toLowerCase() === 'pending' ? 'yellow' : status.toLowerCase() === 'upcoming' ? 'red' : 'green'}>
                                                            {status}
                                                        </Badge>
                                                        <Text fontWeight="700">{formatCurrency(amount)}</Text>
                                                        <Text fontSize="xs" color="brand.gray.600">{created}</Text>
                                                    </VStack>
                                                </HStack>

                                                <HStack justify="space-between">
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" color="brand.gray.600">Ref: {escrow.reference || escrow.txRef || id}</Text>
                                                        {escrow.purpose && <Text fontSize="xs" color="brand.gray.600">Purpose: {escrow.purpose}</Text>}
                                                        {escrow.payoutStatus && <Text fontSize="xs" color="brand.gray.600">Payout: {escrow.payoutStatus}</Text>}
                                                        {escrow.landlordConfirmedHandover && <Text fontSize="xs" color="brand.gray.600">landlord has Confirmed Handover</Text>}
                                                    </VStack>

                                                    <HStack>
                                                        {(escrow.status !== "released" && escrow.status !== "refunded") && (
                                                            <Menu>
                                                                <MenuButton as={Button} size="sm" variant="outline">
                                                                    Actions
                                                                </MenuButton>
                                                                <MenuList>
                                                                    {escrow.landlordConfirmedHandover && (
                                                                        <MenuItem onClick={() => handleEscrowAction('inspected', escrow)}>
                                                                            I have inspected
                                                                        </MenuItem>
                                                                    )}
                                                                    {escrow.tenantConfirmedInspection &&
                                                                        escrow.status !== "released" && (
                                                                            <MenuItem onClick={() => handleEscrowAction('release', escrow)}>
                                                                                Release funds
                                                                            </MenuItem>
                                                                        )}
                                                                    <MenuItem onClick={() => handleEscrowAction('refund', escrow)}>Refund me</MenuItem>
                                                                    <MenuItem onClick={() => handleEscrowAction('dispute', escrow)}>Submit dispute</MenuItem>
                                                                </MenuList>
                                                            </Menu>
                                                        )}
                                                        {escrow.status === "released" && (
                                                            <DownloadAgreementButton escrowid={escrow._id} />
                                                            // <Button
                                                            //     size="sm"
                                                            //     onClick={() => downloadAgreement(escrow._id)}
                                                            //     disabled={downloading}
                                                            // >
                                                            //     {downloading ? "Generating..." : "Download Agreement"}
                                                            // </Button>
                                                        )}


                                                        {title.toLowerCase().includes('scheduled') && (
                                                            <Button size="sm" variant="primary" onClick={() => navigate(`/escrow-feedback/${property.id || property._id}`)}>
                                                                Give Feedback
                                                            </Button>
                                                        )}

                                                        {title.toLowerCase().includes('payment') && (
                                                            <HStack spacing={2}>
                                                                <Button size="sm" w="110px" variant="secondary" onClick={() => openPinModal('pay')}>
                                                                    Pay Landlord
                                                                </Button>
                                                                <Button size="sm" w="110px" variant="outline" onClick={() => openPinModal('refund')}>
                                                                    Request refund
                                                                </Button>
                                                            </HStack>
                                                        )}

                                                        {title.toLowerCase().includes('rental') && escrow.rentalAgreementUrl && (
                                                            <Button size="sm" variant="secondary" as={Link} to={escrow.rentalAgreementUrl}>Download Contract</Button>
                                                        )}
                                                    </HStack>
                                                </HStack>
                                            </VStack>
                                        </Box>
                                    );
                                })}
                            </Grid>

                            <HStack justify="center" spacing={2} mt={4}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setTransactionsPage((prev) => Math.max(prev - 1, 1))}
                                    isDisabled={transactionsPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: transactionsTotalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={transactionsPage === page ? 'primary' : 'outline'}
                                        onClick={() => setTransactionsPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setTransactionsPage((prev) => Math.min(prev + 1, transactionsTotalPages))}
                                    isDisabled={transactionsPage === transactionsTotalPages}
                                >
                                    Next
                                </Button>
                            </HStack>
                        </VStack>

                    </VStack>
                )}

                {activeTab === 2 && (
                    <VStack align="stretch" px={6} pt={6} spacing={4}>
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            Performance Metrics
                        </Text>

                        <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="brand.gray.600">This Month's Earnings</Text>
                                    <Text fontSize="lg" fontWeight="bold" color="brand.primary">₦2.4M</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="brand.gray.600">Properties Rented</Text>
                                    <Text fontSize="lg" fontWeight="bold" color="brand.success">8</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="brand.gray.600">Average Days to Rent</Text>
                                    <Text fontSize="lg" fontWeight="bold" color="brand.accent">12</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="brand.gray.600">Client Satisfaction</Text>
                                    <Text fontSize="lg" fontWeight="bold" color="brand.warning">96%</Text>
                                </HStack>
                            </VStack>
                        </Box>

                        <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                            <Text fontSize="sm" fontWeight="600" color="brand.gray.800" mb={3}>
                                Recent Reviews
                            </Text>
                            <VStack align="stretch" spacing={3}>
                                <HStack spacing={3}>
                                    <Avatar size="sm" name="Tunde Bakare" src="https://i.pravatar.cc/150?img=15" />
                                    <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="xs" fontWeight="600">Tunde Bakare</Text>
                                        <Text fontSize="xs" color="brand.gray.600">⭐⭐⭐⭐⭐ Excellent service!</Text>
                                    </VStack>
                                </HStack>
                                <HStack spacing={3}>
                                    <Avatar size="sm" name="Sarah Obi" src="https://i.pravatar.cc/150?img=25" />
                                    <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="xs" fontWeight="600">Sarah Obi</Text>
                                        <Text fontSize="xs" color="brand.gray.600">⭐⭐⭐⭐⭐ Very professional</Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </Box>
                    </VStack>
                )}
            </VStack>

            <Modal isOpen={isPinOpen} onClose={onClosePin} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader>Enter Transaction PIN</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="brand.gray.700">
                                Enter your 4-digit transaction PIN to confirm {transactionAction === 'refund' ? 'your refund request' : 'payment to the landlord'}.
                            </Text>
                            <HStack spacing={3} justify="center">
                                <PinInput size="lg" onComplete={(value) => setTransactionPin(value)}>
                                    <PinInputField
                                        bg="white"
                                        borderColor="brand.gray.300"
                                        _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                        fontSize="2xl"
                                        h="56px"
                                        w="48px"
                                    />
                                    <PinInputField
                                        bg="white"
                                        borderColor="brand.gray.300"
                                        _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                        fontSize="2xl"
                                        h="56px"
                                        w="48px"
                                    />
                                    <PinInputField
                                        bg="white"
                                        borderColor="brand.gray.300"
                                        _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                        fontSize="2xl"
                                        h="56px"
                                        w="48px"
                                    />
                                    <PinInputField
                                        bg="white"
                                        borderColor="brand.gray.300"
                                        _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                        fontSize="2xl"
                                        h="56px"
                                        w="48px"
                                    />
                                </PinInput>
                            </HStack>
                            {/* <Input
                                type="password"
                                placeholder="Enter PIN"
                                value={transactionPin}
                                maxLength={6}
                                onChange={(e) => setTransactionPin(e.target.value)}
                            /> */}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            w="100%"
                            variant="primary"
                            size="lg"
                            onClick={handlePinSubmit}
                        >
                            Confirm PIN
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isReleaseOpen} onClose={() => { onCloseRelease(); setSelectedEscrowAction(null); setReleaseCode(''); }} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader>Release Funds</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="brand.gray.700">
                                <Text fontWeight="bold" >Ensure you have inspected the property first.</Text> Enter the release code provided to you and 2FA code to release funds for this transaction.
                            </Text>
                            <Input
                                placeholder="Enter release code"
                                value={releaseCode}
                                onChange={(e) => setReleaseCode(e.target.value)}
                            />

                            <Text fontSize="sm" color="brand.gray.700">Enter google authenticator code</Text>
                            <HStack>
                                <PinInput
                                    otp
                                    value={authCode}
                                    onChange={(value) => setAuthCode(value)}
                                    focusBorderColor="teal.500"
                                >
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                </PinInput>
                            </HStack>

                            {selectedEscrowAction && (
                                <Text fontSize="xs" color="brand.gray.600">Ref: {selectedEscrowAction.reference || selectedEscrowAction._id || selectedEscrowAction.id}</Text>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} variant="ghost" onClick={() => { onCloseRelease(); setSelectedEscrowAction(null); setReleaseCode(''); }}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            isLoading={releasing}
                            onClick={async () => {
                                if (!releaseCode || releaseCode.trim().length === 0) {
                                    toast({ title: 'Enter release code', status: 'warning' });
                                    return;
                                }
                                if (!authCode || authCode.trim().length < 6) {
                                    toast({ title: 'Enter authenticator code', status: 'warning' });
                                    return;
                                }
                                setReleasing(true);
                                try {
                                    console.log(selectedEscrowAction, "authcode is:", authCode)
                                    // TODO: call real API to release funds with code and escrow id
                                    const res = await releaseFunds(selectedEscrowAction._id, releaseCode, authCode)

                                    console.log('Submitting release code', res);
                                    toast({ title: 'Release code submitted', status: 'success' });

                                    onCloseRelease();
                                    setSelectedEscrowAction(null);
                                    setReleaseCode('');
                                    setEscrowTransactions(prev =>
                                        prev.map(item =>
                                            item._id === selectedEscrowAction._id
                                                ? { ...item, status: "released" }
                                                : item
                                        )
                                    );
                                } catch (err) {
                                    console.log('Failed to submit release code', err);
                                    toast({ title: `${err.response.data.message}`, status: 'error' });
                                } finally {
                                    setReleasing(false);
                                }
                            }}
                        >
                            Submit
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isRefundOpen} onClose={() => { onCloseRefund(); setSelectedEscrowAction(null); setRefundReason(''); setRefundAuthCode(''); }} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader>Request Refund</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Reason for refund</FormLabel>
                                <Input placeholder="Describe why you want a refund" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Authenticator code</FormLabel>
                                <Input placeholder="Enter authenticator code" value={refundAuthCode} onChange={(e) => setRefundAuthCode(e.target.value)} />
                            </FormControl>

                            {selectedEscrowAction && (
                                <Text fontSize="xs" color="brand.gray.600">Ref: {selectedEscrowAction.reference || selectedEscrowAction._id || selectedEscrowAction.id}</Text>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} variant="ghost" onClick={() => { onCloseRefund(); setSelectedEscrowAction(null); setRefundReason(''); setRefundAuthCode(''); }}>
                            Cancel
                        </Button>
                        <Button colorScheme="teal" isLoading={refunding} onClick={submitRefund}>
                            Submit Refund
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Drawer isOpen={isDetailOpen} placement="right" onClose={() => { onCloseDetails(); setSelectedPropertyDetails(null); }} size="xl">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader pb={0}>
                        {selectedPropertyDetails?.title || 'Property details'}
                    </DrawerHeader>
                    <DrawerBody pt={2} px={6} pb={6} overflowY="auto">
                        <VStack align="stretch" spacing={4}>
                            <Image
                                src={selectedPropertyDetails?.media?.images?.[0]?.url || selectedPropertyDetails?.images?.[0]?.url || selectedPropertyDetails?.image || ''}
                                alt={selectedPropertyDetails?.title || 'Property image'}
                                borderRadius="xl"
                                objectFit="cover"
                                h="240px"
                                w="100%"
                            />

                            <Box>
                                <Text fontSize="md" fontWeight="bold" mb={1}>{selectedPropertyDetails?.title}</Text>
                                <Text fontSize="sm" color="brand.gray.600">
                                    {selectedPropertyDetails?.address?.area}, {selectedPropertyDetails?.address?.state}
                                </Text>
                            </Box>

                            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={3}>
                                <Box bg="brand.background" p={4} borderRadius="xl">
                                    <Text fontSize="xs" color="brand.gray.600">Rent</Text>
                                    <Text fontSize="lg" fontWeight="bold">₦{Number(selectedPropertyDetails?.rentAmount || selectedPropertyDetails?.price || 0).toLocaleString()}</Text>
                                </Box>
                                <Box bg="brand.background" p={4} borderRadius="xl">
                                    <Text fontSize="xs" color="brand.gray.600">Status</Text>
                                    <Text fontSize="lg" fontWeight="bold">{selectedPropertyDetails?.listingStatus || 'N/A'}</Text>
                                </Box>
                                <Box bg="brand.background" p={4} borderRadius="xl">
                                    <Text fontSize="xs" color="brand.gray.600">Bedrooms</Text>
                                    <Text fontSize="lg" fontWeight="bold">{selectedPropertyDetails?.bedrooms ?? selectedPropertyDetails?.bedCount ?? 'N/A'}</Text>
                                </Box>
                                <Box bg="brand.background" p={4} borderRadius="xl">
                                    <Text fontSize="xs" color="brand.gray.600">Bathrooms</Text>
                                    <Text fontSize="lg" fontWeight="bold">{selectedPropertyDetails?.bathrooms ?? selectedPropertyDetails?.bathCount ?? 'N/A'}</Text>
                                </Box>
                            </Grid>

                            <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                                <Text fontSize="sm" fontWeight="600" mb={2}>Description</Text>
                                <Text fontSize="sm" color="brand.gray.700">
                                    {selectedPropertyDetails?.description || selectedPropertyDetails?.overview || 'No description available.'}
                                </Text>
                            </Box>

                            <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                                <Text fontSize="sm" fontWeight="600" mb={2}>Property details</Text>
                                <VStack align="stretch" spacing={3}>
                                    {selectedPropertyDetails?.amenities && selectedPropertyDetails.amenities.length > 0 ? (
                                        <Text fontSize="sm" color="brand.gray.700">
                                            Amenities: {selectedPropertyDetails.amenities.join(', ')}
                                        </Text>
                                    ) : null}
                                    {selectedPropertyDetails?.houseType && (
                                        <Text fontSize="sm" color="brand.gray.700">Type: {selectedPropertyDetails.houseType}</Text>
                                    )}
                                    {selectedPropertyDetails?.landmark && (
                                        <Text fontSize="sm" color="brand.gray.700">Landmark: {selectedPropertyDetails.landmark}</Text>
                                    )}
                                    {selectedPropertyDetails?.verificationStatus && (
                                        <Text fontSize="sm" color="brand.gray.700">Verification: {selectedPropertyDetails.verificationStatus}</Text>
                                    )}
                                    {selectedPropertyDetails?.inquiries && (
                                        <Text fontSize="sm" color="brand.gray.700">Inquiries: {selectedPropertyDetails.inquiries.length}</Text>
                                    )}
                                </VStack>
                            </Box>
                        </VStack>
                    </DrawerBody>
                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={() => { onCloseDetails(); setSelectedPropertyDetails(null); }}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => { onCloseDetails(); setSelectedPropertyDetails(null); }}>
                            Done
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <Navbar active="dashboard" />
        </Box>
    );
}
