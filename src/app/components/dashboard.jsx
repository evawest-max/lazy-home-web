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
    useDisclosure,
    PinInput,
    PinInputField,
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
} from 'lucide-react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import PropertyCard from './PropertyCard';
import TrustBanner from './TrustBanner';
import TestimonialCard from './TestimonialCard';
import BeforeAfter from './BeforeAfter';
import FilterSearch from './FilterSearch';
import { mockInspections, mockProperties } from './mockData';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { deleteProperty, getUserProperties } from '../../../api';


export default function Dashboard({ onNavigate, user, setUpdatedFormdata }) {
    const [activeTab, setActiveTab] = useState(0);
    const [transactionPin, setTransactionPin] = useState('');
    const [transactionAction, setTransactionAction] = useState('pay');
    const [listingsPage, setListingsPage] = useState(1);
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [myProperties, setMyProperties] = useState([])
    const [myPropertiesExtraData, setMyPropertiesExtraData] = useState({})

    const itemsPerPage = 4;
    const { isOpen: isPinOpen, onOpen: onOpenPin, onClose: onClosePin } = useDisclosure();

    const listingsTotalPages = Math.ceil(mockProperties.length / itemsPerPage);
    const navigate = useNavigate()
    // Pagination calculations for listings
    const listingsStartIndex = (listingsPage - 1) * itemsPerPage;
    const listingsEndIndex = listingsStartIndex + itemsPerPage;
    const paginatedListings = myProperties.slice(listingsStartIndex, listingsEndIndex);

    // Pagination calculations for transactions
    const transactionsTotalPages = Math.ceil(mockInspections.length / itemsPerPage);
    const transactionsStartIndex = (transactionsPage - 1) * itemsPerPage;
    const transactionsEndIndex = transactionsStartIndex + itemsPerPage;
    const paginatedTransactions = mockInspections.slice(transactionsStartIndex, transactionsEndIndex);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await getUserProperties();
                console.log(response);
                setMyProperties(response.data.data);
                setMyPropertiesExtraData(response.data.extra)
            } catch (error) {
                console.error("Failed to fetch properties:", error);
            }
        };

        fetchProperties();
    }, []);


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

    const deleteMyProperty= (id)=>{
        try {
            const response= deleteProperty(id)
            console.log("item deleted", response)
        } catch (error) {
            console.log("not deleted", error)
        }
    }

    const editProperty= (data)=>{
        setUpdatedFormdata(data);
        navigate("/update-listing/steps")
    }

    return (
        <Box minH="100vh" bg="brand.background" pb="80px">
            <VStack spacing={0} align="stretch">
                <Box bg="brand.primary" px={6} pt={12} pb={4}>
                    <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold" color="white">
                                LazyHomes
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.800">
                                Welcome back, {user.fullName.split(' ')[0]}!
                            </Text>
                        </VStack>
                        <Avatar
                            size="md"
                            name="John Adeyemi"
                            src={user.image || "https://i.pravatar.cc/150?img=33"}
                            cursor="pointer"
                        />
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
                                                {mockInspections.reduce((total, property) => total + (property.status === 'Upcoming' ? 1 : 0), 0)}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Inspections
                                            </Text>
                                        </Box>
                                        <Box bg="white" borderRadius="lg" p={4} textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.success">
                                                {mockInspections.reduce((total, property) => total + (property.status === 'Pending' ? 1 : 0), 0)}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                In Progress
                                            </Text>
                                        </Box>
                                        <Box bg="white" borderRadius="lg" p={4} textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.accent">
                                                {mockInspections.filter(
                                                    (property) => property.status === "completed"
                                                ).length}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Completed
                                            </Text>
                                        </Box>
                                        <Box bg="white" borderRadius="lg" p={4} textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.warning">
                                                {mockInspections.reduce((total, property) => total + (property.status === 'In Progress' ? 1 : 0), 0)}
                                            </Text>
                                            <Text fontSize="xs" color="brand.gray.600">
                                                Cancelled
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
                                                    ₦{myPropertiesExtraData.totalRevenue}
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
                                                    {myPropertiesExtraData.totalProperties}
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
                        <Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4}>
                            {paginatedListings.map((item, index) => (
                                <HStack
                                    p={4}
                                    bg="white"
                                    borderRadius="lg"
                                    spacing={4}
                                    boxShadow="sm"
                                    cursor="pointer"
                                    _hover={{ boxShadow: 'md' }}
                                >
                                    <Image
                                        src={item.media.images[0].url}
                                        alt="item"
                                        borderRadius="lg"
                                        h="100px"
                                        w="100px"
                                        objectFit="cover"
                                    />

                                    <VStack align="start" flex={1} spacing={1}>
                                        <Text fontWeight="600" fontSize="sm">
                                            {item.title}
                                        </Text>
                                        <Text fontSize="xs" color="brand.gray.600">
                                            {item.address.area}, {item.address.state}
                                        </Text>
                                        <HStack>
                                            {item.rentPaid && item.verified && item.approved ? (
                                                <Badge variant="verified" fontSize="xs">Rent Paid</Badge>
                                            ) : item.verified && item.approved ? (
                                                <Badge variant="verified" fontSize="xs">Active</Badge>
                                            ) : <Badge variant="unverified" fontSize="xs">{item.verificationStatus === "pending" ? "Under review" : item.verificationStatus}</Badge>}
                                        </HStack>
                                        <Text fontSize="xs" color="brand.gray.600">{item.rentAmount.toLocaleString()} {item.rentDuration}</Text>
                                    </VStack>

                                    <VStack align="stretch" spacing={1} textAlign="right">
                                        <Menu>
                                            <MenuButton size="sm" as={Button} rightIcon={<ChevronDownIcon />}>
                                                Actions
                                            </MenuButton>
                                            <MenuList>
                                                <MenuItem>View details</MenuItem>
                                                <MenuItem>Share link</MenuItem>
                                                <MenuItem onClick={()=> editProperty(item)}>edit</MenuItem>
                                                <MenuItem onClick={()=> deleteMyProperty(item._id)}>Delete</MenuItem>
                                            </MenuList>
                                        </Menu>
                                        <Text fontSize="xs" color="brand.gray.500">
                                            {item.approved ? 'Approved' : 'Pending Approval'}
                                        </Text>
                                        <Text fontSize="xs" color="brand.gray.500">
                                            {item.inquiries.length} new inquiries
                                        </Text>
                                        <Text fontSize="xs" color="red.500">
                                            1 new dispute
                                        </Text>
                                    </VStack>
                                </HStack>
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
                            {Array.from({ length: listingsTotalPages }, (_, i) => i + 1).map((page) => (
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
                                onClick={() => setListingsPage((prev) => Math.min(prev + 1, listingsTotalPages))}
                                isDisabled={listingsPage === listingsTotalPages}
                            >
                                Next
                            </Button>
                        </HStack>

                        {/* <VStack align="stretch" spacing={3}>
                            <HStack
                                p={4}
                                bg="white"
                                borderRadius="lg"
                                spacing={4}
                                boxShadow="sm"
                                cursor="pointer"
                                _hover={{ boxShadow: 'md' }}
                            >
                                <Box
                                    bg="brand.primary"
                                    w="60px"
                                    h="60px"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Home size={28} color="white" />
                                </Box>

                                <VStack align="start" flex={1} spacing={1}>
                                    <Text fontWeight="600" fontSize="sm">
                                        3 Bedroom Duplex
                                    </Text>
                                    <Text fontSize="xs" color="brand.gray.600">
                                        Lekki Phase 1
                                    </Text>
                                    <HStack>
                                        <Badge variant="verified" fontSize="xs">Active</Badge>
                                        <Text fontSize="xs" color="brand.gray.600">₦2.5M/year</Text>
                                    </HStack>
                                </VStack>

                                <Text fontSize="xs" color="brand.gray.500">
                                    2d ago
                                </Text>
                            </HStack>

                            <HStack
                                p={4}
                                bg="white"
                                borderRadius="lg"
                                spacing={4}
                                boxShadow="sm"
                                cursor="pointer"
                                _hover={{ boxShadow: 'md' }}
                            >
                                <Box
                                    bg="brand.accent"
                                    w="60px"
                                    h="60px"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Home size={28} color="white" />
                                </Box>

                                <VStack align="start" flex={1} spacing={1}>
                                    <Text fontWeight="600" fontSize="sm">
                                        2 Bedroom Flat
                                    </Text>
                                    <Text fontSize="xs" color="brand.gray.600">
                                        Victoria Island
                                    </Text>
                                    <HStack>
                                        <Badge variant="underOffer" fontSize="xs">Under Offer</Badge>
                                        <Text fontSize="xs" color="brand.gray.600">₦3.2M/year</Text>
                                    </HStack>
                                </VStack>

                                <Text fontSize="xs" color="brand.gray.500">
                                    5d ago
                                </Text>
                            </HStack>

                            <HStack
                                p={4}
                                bg="white"
                                borderRadius="lg"
                                spacing={4}
                                boxShadow="sm"
                                cursor="pointer"
                                _hover={{ boxShadow: 'md' }}
                            >
                                <Box
                                    bg="brand.secondary"
                                    w="60px"
                                    h="60px"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Home size={28} color="white" />
                                </Box>

                                <VStack align="start" flex={1} spacing={1}>
                                    <Text fontWeight="600" fontSize="sm">
                                        4 Bedroom House
                                    </Text>
                                    <Text fontSize="xs" color="brand.gray.600">
                                        Ikoyi
                                    </Text>
                                    <HStack>
                                        <Badge variant="verified" fontSize="xs">Active</Badge>
                                        <Text fontSize="xs" color="brand.gray.600">₦5M/year</Text>
                                    </HStack>
                                </VStack>

                                <Text fontSize="xs" color="brand.gray.500">
                                    1w ago
                                </Text>
                            </HStack>
                        </VStack> */}
                    </VStack>
                )}

                {activeTab === 1 && (
                    <VStack align="stretch" px={6} pt={6} spacing={4}>
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            My Transactions
                        </Text>

                        <VStack align="stretch" spacing={3}>
                            <Grid templateColumns={{ sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
                                {paginatedTransactions.map((inspection) => (
                                    <Box key={inspection.id} bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                        <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between">
                                                <Image src={mockProperties.find((prop) => prop.id === inspection.propertyId)?.image} alt="Property" boxSize="60px" borderRadius="lg" objectFit="cover" />
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" fontWeight="600">{inspection.title}</Text>
                                                    <Text fontSize="xs" color="brand.gray.600">{mockProperties.find((prop) => prop.id === inspection.propertyId)?.title}</Text>
                                                </VStack>
                                                <Badge bg={inspection.status === 'Upcoming' ? 'red.500' : inspection.status === 'Pending' ? 'yellow.500' : 'green.500'} color="white" fontSize="xs">{inspection.status}</Badge>
                                            </HStack>
                                            {inspection.status === 'Upcoming' ? (
                                                <Text fontSize="xs" color="brand.gray.600">Scheduled for {inspection.preferredDate}</Text>
                                            ) : inspection.status === 'Pending' ? (
                                                <Text fontSize="xs" color="brand.gray.600">Paid on {inspection.paymentDate}</Text>
                                            ) : null}


                                            {inspection.title === 'Inspection Scheduled' ? (
                                                <Button size="sm" variant="primary" onClick={() => navigate(`/inspection-feedback/${mockProperties.find((prop) => prop.id === inspection.propertyId)?.id}`)}>
                                                    Give Feedback
                                                </Button>
                                            ) : inspection.title === 'Payment in Escrow' ? (
                                                <HStack spacing={2} justify="center">
                                                    <Button size="sm" w="50%" variant="secondary" onClick={() => openPinModal('pay')}>
                                                        Pay Landlord
                                                    </Button>
                                                    <Button size="sm" w="50%" variant="outline" onClick={() => openPinModal('refund')}>
                                                        Request refund
                                                    </Button>
                                                </HStack>
                                            ) : inspection.title === 'Rental Agreement' ? (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    as={Link}
                                                    to={inspection.rentalAgreementUrl}

                                                >
                                                    Download Contract
                                                </Button>
                                            ) : null}
                                        </VStack>
                                    </Box>
                                ))}
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
                        {/* <VStack align="stretch" spacing={3}>
                            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" fontWeight="600">Inspection Scheduled</Text>
                                            <Text fontSize="xs" color="brand.gray.600">3 Bedroom Duplex, Lekki</Text>
                                        </VStack>
                                        <Badge bg="brand.accent" color="white" fontSize="xs">Upcoming</Badge>
                                    </HStack>
                                    <Text fontSize="xs" color="brand.gray.600">Today, 2:00 PM</Text>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => onNavigate?.('inspection')}
                                    >
                                        Give Feedback
                                    </Button>
                                </VStack>
                            </Box>

                            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" fontWeight="600">Payment in Escrow</Text>
                                            <Text fontSize="xs" color="brand.gray.600">2 Bedroom Flat, VI</Text>
                                        </VStack>
                                        <Badge bg="brand.warning" color="white" fontSize="xs">Pending</Badge>
                                    </HStack>
                                    <Text fontSize="xs" color="brand.gray.600">₦3.2M held safely</Text>
                                    <Button size="sm" variant="secondary">View Details</Button>
                                </VStack>
                            </Box>

                            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" fontWeight="600">Rental Agreement</Text>
                                            <Text fontSize="xs" color="brand.gray.600">4 Bedroom House, Ikoyi</Text>
                                        </VStack>
                                        <Badge bg="brand.success" color="white" fontSize="xs">Completed</Badge>
                                    </HStack>
                                    <Text fontSize="xs" color="brand.gray.600">Signed 2 weeks ago</Text>
                                    <Button size="sm" variant="secondary">Download Contract</Button>
                                </VStack>
                            </Box>
                        </VStack> */}
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

            <Navbar active="dashboard" />
        </Box>
    );
}
