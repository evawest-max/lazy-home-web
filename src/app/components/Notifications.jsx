import React from 'react';
import { useEffect, useState } from 'react';
import {
	Box,
	VStack,
	HStack,
	Text,
	Spinner,
	Button,
	Avatar,
	Badge,
	Icon,
	useToast,
	Divider,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	useDisclosure,
	} from '@chakra-ui/react';
import { Bell } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllAsRead } from '../../../api';

function formatDate(d) {
	try {
		return new Date(d).toLocaleString();
	} catch (e) {
		return '';
	}
}

export default function Notifications() {
	const [loading, setLoading] = useState(true);
	const [notifications, setNotifications] = useState([]);
	const [busy, setBusy] = useState(false);
	const [page, setPage] = useState(1);
	const pageSize = 8;
	const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
	const paginated = notifications.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
	const { isOpen: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure();
	const [selectedNotification, setSelectedNotification] = useState(null);
	const toast = useToast();

	const fetchNotifications = async () => {
		setLoading(true);
		try {
			const resp = await getNotifications();
            console.log("noyification", resp)
			const list = resp?.data?.data.notifications || resp?.data || [];
			setNotifications(Array.isArray(list) ? list : []);
		} catch (err) {
			console.error('Failed to load notifications', err);
			toast({ title: 'Unable to load notifications', status: 'error' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, []);

	const handleMarkRead = async (id) => {
		setBusy(true);
		try {
			await markNotificationAsRead(id);
			setNotifications((prev) => prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n)));
			toast({ title: 'Marked as read', status: 'success' });
		} catch (err) {
			console.error('Failed to mark read', err);
			toast({ title: 'Failed to mark as read', status: 'error' });
		} finally {
			setBusy(false);
		}
	};

	const handleMarkAll = async () => {
		setBusy(true);
		try {
			await markAllAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
			toast({ title: 'All notifications marked read', status: 'success' });
		} catch (err) {
			console.error('Failed to mark all read', err);
			toast({ title: 'Failed to mark all read', status: 'error' });
		} finally {
			setBusy(false);
		}
	};

	const handleTitleClick = async (n) => {
		try {
			if (!n.read) await handleMarkRead(n._id || n.id || n.reference);
		} catch (e) {
			console.warn('Failed to mark read before opening', e);
		}
		setSelectedNotification(n);
		onOpenModal();
	};

	return (
		<Box minH="100vh" bg="brand.background" p={6} pb={24}>
			<VStack align="stretch" spacing={6} maxW="900px" mx="auto">
				<HStack justify="space-between" align="center" flexDirection="column">
					<HStack spacing={3}>
						<Box bg="brand.primary" p={2} borderRadius="full" color="white">
							<Icon as={Bell} />
						</Box>
						<VStack align="start" spacing={0}>
							<Text fontSize="2xl" fontWeight="700">Notifications</Text>
							<Text fontSize="sm" color="brand.gray.600">Recent updates about your account and activity</Text>
						</VStack>
					</HStack>

					<HStack spacing={3}>
						<Button size="sm" variant="ghost" onClick={fetchNotifications} isDisabled={loading || busy}>
							Refresh
						</Button>
						<Button size="sm" colorScheme="teal" onClick={handleMarkAll} isLoading={busy}>
							Mark all read
						</Button>
					</HStack>
				</HStack>

				<Box bg="white" borderRadius="lg" boxShadow="sm" p={4}>
					{loading ? (
						<HStack justify="center"><Spinner /></HStack>
					) : notifications.length === 0 ? (
						<VStack py={12}>
							<Text color="brand.gray.600">You're all caught up — no notifications.</Text>
						</VStack>
					) : (
						<VStack align="stretch" spacing={3}>
							{paginated.map((n) => (
								<Box key={n._id || n.id || n.reference} p={3} borderRadius="md" bg={n.read ? 'white' : 'brand.background'}>
									<HStack align="start" justify="space-between">
										<HStack align="start" spacing={3} flex={1}>
											<Avatar size="sm" name={n.senderName || 'System'} src={n.avatar} />
											<VStack align="start" spacing={0} flex={1}>
												<Text cursor="pointer" onClick={() => handleTitleClick(n)} fontWeight={n.read ? '600' : '700'}>{n.title || n.message || 'Notification'}</Text>
												{n.body || n.message ? <Text fontSize="sm" color="brand.gray.600">{n.body || n.message}</Text> : null}
												<Text fontSize="xs" color="brand.gray.500">{formatDate(n.createdAt || n.date)}</Text>
											</VStack>
										</HStack>

										<HStack spacing={2}>
											{!n.read && (
												<Badge colorScheme="green">New</Badge>
											)}
											<Button size="sm" variant="outline" onClick={() => handleMarkRead(n._id || n.id || n.reference)} isDisabled={n.read || busy}>
												Mark read
											</Button>
										</HStack>
									</HStack>
								</Box>
							))}

							<HStack justify="center" spacing={2} mt={2}>
								<Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>Previous</Button>
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
									<Button key={p} size="sm" variant={page === p ? 'solid' : 'outline'} onClick={() => setPage(p)}>{p}</Button>
								))}
								<Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} isDisabled={page === totalPages}>Next</Button>
							</HStack>
						</VStack>
					)}
				</Box>
			</VStack>

			<Modal isOpen={isModalOpen} onClose={() => { onCloseModal(); setSelectedNotification(null); }} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>{selectedNotification?.title || 'Notification'}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack align="stretch" spacing={3}>
							<Text fontSize="sm" color="brand.gray.600">{selectedNotification?.body || selectedNotification?.message}</Text>
							<Divider />
							<Text fontSize="xs" color="brand.gray.500">{formatDate(selectedNotification?.createdAt || selectedNotification?.date)}</Text>
							{selectedNotification?.meta && (
								<Box mt={2} p={3} bg="brand.background" borderRadius="md">
									<Text fontSize="xs" whiteSpace="pre-wrap">{JSON.stringify(selectedNotification.meta, null, 2)}</Text>
								</Box>
							)}
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button onClick={() => { onCloseModal(); setSelectedNotification(null); }}>Close</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
}

