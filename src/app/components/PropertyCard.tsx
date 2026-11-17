import { Box, HStack, VStack, Text, Badge, Image } from '@chakra-ui/react';
import { Heart, MapPin, ShieldCheck } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { increaseViewAndStoreHistory, saveProperty } from '../../../api';

export default function PropertyCard({ property }: { property: any }) {
  const [isSaved, setIsSaved] = useState(property?.isSaved || false);

  const handleIncreaseViewAndStoreHistory = (id: string | number) => {
    try {
      const res = increaseViewAndStoreHistory(id);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const id = property?._id || property?.id;
    if (!id) return;

    try {
      const res = await saveProperty(id);
      console.log(res)
      if (res.data.data.unsaved) {
        setIsSaved(false);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        setIsSaved(true);
        setTimeout(() => setIsSaved(true), 2000);
      }
    } catch (error) {
      console.error('Failed to save property:', error);
    }
  };

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
        <Link onClick={() => handleIncreaseViewAndStoreHistory(property._id)} to={`/property/${property._id}`} state={property}>
          <Image
            src={property.media.images[0]?.url || '/placeholder.jpg'} // use first image or fallback
            alt={property.title || property.propertyType}
            h="200px"
            w="100%"
            objectFit="cover"
          />
        </Link>

        {property.verificationStatus === "verified" && (
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
          RentGidi Safe
        </Badge>

        <Badge
          as="button"
          type="button"
          bg={isSaved ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)'}
          color={isSaved ? 'brand.primary' : 'white'}
          position="absolute"
          top={3}
          right={3}
          w="38px"
          h="38px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          border="1px solid"
          borderColor={isSaved ? 'white' : 'rgba(255,255,255,0.5)'}
          boxShadow="0 8px 18px rgba(15, 23, 42, 0.18)"
          backdropFilter="blur(6px)"
          _hover={{ transform: 'scale(1.05)', bg: isSaved ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.2)' }}
          transition="all 0.2s ease"
          onClick={handleSave}
          aria-label={isSaved ? 'Property saved' : 'Save property'}
        >
          <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={2.2} />
        </Badge>
      </Box>

      <VStack align="stretch" p={4} spacing={3}>
        <Text fontSize="xl" fontWeight="bold" color="brand.primary">
          ₦{property.rentAmount}/year
        </Text>

        <Text fontSize="md" fontWeight="600" color="brand.gray.800" noOfLines={2}>
          {property.title || property.propertyType}
        </Text>

        <HStack spacing={1} color="brand.gray.600">
          <MapPin size={16} />
          <Text fontSize="sm">
            {property.address?.area}, {property.address?.state}
          </Text>
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
