import React from 'react'
import { Box, Button, VStack, Text, Heading, HStack, Divider } from '@chakra-ui/react';
import { Mail, Phone, Chrome, ShieldCheck, RefreshCw, Lock, Home, Search, FileText, User, LayoutDashboard, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminNavbar({ active }) {
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
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'Dashboard' ? 'brand.primary' : 'brand.gray.400'}>
                <LayoutDashboard size={24} />
                <Text fontSize="xs" fontWeight="600">User Dashboard</Text>
              </VStack>
            </Link>
            <Link to="/financial-dashboard" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'Finance' ? 'brand.primary' : 'brand.gray.400'}>
                <Search size={24} />
                <Text fontSize="xs" fontWeight="600">Finance </Text>
              </VStack>
            </Link>
            <Link to="/wallet-management" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'Wallet Management' ? 'brand.primary' : 'brand.gray.400'}>
                <Wallet size={24} />
                <Text fontSize="xs" fontWeight="600">Wallets</Text>
              </VStack>
            </Link>
            <Link to="/user-management" style={{ textDecoration: 'none' }}>
              <VStack spacing={1} cursor="pointer" color={active === 'User Management' ? 'brand.primary' : 'brand.gray.400'}>
                <User size={24} />
                <Text fontSize="xs" fontWeight="600">User Management</Text>
              </VStack>
            </Link>
        </HStack>
      </Box>
  )
}
