import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Box,
    VStack,
    HStack,
    Text,
    Badge,
    Image,
    Divider,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    SimpleGrid,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';

// ---- helpers ---------------------------------------------------------

const formatCurrency = (value) => {
    const n = Number(value);
    if (!n && n !== 0) return 'N/A';
    return `₦${n.toLocaleString()}`;
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString();
};

const listingStatusColorScheme = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'available') return 'green';
    if (s === 'under_offer') return 'yellow';
    if (s === 'rented') return 'blue';
    if (s === 'archived') return 'gray';
    return 'gray';
};

const verificationColorScheme = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'fully_verified') return 'green';
    if (s === 'basic_verified') return 'blue';
    if (s === 'pending') return 'yellow';
    if (s === 'rejected' || s === 'suspended') return 'red';
    return 'gray';
};

// A person field can arrive populated ({ fullName, name, email }) or as a raw ObjectId string.
const personLabel = (person, fallback = 'N/A') => {
    if (!person) return fallback;
    if (typeof person === 'string') return person;
    return person.fullName || person.name || person.email || person._id || fallback;
};

const Field = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <Box>
            <Text fontSize="xs" color="brand.gray.600">{label}</Text>
            <Text fontSize="sm" fontWeight="600" wordBreak="break-word">{value}</Text>
        </Box>
    );
};

const SectionCard = ({ children }) => (
    <Box bg="brand.background" p={4} borderRadius="xl">
        {children}
    </Box>
);

const YesNo = ({ value }) => (value ? 'Yes' : 'No');

// ---- main component ---------------------------------------------------

export default function PropertyDetailsModal({ isOpen, onClose, property }) {
    if (!property) return null;

    const {
        title,
        description,
        propertyType,
        rentAmount,
        rentDuration,
        negotiable,
        cautionDeposit,
        minimumLeasePeriod,
        serviceCharge,
        serviceChargePeriod,
        address,
        mapsLink,
        bedrooms,
        bathrooms,
        toilets,
        amenities,
        size,
        media,
        listedBy,
        ownershipType,
        landlordDetails,
        verificationStatus,
        verifiedBy,
        verifiedAt,
        listingStatus,
        rentPaid,
        rentPaidBy,
        paymentDate,
        availableFrom,
        rejectionReason,
        isActive,
        isFeatured,
        featuredUntil,
        views,
        saves,
        contactClicks,
        shareCount,
        termsAccepted,
        escrowAccepted,
        policyAccepted,
        partPayment,
        flexibleMoveIn,
        serviceFee,
        inspectionFee,
        tenantPreference,
        approved,
        createdAt,
        updatedAt,
    } = property;

    const images = media?.images || [];
    const videos = media?.videos || [];
    const coverImage = images?.[0]?.url || '';

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="2xl" overflow="hidden">
                <ModalHeader pb={2}>
                    <HStack justify="space-between" pr={8} align="start">
                        <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="700">{title || 'Property details'}</Text>
                            <Text fontSize="xs" color="brand.gray.600">
                                {[address?.area, address?.state].filter(Boolean).join(', ') || 'Location unavailable'}
                            </Text>
                        </VStack>
                        <VStack align="end" spacing={1}>
                            <Badge colorScheme={listingStatusColorScheme(listingStatus)} fontSize="0.75em" px={2} py={1} borderRadius="md">
                                {(listingStatus || 'unknown').replace(/_/g, ' ')}
                            </Badge>
                            <Badge colorScheme={verificationColorScheme(verificationStatus)} fontSize="0.7em" px={2} py={1} borderRadius="md">
                                {(verificationStatus || 'pending').replace(/_/g, ' ')}
                            </Badge>
                        </VStack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody pb={6}>
                    <VStack align="stretch" spacing={5}>

                        {/* Cover image + key facts */}
                        <HStack align="start" spacing={4}>
                            <Image
                                src={coverImage || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpjDOEMVVmUKWc44itg3SRb8byRB3wlGPCqOL5ETrLKnTGSvGBBNWdOoSY&s=10'}
                                alt={title || 'Property image'}
                                boxSize="90px"
                                objectFit="cover"
                                borderRadius="lg"
                                flexShrink={0}
                            />
                            <SimpleGrid columns={2} spacing={3} flex="1">
                                <Field label="Rent" value={rentAmount != null ? `${formatCurrency(rentAmount)} / ${rentDuration}` : null} />
                                <Field label="Property type" value={propertyType} />
                                <Field label="Bedrooms" value={bedrooms} />
                                <Field label="Bathrooms" value={bathrooms} />
                                <Field label="Toilets" value={toilets} />
                                <Field label="Size" value={size ? `${size} m²` : null} />
                                <Field label="Negotiable" value={<YesNo value={negotiable} />} />
                                <Field label="Ownership type" value={ownershipType} />
                            </SimpleGrid>
                        </HStack>

                        <Divider />

                        <Accordion allowMultiple defaultIndex={[0, 1]}>

                            {/* Description */}
                            {description && (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                                Description
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel>
                                        <Text fontSize="sm" color="brand.gray.700">{description}</Text>
                                    </AccordionPanel>
                                </AccordionItem>
                            )}

                            {/* Location */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Location
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <SectionCard>
                                        <SimpleGrid columns={2} spacing={2}>
                                            <Field label="State" value={address?.state} />
                                            <Field label="LGA" value={address?.lga} />
                                            <Field label="Area" value={address?.area} />
                                            <Field label="Street address" value={address?.streetAddress} />
                                            <Field label="Landmark" value={address?.landmark} />
                                            <Field label="Maps link" value={mapsLink} />
                                        </SimpleGrid>
                                    </SectionCard>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Media */}
                            {(images.length > 0 || videos.length > 0) && (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                                Media ({images.length} photo{images.length === 1 ? '' : 's'}{videos.length ? `, ${videos.length} video${videos.length === 1 ? '' : 's'}` : ''})
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel>
                                        {images.length > 0 && (
                                            <Box>
                                                <Text fontSize="xs" color="brand.gray.600" mb={2}>Photos</Text>
                                                <HStack
                                                    spacing={2}
                                                    overflowX="auto"
                                                    pb={2}
                                                    css={{
                                                        '&::-webkit-scrollbar': { height: '6px' },
                                                        '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
                                                    }}
                                                >
                                                    {images.map((img, idx) => (
                                                        <Box
                                                            key={img.ipfsHash || img.url || idx}
                                                            flexShrink={0}
                                                            as="a"
                                                            href={img.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Image
                                                                src={img.url}
                                                                alt={`Property image ${idx + 1}`}
                                                                boxSize="140px"
                                                                objectFit="cover"
                                                                borderRadius="md"
                                                            />
                                                        </Box>
                                                    ))}
                                                </HStack>
                                            </Box>
                                        )}

                                        {videos.length > 0 && (
                                            <Box mt={images.length > 0 ? 4 : 0}>
                                                <Text fontSize="xs" color="brand.gray.600" mb={2}>Videos</Text>
                                                <HStack
                                                    spacing={3}
                                                    overflowX="auto"
                                                    pb={2}
                                                    align="start"
                                                    css={{
                                                        '&::-webkit-scrollbar': { height: '6px' },
                                                        '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
                                                    }}
                                                >
                                                    {videos.map((v, idx) => (
                                                        <Box key={v.ipfsHash || v.url || idx} flexShrink={0} borderRadius="md" overflow="hidden">
                                                            <Box
                                                                as="video"
                                                                src={v.url}
                                                                controls
                                                                preload="metadata"
                                                                h="160px"
                                                                w="240px"
                                                                borderRadius="md"
                                                                bg="black"
                                                            />
                                                        </Box>
                                                    ))}
                                                </HStack>
                                            </Box>
                                        )}
                                    </AccordionPanel>
                                </AccordionItem>
                            )}

                            {/* Amenities & preferences */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Amenities & preferences
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <VStack align="stretch" spacing={3}>
                                        {amenities && amenities.length > 0 && (
                                            <Wrap>
                                                {amenities.map((a, idx) => (
                                                    <WrapItem key={idx}>
                                                        <Badge colorScheme="teal" borderRadius="md" px={2} py={1}>{a}</Badge>
                                                    </WrapItem>
                                                ))}
                                            </Wrap>
                                        )}
                                        <Field label="Tenant preference" value={tenantPreference?.replace(/_/g, ' ')} />
                                        <Field label="Minimum lease period" value={minimumLeasePeriod} />
                                        <Field label="Available from" value={formatDate(availableFrom)} />
                                        <Field label="Flexible move-in" value={<YesNo value={flexibleMoveIn} />} />
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Pricing */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Pricing
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <SectionCard>
                                        <SimpleGrid columns={2} spacing={2}>
                                            <Field label="Rent amount" value={formatCurrency(rentAmount)} />
                                            <Field label="Rent duration" value={rentDuration} />
                                            <Field label="Caution deposit" value={formatCurrency(cautionDeposit)} />
                                            <Field label="Service charge" value={formatCurrency(serviceCharge)} />
                                            <Field label="Service charge period" value={serviceChargePeriod} />
                                            <Field label="Service fee" value={serviceFee} />
                                            <Field label="Inspection fee" value={inspectionFee} />
                                            <Field label="Part payment allowed" value={<YesNo value={partPayment} />} />
                                        </SimpleGrid>
                                    </SectionCard>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Landlord / listing owner */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Landlord & listing owner
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <VStack align="stretch" spacing={3}>
                                        <SectionCard>
                                            <Text fontSize="xs" color="brand.gray.600" mb={1}>Listed by</Text>
                                            <Text fontSize="sm" fontWeight="600">{personLabel(listedBy)}</Text>
                                        </SectionCard>

                                        {landlordDetails && (
                                            <SectionCard>
                                                <Text fontSize="xs" color="brand.gray.600" mb={2}>Landlord details</Text>
                                                <SimpleGrid columns={2} spacing={2}>
                                                    <Field label="Full name" value={landlordDetails.fullName} />
                                                    <Field label="Phone" value={landlordDetails.phone} />
                                                    <Field label="Email" value={landlordDetails.landlordEmail} />
                                                    <Field label="Alt. phone" value={landlordDetails.landlordPhoneNumber} />
                                                    <Field label="Bank name" value={landlordDetails.bankName} />
                                                    <Field label="Bank code" value={landlordDetails.bankCode} />
                                                    <Field label="Account number" value={landlordDetails.accountNumber} />
                                                </SimpleGrid>
                                            </SectionCard>
                                        )}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Verification & rent status */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Verification & rent status
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <SectionCard>
                                        <SimpleGrid columns={2} spacing={2}>
                                            <Field label="Verification status" value={verificationStatus?.replace(/_/g, ' ')} />
                                            <Field label="Verified by" value={personLabel(verifiedBy, null)} />
                                            <Field label="Verified at" value={formatDate(verifiedAt)} />
                                            <Field label="Approved" value={<YesNo value={approved} />} />
                                            <Field label="Rejection reason" value={rejectionReason} />
                                            <Field label="Rent paid" value={<YesNo value={rentPaid} />} />
                                            <Field label="Rent paid by" value={personLabel(rentPaidBy, null)} />
                                            <Field label="Payment date" value={formatDate(paymentDate)} />
                                        </SimpleGrid>
                                    </SectionCard>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Engagement & flags */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Engagement & status flags
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <SectionCard>
                                        <SimpleGrid columns={2} spacing={2}>
                                            <Field label="Views" value={views} />
                                            <Field label="Saves" value={saves} />
                                            <Field label="Contact clicks" value={contactClicks} />
                                            <Field label="Share count" value={shareCount} />
                                            <Field label="Active" value={<YesNo value={isActive} />} />
                                            <Field label="Featured" value={<YesNo value={isFeatured} />} />
                                            <Field label="Featured until" value={formatDate(featuredUntil)} />
                                            <Field label="Terms accepted" value={<YesNo value={termsAccepted} />} />
                                            <Field label="Escrow accepted" value={<YesNo value={escrowAccepted} />} />
                                            <Field label="Policy accepted" value={<YesNo value={policyAccepted} />} />
                                            <Field label="Created" value={formatDate(createdAt)} />
                                            <Field label="Last updated" value={formatDate(updatedAt)} />
                                        </SimpleGrid>
                                    </SectionCard>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
