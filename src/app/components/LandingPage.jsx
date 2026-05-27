import { Box, Heading, Text, VStack, HStack, Button, Flex } from '@chakra-ui/react';
import { Home, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import landingImage from '../../assets/landing-image.png';

export default function LandingPage({user}) {
  return (
    <Box position="relative" minH="100vh" overflow="hidden">

      {/* 🔹 Background Image (blurred) */}
      <Box
        position="absolute"
        inset={0}
        bgImage={`url(${landingImage})`}
        bgSize="cover"
        bgPosition="center"
        filter="blur(8px)"
        transform="scale(1.1)" // prevents edges showing after blur
      />

      {/* 🔹 Dark Overlay */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(0, 0, 0, 0.55)"
      />

      {/* 🔹 Content */}
      <Box
        position="relative"
        zIndex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        px={6}
      >
        <VStack spacing={6} textAlign="center">

          <Text fontSize="2xl" fontWeight="bold" color="white">
                LazyHomes
              </Text>

          <Text fontSize="lg" color="gray.200">
            Rent with Peace of Mind
          </Text>

          <VStack spacing={3} mt={4}>
            <HStack bg="whiteAlpha.200" py={2} px={4} borderRadius="full">
              <ShieldCheck size={18} color="white" />
              <Text fontSize="sm" color="white">
                100% Escrow Protected
              </Text>
            </HStack>

            <VStack spacing={1}>
              <Text fontSize="sm" color="gray.200">✓ No more fraud</Text>
              <Text fontSize="sm" color="gray.200">✓ Full refund guarantee</Text>
              <Text fontSize="sm" color="gray.200">✓ Pay after approval</Text>
            </VStack>

            <Box bg="white" px={4} py={2} borderRadius="lg">
              <Text fontSize="xs" fontWeight="bold" color="brand.primary">
                Trusted by 10,000+ Nigerians
              </Text>
            </Box>

            <Flex mt={4} gap={3}>
              <Button
                as={Link}
                to={user? "/dashboard" : "/signup"}
                bg="white"
                color="brand.primary"
                fontWeight="bold"
                _hover={{ bg: "gray.200" }}
              >
               {user? "Continue" : "Get Started"}
              </Button>

              <Button
                as={Link}
                to="/home"
                bg="white"
                color="brand.primary"
                fontWeight="bold"
                _hover={{ bg: "gray.200" }}
              >
                Browse
              </Button>
            </Flex>

          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}