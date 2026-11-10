import { Alert, AlertIcon, Badge, Box, Checkbox, Divider, HStack, Text, VStack } from "@chakra-ui/react";

const FEE_RULES = [
  { label: "Landlord declines", value: "Full refund" },
  { label: "Landlord no response before deadline", value: "Full refund" },
  { label: "Cancel >12h before", value: "Full refund" },
  { label: "Cancel 2h-12h before", value: "50% refund, 50% to landlord" },
  { label: "Cancel <2h or no-show", value: "No refund" },
  { label: "Both attend - inspection done", value: "Fee earned - service delivered" },
  { label: "You attend, landlord no-show", value: "Full refund" },
  { label: "Landlord attends, you no-show", value: "No refund" },
  { label: "You attend but don't want to rent", value: "No refund - inspection completed" },
];

export default function InspectionFeePolicy({ amount, accepted, onAccept }) {
  return (
    <Box bg="white" borderRadius="xl" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="md">Inspection Fee Policy</Text>
          <Badge colorScheme="teal" px={3} py={1} borderRadius="full">
            {(amount/100).toLocaleString("en-NG", {style:"currency", currency:"NGN"})} Deposit
          </Badge>
        </HStack>

        <Alert status="info" borderRadius="lg" fontSize="sm">
          <AlertIcon />
          <Text><strong>Note:</strong> Deciding not to rent after viewing is NOT a refund reason. Fee is for inspection service.</Text>
        </Alert>

        <VStack align="stretch" spacing={2}>
          {FEE_RULES.map((r, i) => (
            <HStack key={i} justify="space-between" py={2} borderBottom={i < FEE_RULES.length-1 ? "1px solid" : "none"} borderColor="gray.100">
              <Text fontSize="sm" fontWeight="600">{r.label}</Text>
              <Text fontSize="xs" color="gray.600" textAlign="right" maxW="50%">{r.value}</Text>
            </HStack>
          ))}
        </VStack>

        <Divider />

        <Box bg="gray.50" p={4} borderRadius="lg">
          <Text fontSize="sm" fontWeight="700" mb={2}>After attendance confirmed:</Text>
          <Text fontSize="xs" color="gray.700">1. Status → attended • 2. Fee settlement starts • 3. You choose: Rent or Not • 4. No automatic refund if you decline</Text>
        </Box>

        <Checkbox isChecked={accepted} onChange={(e) => onAccept(e.target.checked)} colorScheme="teal" size="lg">
          <Text fontSize="sm" fontWeight="600">I agree to the inspection fee policy. I understand fee is earned after inspection and not refundable if I decide not to rent.</Text>
        </Checkbox>
      </VStack>
    </Box>
  );
}