import React from 'react'
import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import { Heart, Home, Search, User, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ active }) {
  return (
    <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.gray.200"
        px={6}
        py={3}
        boxShadow="lg"
      >
        <HStack justify="space-around">
            <Link to="/home" style={{ textDecoration: 'none' }}>
                <VStack spacing={1} cursor="pointer" color={active === 'home' ? 'brand.primary' : 'brand.gray.400'}>
                    <Home size={24} />
                    <Text fontSize="xs" fontWeight="600">Home</Text>
                </VStack>
            </Link>
            <Link to="/property-listings" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'property-listings' ? 'brand.primary' : 'brand.gray.400'}>
                <Search size={24} />
                <Text fontSize="xs" fontWeight="600">Find property</Text>
              </VStack>
            </Link>
            <Link to="/favorites" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'favorites' ? 'brand.primary' : 'brand.gray.400'}>
                <Heart size={24} />
                <Text fontSize="xs" fontWeight="600">Favorites</Text>
              </VStack>
            </Link>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'dashboard' ? 'brand.primary' : 'brand.gray.400'}>
                <LayoutDashboard size={24} />
                <Text fontSize="xs" fontWeight="600">My Dashboard</Text>
              </VStack>
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'profile' ? 'brand.primary' : 'brand.gray.400'}>
                <User size={24} />
                <Text fontSize="xs" fontWeight="600">Profile</Text>
              </VStack>
            </Link>
        </HStack>
      </Box>
  )
}
