import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Grid, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { AlertCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllSavedProperties } from '../../../api';
import Navbar from './Navbar';
import PropertyCard from './PropertyCard';

const getSavedProperties = (response) => {
  const payload = response?.data?.data ?? response?.data ?? {};
  const items = Array.isArray(payload)
    ? payload
    : payload.properties ?? payload.savedProperties ?? payload.favorites ?? [];

  if (!Array.isArray(items)) {
    throw new Error('Saved properties response has an unexpected format.');
  }

  return items.map((item) => ({
    ...(item.property ?? item.savedProperty ?? item),
    isSaved: true,
  }));
};

export default function Favorites() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedProperties = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllSavedProperties();
      setProperties(getSavedProperties(response));
    } catch (fetchError) {
      console.error('Failed to fetch saved properties:', fetchError);
      setError(fetchError instanceof Error
        ? fetchError.message
        : 'Could not load your favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  const handleSavedChange = (propertyId, isSaved) => {
    if (!isSaved) {
      setProperties((current) =>
        current.filter((property) => (property._id || property.id) !== propertyId)
      );
    }
  };

  return (
    <Box minH="100vh" bg="brand.background" pb="100px">
      <VStack align="stretch" spacing={5} px={6} pt={8}>
        <Heading size="lg" color="brand.primary">
          Favorites
        </Heading>

        {loading ? (
          <VStack py={12} spacing={3}>
            <Spinner size="lg" color="brand.primary" />
            <Text color="brand.gray.600">Loading your saved properties...</Text>
          </VStack>
        ) : error ? (
          <VStack py={12} spacing={4}>
            <AlertCircle size={36} color="#E53E3E" />
            <Text color="brand.gray.700" textAlign="center">{error}</Text>
            <Button colorScheme="green" onClick={fetchSavedProperties}>Try again</Button>
          </VStack>
        ) : properties.length ? (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            {properties.map((property, index) => (
              <PropertyCard
                key={property._id || property.id || index}
                property={property}
                onSavedChange={handleSavedChange}
              />
            ))}
          </Grid>
        ) : (
          <VStack py={12} spacing={3}>
            <Heart size={36} color="#718096" />
            <Text color="brand.gray.600" textAlign="center">
              You haven’t saved any properties yet.
            </Text>
            <Button as={Link} to="/property-listings" variant="outline" color="brand.primary" borderColor="brand.primary">
              Find a property
            </Button>
          </VStack>
        )}
      </VStack>

      <Navbar active="favorites" />
    </Box>
  );
}
