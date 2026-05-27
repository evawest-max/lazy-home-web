import { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    IconButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Image,
    Badge,
    Grid,
} from '@chakra-ui/react';
import { ArrowLeft, Calendar, Clock, MapPin, ShieldCheck, AlertCircle, Phone, Mail } from 'lucide-react';
import { mockProperties } from './mockData';
import { Link, useParams } from 'react-router-dom';

export default function BookInspection() {
    const { id } = useParams();
    const property = mockProperties.find((p) => p.id === parseInt(id)); // Replace with actual data fetching logic based on ID

    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [alternativeDate, setAlternativeDate] = useState('');
    const [visitors, setVisitors] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');

    const handlePay = () => {
        if (!preferredDate || !preferredTime || !visitors || !fullName || !phone || !email) {
            alert('Please fill in all required fields.');
            return;
        }
        const data = {
            preferredDate,
            preferredTime,
            alternativeDate,
            visitors,
            fullName,
            phone,
            email,
            specialRequests,
            propertyId: id,
        };
        console.log('Booking data:', data);
        alert('Payment successful! Your inspection has been booked.');
    };
    return (
        <Box minH="100vh" bg="brand.background" pb="120px">
            <Box bg="brand.primary" px={6} pt={12} pb={8}>
                <HStack mb={6}>
                    <Link to={`/property/${property.id}`}>
                        <IconButton
                            icon={<ArrowLeft size={20} />}
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.200' }}
                            aria-label="Back"
                        />
                    </Link>
                    <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>
                        Book Inspection
                    </Text>
                </HStack>
            </Box>

            <VStack align="stretch" px={6} mt={-4} spacing={6}>
                <Box bg="white" borderRadius="xl" p={6} boxShadow="lg" border="3px solid" borderColor="brand.success">
                    <VStack spacing={4}>
                        <HStack justify="center" bg="brand.success" py={3} px={4} borderRadius="lg" w="100%">
                            <ShieldCheck size={20} color="white" />
                            <Text fontSize="sm" fontWeight="bold" color="white">
                                PAY ONLY ₦5,000 INSPECTION FEE
                            </Text>
                        </HStack>

                        <VStack spacing={2} bg="brand.background" p={4} borderRadius="lg" w="100%">
                            <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                                ✓ Fully refundable if you rent this property
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                                ✓ Held in escrow until inspection complete
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                                ✓ Agent gets paid only after you visit
                            </Text>
                        </VStack>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                    <VStack align="stretch" spacing={4}>
                        <HStack spacing={3}>
                            <Image
                                src={property.image}
                                alt="Property"
                                borderRadius="lg"
                                h="80px"
                                w="100px"
                                objectFit="cover"
                            />
                            <VStack align="start" flex={1} spacing={1}>
                                <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                                    {property.title}
                                </Text>
                                <HStack spacing={1} color="brand.gray.600">
                                    <MapPin size={14} />
                                    <Text fontSize="xs">{property.location}</Text>
                                </HStack>
                                <Badge variant="verified" fontSize="xs">
                                    <ShieldCheck size={10} /> {property.verified}
                                </Badge>
                            </VStack>
                        </HStack>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
                    <VStack align="stretch" spacing={5}>
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            Inspection Details
                        </Text>

                        <FormControl isRequired>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Preferred Date
                            </FormLabel>
                            <HStack>
                                <Calendar size={18} color="#00695C" />
                                <Input
                                    type="date"
                                    size="lg"
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                />
                            </HStack>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Preferred Time
                            </FormLabel>
                            <HStack>
                                <Clock size={18} color="#00695C" />
                                <Select
                                    placeholder="Select time slot"
                                    size="lg"
                                    value={preferredTime}
                                    onChange={(e) => setPreferredTime(e.target.value)}
                                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                >
                                    <option>9:00 AM - 11:00 AM</option>
                                    <option>11:00 AM - 1:00 PM</option>
                                    <option>1:00 PM - 3:00 PM</option>
                                    <option>3:00 PM - 5:00 PM</option>
                                    <option>5:00 PM - 7:00 PM</option>
                                </Select>
                            </HStack>
                        </FormControl>

                        <FormControl>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Alternative Date (Optional)
                            </FormLabel>
                            <HStack>
                                <Calendar size={18} color="#00695C" />
                                <Input
                                    type="date"
                                    size="lg"
                                    value={alternativeDate}
                                    onChange={(e) => setAlternativeDate(e.target.value)}
                                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                />
                            </HStack>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Number of Visitors
                            </FormLabel>
                            <Select
                                placeholder="How many people?"
                                size="lg"
                                value={visitors}
                                onChange={(e) => setVisitors(e.target.value)}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            >
                                <option>Just me</option>
                                <option>2 people</option>
                                <option>3 people</option>
                                <option>4+ people</option>
                            </Select>
                        </FormControl>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
                    <VStack align="stretch" spacing={5}>
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            Your Contact Information
                        </Text>

                        <FormControl isRequired>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Full Name
                            </FormLabel>
                            <Input
                                placeholder="Enter your full name"
                                size="lg"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Phone Number
                            </FormLabel>
                            <HStack>
                                <Phone size={18} color="#00695C" />
                                <Input
                                    placeholder="+234 812 345 6789"
                                    type="tel"
                                    size="lg"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                />
                            </HStack>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Email Address
                            </FormLabel>
                            <HStack>
                                <Mail size={18} color="#00695C" />
                                <Input
                                    placeholder="your.email@example.com"
                                    type="email"
                                    size="lg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                                />
                            </HStack>
                        </FormControl>

                        <FormControl>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Special Requests (Optional)
                            </FormLabel>
                            <Textarea
                                placeholder="Any specific areas you want to check? Questions for the agent?"
                                size="lg"
                                rows={4}
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            />
                        </FormControl>
                    </VStack>
                </Box>

                <Box bg="brand.background" border="2px solid" borderColor="brand.accent" borderRadius="lg" p={5}>
                    <VStack spacing={3}>
                        <HStack spacing={2}>
                            <AlertCircle size={20} color="#26A69A" />
                            <Text fontSize="md" fontWeight="bold" color="brand.primary">
                                What Happens Next?
                            </Text>
                        </HStack>

                        <VStack spacing={2} align="stretch">
                            <Text fontSize="sm" color="brand.gray.700">
                                <Text as="span" fontWeight="bold">1.</Text> Pay ₦5,000 inspection fee (refundable if you rent)
                            </Text>
                            <Text fontSize="sm" color="brand.gray.700">
                                <Text as="span" fontWeight="bold">2.</Text> Agent confirms your booking within 2 hours
                            </Text>
                            <Text fontSize="sm" color="brand.gray.700">
                                <Text as="span" fontWeight="bold">3.</Text> Visit property on scheduled date
                            </Text>
                            <Text fontSize="sm" color="brand.gray.700">
                                <Text as="span" fontWeight="bold">4.</Text> Upload inspection photos and decide
                            </Text>
                        </VStack>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                    <VStack spacing={3}>
                        <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                            Payment Breakdown
                        </Text>

                        <VStack spacing={2} align="stretch" w="100%">
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="brand.gray.600">Inspection Fee</Text>
                                <Text fontSize="sm" fontWeight="600">₦5,000</Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="brand.gray.600">Service Fee</Text>
                                <Text fontSize="sm" fontWeight="600">₦500</Text>
                            </HStack>
                            <Box h="1px" bg="brand.gray.200" />
                            <HStack justify="space-between">
                                <Text fontSize="md" fontWeight="bold" color="brand.primary">Total</Text>
                                <Text fontSize="xl" fontWeight="bold" color="brand.primary">₦5,500</Text>
                            </HStack>
                        </VStack>

                        <Text fontSize="xs" color="brand.success" textAlign="center" fontWeight="600">
                            ✓ Full ₦5,000 refunded if you proceed to rent this property
                        </Text>
                    </VStack>
                </Box>
            </VStack>

            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                bg="white"
                borderTop="2px solid"
                borderColor="brand.success"
                p={6}
                boxShadow="2xl"
            >
                <VStack spacing={3}>
                    <HStack spacing={2} bg="brand.background" py={2} px={4} borderRadius="lg" w="100%" justify="center">
                        <ShieldCheck size={16} color="#2E7D32" />
                        <Text fontSize="xs" fontWeight="bold" color="brand.success">
                            ESCROW PROTECTED - REFUNDABLE IF YOU RENT
                        </Text>
                    </HStack>
                    <Button
                        w="100%"
                        variant="primary"
                        size="lg"
                        onClick={handlePay}
                    >
                        Pay ₦5,500 & Book Inspection
                    </Button>
                </VStack>
            </Box>
        </Box>
    );
}
