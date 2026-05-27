import { Box, HStack, VStack, Text, Avatar } from '@chakra-ui/react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
  return (
    <Box bg="white" borderRadius="xl" p={5} boxShadow="sm" border="1px solid" borderColor="brand.gray.200">
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Avatar size="sm" name={testimonial.name} src={testimonial.avatar} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="600">{testimonial.name}</Text>
              <Text fontSize="xs" color="brand.gray.600">{testimonial.location}</Text>
            </VStack>
          </HStack>
          <Quote size={20} color="#26A69A" />
        </HStack>

        <HStack spacing={1}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={14} fill="#FFB800" color="#FFB800" />
          ))}
        </HStack>

        <Text fontSize="sm" color="brand.gray.700" lineHeight="1.6">
          {testimonial.text}
        </Text>

        <Text fontSize="xs" color="brand.success" fontWeight="600">
          ✓ Verified Renter
        </Text>
      </VStack>
    </Box>
  );
}
