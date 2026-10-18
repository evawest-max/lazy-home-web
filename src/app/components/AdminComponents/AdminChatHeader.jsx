// In your AdminSupportChat.jsx
import { Select, Badge, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import { updateSupportStatusAPI } from '../../../../api';

export default function AdminChatHeader({ conversation, onStatusChange }) {
  const [status, setStatus] = useState(conversation.status);

  const handleChange = async (newStatus) => {
    console.log(`Changing status for ${conversation._id}`);
    setStatus(newStatus);
    await updateSupportStatusAPI(conversation._id, newStatus);
    onStatusChange(newStatus);
  };

  const color = { open: "green", pending: "yellow", closed: "gray" }[status];

  return (
    <HStack justify="space-between">
      <Badge colorScheme={color}>{status.toUpperCase()}</Badge>
      <Select value={status} onChange={(e) => handleChange(e.target.value)} w="150px" size="sm">
        <option value="open">Open</option>
        <option value="pending">Pending</option>
        <option value="closed">Closed</option>
      </Select>
    </HStack>
  );
}