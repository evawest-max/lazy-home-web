import { Box, HStack, VStack, Text, Badge, Image } from '@chakra-ui/react';
import { MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    verified: boolean;
    image: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="sm"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      border="1px solid"
      borderColor="brand.gray.200"
    >
      <Box position="relative">
        <Link to={`/property/${property.id}`}>
        <Image
          src={property.image}
          alt={property.title}
          h="200px"
          w="100%"
          objectFit="cover"
        />
        </Link>
        {property.verified && (
          <Badge
            variant="verified"
            position="absolute"
            top={3}
            right={3}
            display="flex"
            alignItems="center"
            gap={1}
            fontSize="xs"
          >
            <ShieldCheck size={14} />
            Verified
          </Badge>
        )}
        <Badge
          bg="brand.primary"
          color="white"
          position="absolute"
          top={3}
          left={3}
          fontSize="xs"
          px={2}
          py={1}
        >
          Escrow Safe
        </Badge>
      </Box>

      <VStack align="stretch" p={4} spacing={3}>
        <Text fontSize="xl" fontWeight="bold" color="brand.primary">
          ₦{property.price.toLocaleString()}/year
        </Text>

        <Text fontSize="md" fontWeight="600" color="brand.gray.800" noOfLines={2}>
          {property.title}
        </Text>

        <HStack spacing={1} color="brand.gray.600">
          <MapPin size={16} />
          <Text fontSize="sm">{property.location}</Text>
        </HStack>

        <HStack spacing={2}>
          <Text fontSize="sm" color="brand.gray.600">
            {property.bedrooms} bed
          </Text>
          <Text color="brand.gray.400">•</Text>
          <Text fontSize="sm" color="brand.gray.600">
            {property.bathrooms} bath
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
