import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Badge,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Image,
} from '@chakra-ui/react';
import { Plus, Home, TrendingUp, MapPin, ShieldCheck, MessageSquareText } from 'lucide-react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { mockProperties } from './mockData';

export default function AgentDashboard() {
  return (
    <Box minH="100vh" bg="brand.background" pb="100px">
      <Box bg="brand.primary" px={6} pt={12} pb={8}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                Agent Dashboard
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                Welcome back, John
              </Text>
            </VStack>

            <Avatar
              size="md"
              name="John Adeyemi"
              src="https://i.pravatar.cc/150?img=33"
            />
          </HStack>
        </VStack>
      </Box>

      <VStack align="stretch" px={6} mt={-4} spacing={6}>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <Box bg="white" borderRadius="xl" p={4} boxShadow="sm">
            <Stat>
              <StatLabel color="brand.gray.600" fontSize="sm">
                Active Listings
              </StatLabel>
              <StatNumber color="brand.primary" fontSize="3xl">
                12
              </StatNumber>
              <StatHelpText color="brand.success" fontSize="xs">
                <TrendingUp size={12} style={{ display: 'inline' }} /> +2 this month
              </StatHelpText>
            </Stat>
          </Box>

          <Box bg="white" borderRadius="xl" p={4} boxShadow="sm">
            <Stat>
              <StatLabel color="brand.gray.600" fontSize="sm">
                Total Earnings
              </StatLabel>
              <StatNumber color="brand.primary" fontSize="2xl">
                ₦2.4M
              </StatNumber>
              <StatHelpText color="brand.success" fontSize="xs">
                This month
              </StatHelpText>
            </Stat>
          </Box>

          <Box bg="white" borderRadius="xl" p={4} boxShadow="sm">
            <Stat>
              <StatLabel color="brand.gray.600" fontSize="sm">
                Rating
              </StatLabel>
              <StatNumber color="brand.primary" fontSize="3xl">
                4.8
              </StatNumber>
              <StatHelpText color="brand.gray.600" fontSize="xs">
                142 reviews
              </StatHelpText>
            </Stat>
          </Box>

          <Box bg="white" borderRadius="xl" p={4} boxShadow="sm">
            <Stat>
              <StatLabel color="brand.gray.600" fontSize="sm">
                Pending Deals
              </StatLabel>
              <StatNumber color="brand.warning" fontSize="3xl">
                3
              </StatNumber>
              <StatHelpText color="brand.gray.600" fontSize="xs">
                Awaiting action
              </StatHelpText>
            </Stat>
          </Box>
        </Grid>


        <Button
          as={Link}
          to="/create-listing/step-1"
          variant="primary"
          size="lg"
          leftIcon={<Plus size={20} />}
        >
          Create New Listing
        </Button>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800" mb={4}>
              Under inspection
            </Text>
            <VStack align="stretch" spacing={4} >
              <Grid templateColumns={{sm:"repeat(1, 1fr)", md: "repeat(2, 1fr)"}} gap={4}>
              {mockProperties.map((item, index) => (

                item.InspectionScheduled && (
                  <HStack spacing={3} key={index} bg="brand.background" p={3} borderRadius="lg">
                    <Image
                      src={item.image}
                      alt="item"
                      borderRadius="lg"
                      h="100px"
                      w="100px"
                      objectFit="cover"
                    />
                    <VStack align="start" flex={1} spacing={1}>
                      <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                        {item.title}sdfghj
                      </Text>
                      <HStack spacing={1} color="brand.gray.600">
                        <MapPin size={14} />
                        <Text fontSize="xs">{item.location}asdfgh</Text>
                      </HStack>
                      <Badge variant="verified" fontSize="xs">
                        <ShieldCheck size={10} /> {item.verified}
                      </Badge>
                      <Button
                        as={Link}
                        to={`/inspection-feedback/${item.id}`}
                        variant="primary"
                        leftIcon={<MessageSquareText size={18} />}
                        size="sm"
                      >
                        Give feedback
                      </Button>
                    </VStack>
                  </HStack>
                )
              ))}
              </Grid>
            </VStack>
          </Box>
        </Box>


        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={4}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              Recent Listings
            </Text>

            <VStack align="stretch" spacing={3}>
              <HStack
                p={4}
                bg="brand.background"
                borderRadius="lg"
                spacing={4}
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
                bg="brand.background"
                borderRadius="lg"
                spacing={4}
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
                bg="brand.background"
                borderRadius="lg"
                spacing={4}
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
            </VStack>
          </VStack>
        </Box>
      </VStack>
      <Navbar active="dashboard" />
    </Box>
  );
}
