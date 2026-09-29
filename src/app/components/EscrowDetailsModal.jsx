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
    Grid,
    Text,
    Badge,
    Image,
    Divider,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Wrap,
    WrapItem,
    SimpleGrid,
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

const statusColorScheme = (status = '') => {
    const s = status.toLowerCase();
    if (['released', 'landlord_confirmed', 'inspection_confirmed'].includes(s)) return 'green';
    if (['pending', 'funded', 'handover_requested', 'releasing', 'awaiting_transfer_otp', 'awaiting_manual_transfer'].includes(s)) return 'yellow';
    if (['release_failed', 'refund_failed', 'disputed', 'cancelled'].includes(s)) return 'red';
    if (['refunded', 'refund_requested'].includes(s)) return 'purple';
    return 'gray';
};

// A person field on the schema can arrive as a populated object
// ({ fullName, name, email, phone }) or as a raw ObjectId string.
const personLabel = (person, fallback = 'N/A') => {
    if (!person) return fallback;
    if (typeof person === 'string') return person;
    return person.fullName || person.name || person.email || person._id || fallback;
};

const isPopulated = (person) => person && typeof person === 'object';

// A small "label / value" pair used throughout the modal.
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

// ---- main component ---------------------------------------------------

export default function EscrowDetailsModal({ isOpen, onClose, escrow }) {
    if (!escrow) return null;

    const {
        title,
        reference,
        status,
        purpose,
        escrowType,
        ownershipType,
        amount,
        payoutStatus,
        releaseMethod,
        createdAt,
        updatedAt,
        propertyImages,
        tenant,
        landlord,
        actualLandlord,
        property,
        rentSnapshot,
        payoutBreakdown,
        transfers,
        refund,
        dispute,
        timeline,
        handoverRequestedAt,
        landlordConfirmedHandover,
        landlordConfirmedAt,
        tenantConfirmedInspection,
        tenantConfirmedAt,
        releaseCodeGenerated,
        releasedAt,
        releasedAmount,
        releaseAttempts,
        releaseAttemptedAt,
        releaseFailureReason,
        refundedAt,
        transferOtpVerifiedAt,
        workflowVersion,
        landlordReview,
        appReview,
        reviewSubmitted,
        walletTransaction,
    } = escrow;

    const coverImage = propertyImages?.[0]?.url
        || property?.media?.images?.[0]?.url
        || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpjDOEMVVmUKWc44itg3SRb8byRB3wlGPCqOL5ETrLKnTGSvGBBNWdOoSY&s=10';

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="2xl" overflow="hidden">
                <ModalHeader pb={2}>
                    <HStack justify="space-between" pr={8} align="start">
                        <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="700">{title || 'Escrow Transaction'}</Text>
                            <Text fontSize="xs" color="brand.gray.600">Ref: {reference || escrow._id}</Text>
                        </VStack>
                        <Badge colorScheme={statusColorScheme(status)} fontSize="0.75em" px={2} py={1} borderRadius="md">
                            {(status || 'unknown').replace(/_/g, ' ')}
                        </Badge>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody pb={6}>
                    <VStack align="stretch" spacing={5}>

                        {/* Cover image + headline amount */}
                        <HStack align="start" spacing={4}>
                            <Image
                                src={coverImage}
                                alt={title || 'Escrow property image'}
                                boxSize="90px"
                                objectFit="cover"
                                borderRadius="lg"
                                flexShrink={0}
                            />
                            <SimpleGrid columns={2} spacing={3} flex="1">
                                <Field label="Amount" value={formatCurrency(amount)} />
                                <Field label="Purpose" value={purpose} />
                                <Field label="Escrow type" value={escrowType} />
                                <Field label="Ownership type" value={ownershipType} />
                                <Field label="Payout status" value={payoutStatus} />
                                <Field label="Release method" value={releaseMethod} />
                                <Field label="Created" value={formatDate(createdAt)} />
                                <Field label="Last updated" value={formatDate(updatedAt)} />
                            </SimpleGrid>
                        </HStack>

                        <Divider />

                        <Accordion allowMultiple defaultIndex={[0, 1]}>

                            {/* Parties */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Parties
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <VStack align="stretch" spacing={3}>
                                        <SectionCard>
                                            <Text fontSize="xs" color="brand.gray.600" mb={1}>Tenant</Text>
                                            <Text fontSize="sm" fontWeight="600">{personLabel(tenant)}</Text>
                                            {isPopulated(tenant) && (
                                                <Text fontSize="xs" color="brand.gray.600">
                                                    {tenant.email || ''} {tenant.phone ? `• ${tenant.phone}` : ''}
                                                </Text>
                                            )}
                                        </SectionCard>

                                        <SectionCard>
                                            <Text fontSize="xs" color="brand.gray.600" mb={1}>Landlord (platform user)</Text>
                                            <Text fontSize="sm" fontWeight="600">{personLabel(landlord)}</Text>
                                            {isPopulated(landlord) && (
                                                <Text fontSize="xs" color="brand.gray.600">
                                                    {landlord.email || ''} {landlord.phone ? `• ${landlord.phone}` : ''}
                                                </Text>
                                            )}
                                        </SectionCard>

                                        {actualLandlord && (
                                            <SectionCard>
                                                <Text fontSize="xs" color="brand.gray.600" mb={2}>Actual landlord / payout details</Text>
                                                <SimpleGrid columns={2} spacing={2}>
                                                    <Field label="Full name" value={actualLandlord.fullName} />
                                                    <Field label="Phone" value={actualLandlord.phone} />
                                                    <Field label="Email" value={actualLandlord.email} />
                                                    <Field label="Bank name" value={actualLandlord.bankName} />
                                                    <Field label="Account name" value={actualLandlord.accountName} />
                                                    <Field label="Account number" value={actualLandlord.accountNumber} />
                                                </SimpleGrid>
                                            </SectionCard>
                                        )}

                                        {property && (
                                            <SectionCard>
                                                <Text fontSize="xs" color="brand.gray.600" mb={1}>Property</Text>
                                                <Text fontSize="sm" fontWeight="600">
                                                    {typeof property === 'string' ? property : (property.title || property._id)}
                                                </Text>
                                            </SectionCard>
                                        )}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Financials */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Financials
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <VStack align="stretch" spacing={3}>
                                        {rentSnapshot && (
                                            <SectionCard>
                                                <Text fontSize="xs" color="brand.gray.600" mb={2}>Rent snapshot</Text>
                                                <SimpleGrid columns={2} spacing={2}>
                                                    <Field label="Rent amount" value={formatCurrency(rentSnapshot.rentAmount)} />
                                                    <Field label="Caution deposit" value={formatCurrency(rentSnapshot.cautionDeposit)} />
                                                    <Field label="Service charge" value={formatCurrency(rentSnapshot.serviceCharge)} />
                                                    <Field label="Service fee" value={formatCurrency(rentSnapshot.serviceFee)} />
                                                </SimpleGrid>
                                            </SectionCard>
                                        )}

                                        {payoutBreakdown && (
                                            <SectionCard>
                                                <Text fontSize="xs" color="brand.gray.600" mb={2}>Payout breakdown</Text>
                                                <SimpleGrid columns={2} spacing={2}>
                                                    <Field label="Rent amount" value={formatCurrency(payoutBreakdown.rentAmount)} />
                                                    <Field label="Caution deposit" value={formatCurrency(payoutBreakdown.cautionDeposit)} />
                                                    <Field label="Service charge" value={formatCurrency(payoutBreakdown.serviceCharge)} />
                                                    <Field label="Service fee" value={formatCurrency(payoutBreakdown.serviceFee)} />
                                                    <Field label="Platform fee" value={formatCurrency(payoutBreakdown.platformFee)} />
                                                    <Field label="Platform fee %" value={payoutBreakdown.platformFeePercentage != null ? `${payoutBreakdown.platformFeePercentage}%` : null} />
                                                    <Field label="Agent commission" value={formatCurrency(payoutBreakdown.agentCommission)} />
                                                    <Field label="Agent commission %" value={payoutBreakdown.agentCommissionPercentage != null ? `${payoutBreakdown.agentCommissionPercentage}%` : null} />
                                                    <Field label="Referral bonus" value={formatCurrency(payoutBreakdown.referalBonus)} />
                                                    <Field label="Landlord receives" value={formatCurrency(payoutBreakdown.landlordReceives)} />
                                                    <Field label="Total paid" value={formatCurrency(payoutBreakdown.totalPaid)} />
                                                </SimpleGrid>
                                            </SectionCard>
                                        )}

                                        <SectionCard>
                                            <Text fontSize="xs" color="brand.gray.600" mb={2}>Release info</Text>
                                            <SimpleGrid columns={2} spacing={2}>
                                                <Field label="Released amount" value={formatCurrency(releasedAmount)} />
                                                <Field label="Released at" value={formatDate(releasedAt)} />
                                                <Field label="Release attempts" value={releaseAttempts} />
                                                <Field label="Last attempt" value={formatDate(releaseAttemptedAt)} />
                                                <Field label="Release code generated" value={releaseCodeGenerated ? 'Yes' : 'No'} />
                                                <Field label="Transfer OTP verified" value={formatDate(transferOtpVerifiedAt)} />
                                                <Field label="Failure reason" value={releaseFailureReason} />
                                                <Field label="Refunded at" value={formatDate(refundedAt)} />
                                            </SimpleGrid>
                                        </SectionCard>

                                        {walletTransaction && (
                                            <Field
                                                label="Wallet transaction"
                                                value={typeof walletTransaction === 'string' ? walletTransaction : walletTransaction._id}
                                            />
                                        )}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Transfers */}
                            {transfers && transfers.length > 0 && (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                                Transfers ({transfers.length})
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel>
                                        <VStack align="stretch" spacing={3}>
                                            {transfers.map((t, idx) => (
                                                <SectionCard key={t.id || idx}>
                                                    <HStack justify="space-between" mb={2}>
                                                        <Text fontSize="sm" fontWeight="600" textTransform="capitalize">
                                                            {t.recipientType?.replace(/_/g, ' ') || 'Transfer'}
                                                        </Text>
                                                        <Badge colorScheme={statusColorScheme(t.status)}>{t.status}</Badge>
                                                    </HStack>
                                                    <SimpleGrid columns={2} spacing={2}>
                                                        <Field label="Recipient" value={t.recipientName || t.accountName} />
                                                        <Field label="Amount" value={formatCurrency(t.amount)} />
                                                        <Field label="Bank / account" value={t.accountNumber ? `${t.accountNumber} (${t.bankCode || ''})` : null} />
                                                        <Field label="Fee" value={t.fee != null ? formatCurrency(t.fee) : null} />
                                                        <Field label="Reference" value={t.reference} />
                                                        <Field label="Transfer code" value={t.transferCode} />
                                                        <Field label="Reason" value={t.reason} />
                                                        <Field label="Failure reason" value={t.failureReason} />
                                                        <Field label="Initiated" value={formatDate(t.initiatedAt)} />
                                                        <Field label="Completed" value={formatDate(t.completedAt)} />
                                                    </SimpleGrid>
                                                </SectionCard>
                                            ))}
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            )}

                            {/* Refund */}
                            {refund && refund.requested && (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                                Refund
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel>
                                        <SectionCard>
                                            <SimpleGrid columns={2} spacing={2}>
                                                <Field label="Status" value={refund.status} />
                                                <Field label="Requested by" value={personLabel(refund.requestedBy)} />
                                                <Field label="Requested at" value={formatDate(refund.requestedAt)} />
                                                <Field label="Reviewed by" value={personLabel(refund.reviewedBy)} />
                                                <Field label="Reviewed at" value={formatDate(refund.reviewedAt)} />
                                                <Field label="Rejection reason" value={refund.rejectionReason} />
                                            </SimpleGrid>
                                            {refund.reason && (
                                                <Box mt={2}>
                                                    <Text fontSize="xs" color="brand.gray.600">Reason</Text>
                                                    <Text fontSize="sm">{refund.reason}</Text>
                                                </Box>
                                            )}
                                        </SectionCard>
                                    </AccordionPanel>
                                </AccordionItem>
                            )}

                            {/* Dispute */}
                            {dispute && dispute.opened && (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                                Dispute
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel>
                                        <SectionCard>
                                            <SimpleGrid columns={2} spacing={2}>
                                                <Field label="Status" value={dispute.status} />
                                                <Field label="Opened by" value={personLabel(dispute.openedBy)} />
                                                <Field label="Opened at" value={formatDate(dispute.openedAt)} />
                                                <Field label="Resolution" value={dispute.resolution} />
                                                <Field label="Resolved by" value={personLabel(dispute.resolvedBy)} />
                                                <Field label="Resolved at" value={formatDate(dispute.resolvedAt)} />
                                            </SimpleGrid>
                                            {dispute.reason && (
                                                <Box mt={2}>
                                                    <Text fontSize="xs" color="brand.gray.600">Reason</Text>
                                                    <Text fontSize="sm">{dispute.reason}</Text>
                                                </Box>
                                            )}
                                            {dispute.resolutionReason && (
                                                <Box mt={2}>
                                                    <Text fontSize="xs" color="brand.gray.600">Resolution notes</Text>
                                                    <Text fontSize="sm">{dispute.resolutionReason}</Text>
                                                </Box>
                                            )}
                                        </SectionCard>
                                    </AccordionPanel>
                                </AccordionItem>
                            )}

                            {/* Handover / inspection / reviews */}
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                            Handover, inspection & reviews
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel>
                                    <SectionCard>
                                        <SimpleGrid columns={2} spacing={2}>
                                            <Field label="Handover requested" value={formatDate(handoverRequestedAt)} />
                                            <Field label="Landlord confirmed handover" value={landlordConfirmedHandover ? 'Yes' : 'No'} />
                                            <Field label="Landlord confirmed at" value={formatDate(landlordConfirmedAt)} />
                                            <Field label="Tenant confirmed inspection" value={tenantConfirmedInspection ? 'Yes' : 'No'} />
                                            <Field label="Tenant confirmed at" value={formatDate(tenantConfirmedAt)} />
                                            <Field label="Review submitted" value={reviewSubmitted ? 'Yes' : 'No'} />
                                            <Field label="Workflow version" value={workflowVersion} />
                                        </SimpleGrid>
                                        {landlordReview?.review && (
                                            <Box mt={3}>
                                                <Text fontSize="xs" color="brand.gray.600">Landlord review {landlordReview.rating ? `(${landlordReview.rating}★)` : ''}</Text>
                                                <Text fontSize="sm">{landlordReview.review}</Text>
                                            </Box>
                                        )}
                                        {appReview?.review && (
                                            <Box mt={3}>
                                                <Text fontSize="xs" color="brand.gray.600">App review {appReview.rating ? `(${appReview.rating}★)` : ''}</Text>
                                                <Text fontSize="sm">{appReview.review}</Text>
                                            </Box>
                                        )}
                                    </SectionCard>
                                </AccordionPanel>
                            </AccordionItem>

                            {/* Timeline */}
                            {timeline && timeline.length > 0 && (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left" fontWeight="600" fontSize="sm">
                                                Timeline ({timeline.length})
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel>
                                        <VStack align="stretch" spacing={2}>
                                            {[...timeline]
                                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                .map((event, idx) => (
                                                    <HStack key={idx} justify="space-between" py={2} borderBottomWidth={idx === timeline.length - 1 ? 0 : '1px'} borderColor="gray.100" align="start">
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" fontWeight="600" textTransform="capitalize">
                                                                {event.action?.replace(/_/g, ' ')}
                                                            </Text>
                                                            {event.actor && (
                                                                <Text fontSize="xs" color="brand.gray.600">By {personLabel(event.actor)}</Text>
                                                            )}
                                                        </VStack>
                                                        <Text fontSize="xs" color="brand.gray.600" flexShrink={0}>{formatDate(event.createdAt)}</Text>
                                                    </HStack>
                                                ))}
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            )}
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
