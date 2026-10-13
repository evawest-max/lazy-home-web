import {
    Box,
    Button,
    Card,
    CardBody,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Spinner,
    Stack,
    Text,
    VStack,
    Avatar,
    Badge,
    Divider,
    useToast,
    useBreakpointValue,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiStar } from 'react-icons/fi';
import { adminGetAppReviews, moderateAppReview } from '../../../../api';

const statusOptions = ['published', 'hidden', 'flagged'];

const statusColorMap = {
    published: 'green',
    hidden: 'gray',
    flagged: 'red',
};

function StarRating({ rating = 0 }) {
    const rounded = Math.round(rating);
    return (
        <HStack spacing={0.5}>
            {Array.from({ length: 5 }, (_, index) => (
                <Icon
                    key={index}
                    as={FiStar}
                    boxSize={3.5}
                    color={index < rounded ? 'yellow.400' : 'brand.gray.300'}
                    fill={index < rounded ? 'currentColor' : 'none'}
                />
            ))}
        </HStack>
    );
}

export default function AdminAppReviewsPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const isCompact = useBreakpointValue({ base: true, md: false });
    const cardPadding = useBreakpointValue({ base: 4, sm: 6 });
    const pageHeadingSize = useBreakpointValue({ base: 'md', md: 'lg' });

    const fetchReviews = async (page = 1) => {
        try {
            setLoading(true);
            const response = await adminGetAppReviews(page, 10);
            const payload = response?.data?.data || response?.data || {};
            const nextReviews = Array.isArray(payload.reviews) ? payload.reviews : [];
            const nextPagination = payload.pagination || {
                page,
                limit: 10,
                total: nextReviews.length,
                totalPages: 1,
            };

            setReviews(nextReviews);
            setPagination({
                page: Number(nextPagination.page || page),
                limit: Number(nextPagination.limit || 10),
                total: Number(nextPagination.total || nextReviews.length),
                totalPages: Number(nextPagination.totalPages || 1),
            });
        } catch (error) {
            console.error('Failed to fetch app reviews:', error);
            setReviews([]);
            setPagination({ page: 1, limit: 10, total: 0, totalPages: 1 });
            toast({
                title: 'Unable to load app reviews',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStatusChange = async (reviewId, status) => {
        if (!reviewId || !status) return;

        try {
            setUpdatingId(reviewId);
            await moderateAppReview(status, reviewId);
            setReviews((current) =>
                current.map((review) =>
                    (review?._id || review?.id) === reviewId ? { ...review, status } : review
                )
            );
            toast({
                title: 'Review status updated',
                description: `Review marked as ${status}.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Failed to update review status:', error);
            toast({
                title: 'Unable to update review status',
                description: error?.response?.data?.message || 'Please try again.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return;
        fetchReviews(page);
    };

    // Collapse a long page list into a compact window with ellipses.
    const pageItems = useMemo(() => {
        const total = Math.max(1, pagination.totalPages);
        const current = pagination.page;
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        const items = new Set([1, total, current, current - 1, current + 1]);
        const sorted = Array.from(items)
            .filter((p) => p >= 1 && p <= total)
            .sort((a, b) => a - b);

        const withGaps = [];
        sorted.forEach((page, idx) => {
            if (idx > 0 && page - sorted[idx - 1] > 1) {
                withGaps.push('ellipsis-' + page);
            }
            withGaps.push(page);
        });
        return withGaps;
    }, [pagination.page, pagination.totalPages]);

    return (
        <Box minH="100vh" bg="brand.background">
            <Container maxW="1100px" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
                {/* Header */}
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align={{ base: 'stretch', sm: 'center' }}
                    mb={{ base: 6, md: 8 }}
                    gap={4}
                >
                    <VStack align={{ base: 'start', sm: 'start' }} spacing={1}>
                        <Heading as="h1" size={pageHeadingSize} color="brand.gray.800">
                            App Reviews
                        </Heading>
                        <Text fontSize="sm" color="brand.gray.600">
                            {loading
                                ? 'Loading reviews…'
                                : `${pagination.total} total review${pagination.total === 1 ? '' : 's'}`}
                        </Text>
                    </VStack>

                    <Button
                        leftIcon={<FiArrowLeft />}
                        variant="outline"
                        onClick={() => navigate('/user-management')}
                        alignSelf={{ base: 'flex-start', sm: 'auto' }}
                        size={{ base: 'sm', md: 'md' }}
                    >
                        Back to dashboard
                    </Button>
                </Flex>

                {/* Content */}
                {loading ? (
                    <Card borderRadius="xl" shadow="sm">
                        <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={16} gap={3}>
                            <Spinner size="lg" color="brand.primary" thickness="3px" />
                            <Text fontSize="sm" color="brand.gray.500">Fetching app reviews…</Text>
                        </CardBody>
                    </Card>
                ) : reviews.length === 0 ? (
                    <Card borderRadius="xl" shadow="sm">
                        <CardBody py={16} textAlign="center">
                            <Icon as={FiMessageSquare} boxSize={8} color="brand.gray.300" mb={3} />
                            <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
                                No app reviews found
                            </Text>
                            <Text fontSize="sm" color="brand.gray.500" mt={1}>
                                Reviews submitted by users will appear here.
                            </Text>
                        </CardBody>
                    </Card>
                ) : (
                    <Stack spacing={4}>
                        {reviews.map((review, index) => {
                            const reviewId = review?._id || review?.id;
                            const reviewer = review?.user?.fullName || review?.user?.name || `User ${index + 1}`;
                            const message = review?.review || review?.comment || 'No review message provided.';
                            const rating = Number(review?.rating || 0);
                            const currentStatus = String(review?.status || 'published').toLowerCase();
                            const isUpdating = updatingId === reviewId;

                            return (
                                <Card
                                    key={reviewId || index}
                                    borderRadius="xl"
                                    shadow="sm"
                                    borderWidth="1px"
                                    borderColor="brand.gray.100"
                                    transition="box-shadow 0.15s ease"
                                    _hover={{ shadow: 'md' }}
                                >
                                    <CardBody p={cardPadding}>
                                        <Stack
                                            direction={{ base: 'column', md: 'row' }}
                                            justify="space-between"
                                            align={{ base: 'stretch', md: 'flex-start' }}
                                            spacing={4}
                                        >
                                            {/* Reviewer info */}
                                            <HStack align="start" spacing={3} flex={1} minW={0}>
                                                <Avatar
                                                    size="sm"
                                                    name={reviewer}
                                                    src={review?.user?.image || undefined}
                                                    flexShrink={0}
                                                />
                                                <VStack align="start" spacing={1.5} flex={1} minW={0}>
                                                    <Flex
                                                        wrap="wrap"
                                                        align="center"
                                                        columnGap={2}
                                                        rowGap={0.5}
                                                        w="full"
                                                    >
                                                        <Text fontWeight="600" color="brand.gray.800" noOfLines={1}>
                                                            {reviewer}
                                                        </Text>
                                                        <Badge
                                                            colorScheme={statusColorMap[currentStatus] || 'gray'}
                                                            variant="subtle"
                                                            fontSize="2xs"
                                                            textTransform="capitalize"
                                                        >
                                                            {currentStatus}
                                                        </Badge>
                                                    </Flex>

                                                    <HStack spacing={2}>
                                                        <StarRating rating={rating} />
                                                        <Text fontSize="xs" color="brand.gray.500">
                                                            {rating.toFixed(1)}/5
                                                        </Text>
                                                    </HStack>

                                                    <Text
                                                        fontSize="sm"
                                                        color="brand.gray.700"
                                                        whiteSpace="pre-wrap"
                                                        wordBreak="break-word"
                                                    >
                                                        {message}
                                                    </Text>

                                                    {review?.createdAt && (
                                                        <Text fontSize="xs" color="brand.gray.400" display={{ base: 'block', md: 'none' }}>
                                                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </HStack>

                                            {/* Actions */}
                                            <VStack
                                                align={{ base: 'stretch', md: 'end' }}
                                                spacing={2}
                                                minW={{ base: 'auto', md: '220px' }}
                                            >
                                                {review?.createdAt && (
                                                    <Text
                                                        fontSize="xs"
                                                        color="brand.gray.500"
                                                        display={{ base: 'none', md: 'block' }}
                                                    >
                                                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </Text>
                                                )}

                                                {isCompact && <Divider />}

                                                <HStack
                                                    spacing={2}
                                                    flexWrap="wrap"
                                                    justify={{ base: 'flex-start', md: 'flex-end' }}
                                                    w="full"
                                                >
                                                    {statusOptions.map((status) => (
                                                        <Button
                                                            key={status}
                                                            size="xs"
                                                            flex={{ base: 1, md: 'initial' }}
                                                            minW={{ base: '0', md: 'auto' }}
                                                            variant={currentStatus === status ? 'solid' : 'outline'}
                                                            colorScheme={currentStatus === status ? statusColorMap[status] : 'gray'}
                                                            isLoading={isUpdating}
                                                            loadingText={status}
                                                            isDisabled={updatingId !== null && !isUpdating}
                                                            onClick={() => handleStatusChange(reviewId, status)}
                                                            textTransform="capitalize"
                                                        >
                                                            {status}
                                                        </Button>
                                                    ))}
                                                </HStack>
                                            </VStack>
                                        </Stack>
                                    </CardBody>
                                </Card>
                            );
                        })}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <Flex justify="center" align="center" gap={2} flexWrap="wrap" pt={2}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    isDisabled={pagination.page <= 1}
                                >
                                    Previous
                                </Button>

                                {pageItems.map((item) =>
                                    typeof item === 'string' ? (
                                        <Text key={item} px={1} color="brand.gray.400" fontSize="sm" userSelect="none">
                                            &hellip;
                                        </Text>
                                    ) : (
                                        <Button
                                            key={item}
                                            size="sm"
                                            variant={pagination.page === item ? 'solid' : 'outline'}
                                            colorScheme={pagination.page === item ? 'teal' : 'gray'}
                                            onClick={() => handlePageChange(item)}
                                        >
                                            {item}
                                        </Button>
                                    )
                                )}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    isDisabled={pagination.page >= pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </Flex>
                        )}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}