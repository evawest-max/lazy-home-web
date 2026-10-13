import {
    Box,
    Button,
    Container,
    Flex,
    HStack,
    Icon,
    Spinner,
    Stack,
    Text,
    VStack,
    Avatar,
    Divider,
    Badge,
    useBreakpointValue,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiStar } from 'react-icons/fi';
import { getLandlordReviews } from '../../../api';

function StarRating({ rating = 0, size = 3.5 }) {
    const rounded = Math.round(rating);
    return (
        <HStack spacing={0.5}>
            {Array.from({ length: 5 }, (_, index) => (
                <Icon
                    key={index}
                    as={FiStar}
                    boxSize={size}
                    color={index < rounded ? 'yellow.400' : 'brand.gray.300'}
                    fill={index < rounded ? 'currentColor' : 'none'}
                />
            ))}
        </HStack>
    );
}

export default function LandlordReviewsPage() {
    const { landlordId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);

    const cardPadding = useBreakpointValue({ base: 4, sm: 6 });
    const headingSize = useBreakpointValue({ base: 'xl', md: '2xl' });

    const fetchReviews = async (page = 1) => {
        if (!landlordId) return;

        try {
            setLoading(true);
            const response = await getLandlordReviews(landlordId, page, 10);
            const payload = response?.data?.data || response?.data || {};
            const nextReviews = Array.isArray(payload.reviews) ? payload.reviews : [];
            const nextSummary = payload.summary || { averageRating: 0, totalReviews: 0 };
            const nextPagination = payload.pagination || {
                page,
                limit: 10,
                total: nextReviews.length,
                totalPages: 1,
            };

            setReviews(nextReviews);
            setSummary({
                averageRating: Number(nextSummary.averageRating ?? 0),
                totalReviews: Number(nextSummary.totalReviews ?? nextPagination.total ?? 0),
            });
            setPagination({
                page: Number(nextPagination.page || page),
                limit: Number(nextPagination.limit || 10),
                total: Number(nextPagination.total || nextReviews.length),
                totalPages: Number(nextPagination.totalPages || 1),
            });
        } catch (error) {
            console.error('Failed to load landlord reviews:', error);
            setReviews([]);
            setSummary({ averageRating: 0, totalReviews: 0 });
            setPagination({ page: 1, limit: 10, total: 0, totalPages: 1 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [landlordId]);

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
                    <VStack align="start" spacing={1}>
                        <Text fontSize={headingSize} fontWeight="700" color="brand.gray.800">
                            Landlord Reviews
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                            <HStack spacing={1}>
                                <StarRating rating={summary.averageRating} size={4} />
                                <Text fontSize="sm" fontWeight="600" color="brand.gray.700">
                                    {summary.averageRating.toFixed(1)}
                                </Text>
                            </HStack>
                            <Text fontSize="sm" color="brand.gray.500">
                                · {summary.totalReviews} review{summary.totalReviews === 1 ? '' : 's'}
                            </Text>
                        </HStack>
                    </VStack>

                    <Button
                        leftIcon={<FiArrowLeft />}
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(-1)}
                        alignSelf={{ base: 'flex-start', sm: 'auto' }}
                    >
                        Back
                    </Button>
                </Flex>

                {/* Content */}
                {loading ? (
                    <Box bg="white" borderRadius="xl" p={{ base: 8, md: 10 }} textAlign="center" boxShadow="sm">
                        <Spinner size="lg" color="brand.primary" thickness="3px" />
                        <Text fontSize="sm" color="brand.gray.500" mt={3}>
                            Loading reviews…
                        </Text>
                    </Box>
                ) : reviews.length === 0 ? (
                    <Box bg="white" borderRadius="xl" p={{ base: 8, md: 10 }} textAlign="center" boxShadow="sm">
                        <Icon as={FiMessageSquare} boxSize={8} color="brand.gray.300" mb={3} />
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
                            No reviews yet
                        </Text>
                        <Text fontSize="sm" color="brand.gray.600" mt={1}>
                            This landlord has not received any reviews.
                        </Text>
                    </Box>
                ) : (
                    <VStack align="stretch" spacing={4}>
                        {reviews.map((review, index) => {
                            const reviewer =
                                review?.tenant?.fullName ||
                                review?.tenant?.name ||
                                review?.user?.fullName ||
                                review?.user?.name ||
                                `Tenant ${index + 1}`;
                            const message = review?.review || review?.comment || 'No review message provided.';
                            const rating = Number(review?.rating || 0);

                            return (
                                <Box
                                    key={review?._id || review?.id || index}
                                    bg="white"
                                    borderRadius="xl"
                                    p={cardPadding}
                                    boxShadow="sm"
                                    borderWidth="1px"
                                    borderColor="brand.gray.100"
                                    transition="box-shadow 0.15s ease"
                                    _hover={{ boxShadow: 'md' }}
                                >
                                    <Stack
                                        direction={{ base: 'column', sm: 'row' }}
                                        align={{ base: 'stretch', sm: 'start' }}
                                        justify="space-between"
                                        spacing={3}
                                    >
                                        <HStack align="start" spacing={3} flex={1} minW={0}>
                                            <Avatar
                                                size="sm"
                                                name={reviewer}
                                                src={review?.tenant?.image || review?.user?.image || undefined}
                                                flexShrink={0}
                                            />
                                            <VStack align="start" spacing={1} flex={1} minW={0}>
                                                <Text fontWeight="600" color="brand.gray.800" noOfLines={1}>
                                                    {reviewer}
                                                </Text>
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
                                            </VStack>
                                        </HStack>

                                        {review?.createdAt && (
                                            <Badge
                                                variant="subtle"
                                                colorScheme="gray"
                                                fontSize="2xs"
                                                fontWeight="500"
                                                alignSelf={{ base: 'flex-start', sm: 'flex-start' }}
                                                flexShrink={0}
                                            >
                                                {new Date(review.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </Badge>
                                        )}
                                    </Stack>
                                </Box>
                            );
                        })}

                        {pagination.totalPages > 1 && (
                            <>
                                <Divider />
                                <Flex justify="center" align="center" gap={2} flexWrap="wrap">
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
                                                colorScheme={pagination.page === item ? 'green' : 'gray'}
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
                            </>
                        )}
                    </VStack>
                )}
            </Container>
        </Box>
    );
}