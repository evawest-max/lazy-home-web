import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Image,
  Avatar,
  Divider,
  Grid,
  IconButton,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  ShieldCheck,
  Star,
  Calendar,
  Eye,
  AlertCircle,
} from 'lucide-react';
import EscrowExplainer from './EscrowExplainer';
import FraudProtection from './FraudProtection';
import { Link, useParams } from 'react-router-dom';
import { mockProperties } from './mockData';

export default function PropertyDetails() {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === parseInt(id)); // Replace with actual data fetching logic based on ID
  return (
    <Box minH="100vh" bg="brand.background" pb="100px">
      <Box position="relative">
        <Image
          src={property.image}
          alt="Property"
          h="300px"
          w="100%"
          objectFit="cover"
        />

        <Link to="/property-listings">
          <IconButton
            icon={<ArrowLeft size={20} />}
            position="absolute"
            top={4}
            left={4}
            bg="green.500"
            borderRadius="full"
            aria-label="Back"
          />
        </Link>

        <Badge
          variant="verified"
          position="absolute"
          top={4}
          right={4}
          display="flex"
          alignItems="center"
          gap={1}
          fontSize="sm"
        >
          <ShieldCheck size={16} />
          Verified 2 days ago
        </Badge>
      </Box>

      <VStack align="stretch" p={6} spacing={6}>
        <Box bg="white" p={4} borderRadius="xl" border="2px solid" borderColor="brand.success">
          <VStack spacing={3} align="stretch">
            <HStack justify="center" bg="brand.success" py={2} px={3} borderRadius="lg">
              <ShieldCheck size={18} color="white" />
              <Text fontSize="sm" color="white" fontWeight="bold">
                ESCROW PROTECTED - YOUR MONEY IS SAFE
              </Text>
            </HStack>

            <Text fontSize="3xl" fontWeight="bold" color="brand.primary" textAlign="center">
              {property.title}
            </Text>

            <Text fontSize="xl" fontWeight="600" color="brand.gray.800">
              {property.location}
            </Text>

            <HStack spacing={1} color="brand.gray.600">
              <MapPin size={18} />
              <Text fontSize="md">Lekki Phase 1, Lagos State</Text>
            </HStack>
          </VStack>
        </Box>

        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <VStack
            bg="brand.background"
            p={4}
            borderRadius="lg"
            spacing={2}
          >
            <Bed size={24} color="#00695C" />
            <Text fontSize="sm" fontWeight="600">3 Beds</Text>
          </VStack>

          <VStack
            bg="brand.background"
            p={4}
            borderRadius="lg"
            spacing={2}
          >
            <Bath size={24} color="#00695C" />
            <Text fontSize="sm" fontWeight="600">4 Baths</Text>
          </VStack>

          <VStack
            bg="brand.background"
            p={4}
            borderRadius="lg"
            spacing={2}
          >
            <Square size={24} color="#00695C" />
            <Text fontSize="sm" fontWeight="600">{property.bedrooms} Beds</Text>
          </VStack>
        </Grid>

        <Divider />

        <VStack align="stretch" spacing={3}>
          <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
            Agent Information
          </Text>

          <HStack
            bg="brand.background"
            p={4}
            borderRadius="lg"
            spacing={4}
          >
            <Avatar
              size="lg"
              name="John Adeyemi"
              src="https://i.pravatar.cc/150?img=33"
            />

            <VStack align="start" flex={1} spacing={1}>
              <HStack>
                <Text fontWeight="600" color="brand.gray.800">
                  John Adeyemi
                </Text>
                <Badge variant="verified" fontSize="xs">
                  <ShieldCheck size={12} />
                </Badge>
              </HStack>

              <HStack spacing={1}>
                <Star size={14} fill="#FFB800" color="#FFB800" />
                <Text fontSize="sm" color="brand.gray.600" cursor="pointer" >
                  4.8 (142 reviews)
                </Text>
              </HStack>
            </VStack>

            <Button size="sm" variant="secondary">
              Contact
            </Button>
          </HStack>
        </VStack>

        <Divider />

        <EscrowExplainer />

        <FraudProtection />

        <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
          <VStack align="stretch" spacing={3}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              Price Breakdown
            </Text>

            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text color="brand.gray.600">Annual Rent</Text>
                <Text fontWeight="600">{property.price.toLocaleString()}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="brand.gray.600">Agency Fee (10%)</Text>
                <Text fontWeight="600">₦{Math.floor(property.price * 0.1).toLocaleString()}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="brand.gray.600">Legal Fee</Text>
                <Text fontWeight="600">₦{Math.floor(property.price * 0.1).toLocaleString()}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="brand.gray.600">Caution Deposit</Text>
                <Text fontWeight="600">₦{Math.floor(property.price * 0.1).toLocaleString()}</Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Box bg="brand.background" border="1px solid" borderColor="brand.accent" borderRadius="lg" p={4}>
          <HStack spacing={3}>
            <AlertCircle size={20} color="#26A69A" />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                Payment held in secure escrow
              </Text>
              <Text fontSize="xs" color="brand.gray.600">
                Money only released to landlord after your approval
              </Text>
            </VStack>
          </HStack>
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
          <HStack spacing={2} bg="brand.background" py={2} px={3} borderRadius="lg">
            <ShieldCheck size={14} color="#2E7D32" />
            <Text fontSize="xs" fontWeight="600" color="brand.success">
              ESCROW PROTECTED - ZERO RISK
            </Text>
          </HStack>
          <Grid templateColumns="1fr 1fr" gap={3} w="100%">
            <Button
              as={Link}
              to= {`/book-inspection/${property.id}`}
              variant="secondary"
              leftIcon={<Calendar size={18} />}
              size="lg"
            >
              Book Inspection
            </Button>

            
              <Button
               as={Link}
               to={`/secure-payment/${property.id}`}
                variant="primary"
                leftIcon={<Eye size={18} />}
                size="lg"
              >
                Secure Property
              </Button>

            
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}
