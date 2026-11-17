import { useEffect, useRef, useState } from "react";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Button,
    Container,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    Icon,
    Image,
    Link,
    SimpleGrid,
    Text,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    Check,
    ChevronRight,
    CreditCard,
    Download,
    Fingerprint,
    Home,
    KeyRound,
    LockKeyhole,
    MapPin,
    Menu,
    ReceiptText,
    Search,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Users,
    WalletCards,
    X,
} from "lucide-react";
import logo from '../../assets/logo.png';

const GREEN = "#0B5345";
const INK = "#142F29";
const SLATE = "#5A6B67";
const BORDER = "#DFE7E3";
const SOFT = "#F7F9F8";

function ScrollReveal({ children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const revealRef = useRef(null);

    useEffect(() => {
        const element = revealRef.current;
        if (!element) return undefined;

        const shouldReduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        setPrefersReducedMotion(shouldReduceMotion);
        if (shouldReduceMotion || !("IntersectionObserver" in window)) {
            setIsVisible(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element);
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <Box
            ref={revealRef}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(36px)",
                transition: prefersReducedMotion
                    ? "none"
                    : "opacity 700ms ease-out, transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
        >
            {children}
        </Box>
    );
}

const navigation = [
    { label: "Features", href: "#features" },
    { label: "Safety", href: "#safety" },
    { label: "About", href: "#about" },
    { label: "Download", href: "#download" },
    { label: "FAQ", href: "#faq" },
];

const features = [
    {
        icon: Search,
        number: "01",
        title: "Verified discovery",
        text: "Explore real homes with reviewed listings, trusted owners, and accurate details.",
    },
    {
        icon: Users,
        number: "02",
        title: "Smarter verification",
        text: "Build trusted rental relationships with streamlined tenant and landlord checks.",
    },
    {
        icon: WalletCards,
        number: "03",
        title: "Wallet payments",
        text: "Fund, track, and complete rent payments from one secure digital wallet.",
    },
    {
        icon: ReceiptText,
        number: "04",
        title: "Clear records",
        text: "Keep payment history, rent status, and property activity organised automatically.",
    },
];

const audienceCards = [
    {
        eyebrow: "PROPERTY OWNERS",
        title: "For Landlords & Managers",
        description:
            "Turn property administration into one clear, dependable workflow.",
        bullets: [
            "Verify tenant profiles automatically",
            "Collect rent instantly via wallet tracking",
            "Zero listing maintenance stress",
        ],
        button: "Secure Landlord Access",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdmmOxjur_21B5qCNL-ChsftLZU4tmFy3j8Dts10f2uhgvbUw/viewform?usp=header",
        icon: KeyRound,
        color: GREEN,
        pale: "#EAF7F2",
    },
    {
        eyebrow: "HOME SEEKERS",
        title: "For Smart Tenants",
        description:
            "Find a real home and manage every payment with complete confidence.",
        bullets: [
            "Browse verified, scam-free properties",
            "Fund your secure in-app wallet",
            "Pay rent seamlessly with split flexibility",
        ],
        button: "Join Tenant Waitlist",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSeHYcdCfxMI006B0p4AVSu-VK8XX1l8C7P8fS6QIFY5ICMAIg/viewform?usp=header",
        icon: Sparkles,
        color: GREEN,
        pale: "#EDF3FF",
    },
];

const faqs = [
    {
        question: "What is RentGidi?",
        answer:
            "RentGidi is a PropTech marketplace for Nigeria that connects verified tenants with trusted landlords and property managers. It combines property discovery, tenant verification, rent collection, and wallet-powered payments in one experience.",
    },
    {
        question: "How does RentGidi verify properties and users?",
        answer:
            "Our verification workflow reviews identity information, ownership or management documentation, listing details, and relevant property records before a verified status is issued.",
    },
    {
        question: "Is the RentGidi wallet safe?",
        answer:
            "RentGidi is being built with bank-grade controls and payment infrastructure connected through CBN-licensed payment switching partners. Sensitive payment operations are protected with layered security and transaction monitoring.",
    },
    {
        question: "When will RentGidi launch?",
        answer:
            "We are currently onboarding early landlords, property managers, and tenants in phases. Join the appropriate waitlist to receive launch updates and priority access.",
    },
    {
        question: "Will RentGidi be available outside Lagos?",
        answer:
            "Yes. Lagos is our first launch market, with expansion planned for Abuja, Port Harcourt, and other major Nigerian cities as verified inventory grows.",
    },
];

function SignupButton({
    buttonLabel,
    color = GREEN,
    compact = false,
    externalUrl,
    onClick,
}) {
    const handleClick = () => {
        if (externalUrl) {
            window.open(externalUrl, "_blank", "noopener,noreferrer");
            return;
        }
        onClick?.();
    };

    return (
        <Box
            display="flex"
            flexDirection={compact ? "column" : { base: "column", sm: "row" }}
            gap={3}
            maxW={compact ? "100%" : "600px"}
        >
            <Button
                type="button"
                onClick={handleClick}
                h="56px"
                px={6}
                w={compact ? "full" : "auto"}
                flexShrink={0}
                bg={color}
                color="white"
                borderRadius="14px"
                fontSize="sm"
                rightIcon={<Icon as={ArrowRight} boxSize={4} />}
                boxShadow={`0 12px 24px -12px ${color}BF`}
                _hover={{ bg: color, filter: "brightness(.9)", transform: "translateY(-2px)" }}
            >
                {buttonLabel}
            </Button>
        </Box>
    );
}

function DashboardMockup() {
    return (
        <Box position="relative" mx="auto" w="full" maxW="590px">
            <Box
                position="absolute"
                left="-24px"
                top="80px"
                w="190px"
                h="190px"
                borderRadius="full"
                bg="#C8EADF"
                opacity=".7"
                filter="blur(55px)"
            />
            <Box
                position="relative"
                p={3}
                bg="#F7FAF9"
                borderWidth="1px"
                borderColor="whiteAlpha.800"
                borderRadius="32px"
                boxShadow="0 35px 90px -38px rgba(7,50,43,.42)"
            >
                <Box overflow="hidden" bg="white" borderWidth="1px" borderColor="#DCE6E2" borderRadius="24px">
                    <Flex h="64px" px={5} align="center" justify="space-between" borderBottomWidth="1px" borderColor="#E8EEEB">
                        <HStack spacing={3}>
                            <Flex w={9} h={9} align="center" justify="center" borderRadius="12px" bg={GREEN} color="white">
                                <Icon as={Building2} boxSize={4} />
                            </Flex>
                            <Box>
                                <Text fontSize="13px" fontWeight="800" color="#15342D">RentGidi</Text>
                                <Text fontSize="10px" color={SLATE}>Property hub</Text>
                            </Box>
                        </HStack>
                        <HStack>
                            <Badge display={{ base: "none", sm: "flex" }} alignItems="center" gap={2} px={3} py={1.5} borderRadius="full" bg="#EDF7F3" color={GREEN} fontSize="9px">
                                <Box w="6px" h="6px" borderRadius="full" bg="#23A87D" />
                                Wallet active
                            </Badge>
                            <Flex w={8} h={8} align="center" justify="center" borderRadius="full" bg="#183F35" color="white" fontSize="10px" fontWeight="800">AO</Flex>
                        </HStack>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} p={4}>
                        <Flex direction="column" justify="space-between" minH="220px" p={5} borderRadius="22px" bg={GREEN} color="white" boxShadow="0 20px 38px -24px rgba(11,83,69,.8)">
                            <Flex justify="space-between">
                                <Flex w={9} h={9} align="center" justify="center" borderRadius="12px" bg="whiteAlpha.200">
                                    <Icon as={WalletCards} boxSize={4} />
                                </Flex>
                                <Badge h="fit-content" px={2.5} py={1} borderRadius="full" bg="#C6F1DD" color="#075342" fontSize="9px">SECURED</Badge>
                            </Flex>
                            <Box>
                                <Text fontSize="11px" color="whiteAlpha.600">Wallet balance</Text>
                                <Text mt={1} fontFamily="mono" fontSize="26px" fontWeight="600" letterSpacing="-.04em">₦250,000</Text>
                                <Flex mt={5} pt={4} justify="space-between" borderTopWidth="1px" borderColor="whiteAlpha.200" fontSize="10px">
                                    <Text color="whiteAlpha.600">RG •••• 2048</Text>
                                    <Text fontWeight="800">Fund wallet</Text>
                                </Flex>
                            </Box>
                        </Flex>

                        <Box p={3} borderWidth="1px" borderColor="#E2E9E6" borderRadius="22px">
                            <Box position="relative" h="130px" overflow="hidden" borderRadius="16px" bg="#DBE7E2">
                                <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=450&fit=crop&auto=format" alt="Modern verified rental home in Lagos" w="full" h="full" objectFit="cover" />
                                <Badge position="absolute" left={3} top={3} display="flex" alignItems="center" gap={1} px={2.5} py={1} borderRadius="full" bg="whiteAlpha.900" color={GREEN} fontSize="9px">
                                    <Icon as={BadgeCheck} boxSize={3} /> VERIFIED
                                </Badge>
                            </Box>
                            <Flex px={1} pt={3} justify="space-between" gap={3}>
                                <Box>
                                    <Text fontSize="13px" fontWeight="800" color="#17372F">2-Bedroom Terrace</Text>
                                    <HStack mt={1} spacing={1} color={SLATE}>
                                        <Icon as={MapPin} boxSize={3} />
                                        <Text fontSize="10px">Lekki Phase 1, Lagos</Text>
                                    </HStack>
                                </Box>
                                <Text whiteSpace="nowrap" fontSize="12px" fontWeight="800" color={GREEN}>
                                    ₦3.2m<Text as="span" fontWeight="400" color={SLATE}>/yr</Text>
                                </Text>
                            </Flex>
                        </Box>
                    </SimpleGrid>

                    <SimpleGrid columns={3} spacing={2} px={4} pb={4}>
                        {[["Rent due", "12 Apr"], ["Properties", "04"], ["Transactions", "18"]].map(([label, value]) => (
                            <Box key={label} px={3} py={3.5} borderRadius="16px" bg="#F5F8F7">
                                <Text fontSize="9px" color={SLATE}>{label}</Text>
                                <Text mt={1} fontSize="xs" fontWeight="800" color="#193A32">{value}</Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            </Box>
        </Box>
    );
}

export function LandingPage({ user }) {
    const { isOpen, onToggle, onClose } = useDisclosure();

    const scrollToWaitlist = () => {
        document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <Box minH="100vh" overflow="hidden" bg="white" color="#1A1F1D" sx={{ "::selection": { bg: "#BDEBD9", color: "#073F34" } }}>
            <Box as="header" position="sticky" top={0} zIndex={50} bg="rgba(255,255,255,.92)" borderBottomWidth="1px" borderColor="#E6ECE9" backdropFilter="blur(16px)">
                <Container maxW="1280px" px={{ base: 5, lg: 10 }}>
                    <Flex h="82px" align="center" justify="space-between" gap={8}>
                        <Link href="#top" display="flex" alignItems="center" gap={2.5} color="#103D33" fontSize="22px" fontWeight="800" letterSpacing="-.045em" _hover={{ textDecoration: "none" }}>
                            {/* <Flex w={9} h={9} align="center" justify="center" borderRadius="12px" bg={GREEN} color="white">
                                <Icon as={Building2} boxSize="18px" />
                            </Flex>
                            RentGidi */}
                            <Image src={logo} alt="RentGidi Logo" w={{ base: "60px", sm: "80px", md: "150px" }} />
                        </Link>

                        <HStack display={{ base: "none", lg: "flex" }} flex={1} justify="center" spacing={1}>
                            {navigation.map((item) => (
                                <Link key={item.label} href={item.href} px={3.5} py={2} borderRadius="full" color="#4E625C" fontSize="13px" fontWeight="600" _hover={{ bg: "#F2F7F5", color: GREEN, textDecoration: "none" }}>
                                    {item.label}
                                </Link>
                            ))}
                        </HStack>

                        <HStack>
                            <Button
                                display={{ base: "none", sm: "inline-flex" }}
                                h="44px"
                                px={5}
                                bg={GREEN}
                                color="white"
                                borderRadius="full"
                                fontSize="13px"
                                rightIcon={<Icon as={ChevronRight} boxSize={4} />}
                                as="a"
                                href={user ? "/dashboard" : "/login"}
                                _hover={{ bg: "#3c8d7b", transform: "translateY(-2px)" }}
                            >
                                Get Started
                            </Button>
                            <Button display={{ base: "inline-flex", lg: "none" }} variant="ghost" minW="42px" h="42px" p={0} aria-label={isOpen ? "Close navigation" : "Open navigation"} onClick={onToggle}>
                                <Icon as={isOpen ? X : Menu} boxSize={5} />
                            </Button>
                        </HStack>
                    </Flex>
                </Container>
            </Box>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
                <DrawerOverlay />
                <DrawerContent display={{ lg: "none" }} bg="white">
                    <DrawerCloseButton aria-label="Close navigation" />
                    <DrawerHeader borderBottomWidth="1px" borderColor="#E6ECE9" color={GREEN}>
                        RentGidi
                    </DrawerHeader>
                    <DrawerBody pt={5}>
                        <VStack align="stretch" spacing={2}>
                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    px={4}
                                    py={3}
                                    borderRadius="12px"
                                    color="#4E625C"
                                    fontWeight="700"
                                    onClick={onClose}
                                    _hover={{ bg: SOFT, color: GREEN, textDecoration: "none" }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Button
                                as="a"
                                href={user ? "/dashboard" : "/login"}
                                mt={3}
                                bg={GREEN}
                                color="white"
                                borderRadius="full"
                                onClick={onClose}
                                _hover={{ bg: "#3c8d7b" }}
                            >
                                Get Started
                            </Button>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Box as="section" id="top" bg="white">
                <ScrollReveal>
                    <Container maxW="1280px" px={{ base: 5, lg: 10 }} py={{ base: 16, lg: 24 }}>
                        <Grid minH={{ lg: "620px" }} alignItems="center" templateColumns={{ base: "1fr", lg: ".95fr 1.05fr" }} gap={{ base: 14, lg: 16 }}>
                            <GridItem>
                                <HStack display="inline-flex" mb={6} px={3.5} py={2} borderWidth="1px" borderColor="#CFE2DB" borderRadius="full" bg="#F4FAF7" color={GREEN} fontSize="11px" fontWeight="800" letterSpacing=".1em">
                                    <Box w="6px" h="6px" borderRadius="full" bg="#1FA77A" boxShadow="0 0 0 4px rgba(31,167,122,.12)" />
                                    <Text>BUILT FOR HOW NIGERIA RENTS</Text>
                                </HStack>
                                <Heading as="h1" maxW="650px" color="#112D27" fontSize={{ base: "42px", sm: "54px", xl: "62px" }} lineHeight="1.03" letterSpacing="-.055em">
                                    Rent & manage properties in Nigeria—<Text as="span" color={GREEN}>seamlessly.</Text>
                                </Heading>
                                <Text mt={7} maxW="620px" color={SLATE} fontSize="17px" lineHeight="2rem">
                                    RentGidi is a smart PropTech marketplace connecting trusted landlords with verified tenants. List properties, find your next home, and automate rent payments securely with our built-in digital wallet infrastructure.
                                </Text>
                                <Box mt={9}><SignupButton buttonLabel="Get Early Access" onClick={scrollToWaitlist} /></Box>
                                <Flex mt={5} wrap="wrap" gap={{ base: 3, sm: 6 }} color="#657771" fontSize="12px" fontWeight="600">
                                    <HStack><Icon as={ShieldCheck} boxSize={4} color={GREEN} /><Text>Verified profiles</Text></HStack>
                                    <HStack><Icon as={LockKeyhole} boxSize={4} color={GREEN} /><Text>Secure wallet</Text></HStack>
                                    <Text>No spam. Early access only.</Text>
                                </Flex>
                            </GridItem>
                            <GridItem><DashboardMockup /></GridItem>
                        </Grid>
                    </Container>
                </ScrollReveal>
            </Box>

            <Box as="section" id="features" scrollMarginTop="82px" bg={SOFT} borderY="1px" borderColor="#E9EFEC" py={{ base: 20, lg: 28 }}>
                <ScrollReveal>
                    <Container maxW="1280px" px={{ base: 5, lg: 10 }}>
                        <Box maxW="720px" mx="auto" textAlign="center">
                            <Text color={GREEN} fontSize="11px" fontWeight="800" letterSpacing=".16em">ONE RENTAL OPERATING SYSTEM</Text>
                            <Heading mt={4} color={INK} fontSize={{ base: "36px", sm: "48px" }} lineHeight="1.08" letterSpacing="-.045em">Everything you need to rent with confidence.</Heading>
                            <Text mt={5} mx="auto" maxW="600px" color={SLATE} lineHeight="1.75">From the first property search to the final rent receipt, RentGidi keeps every step verified, visible, and easy to manage.</Text>
                        </Box>
                        <SimpleGrid mt={14} columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
                            {features.map(({ icon, number, title, text }) => (
                                <Box key={title} p={7} bg="white" borderWidth="1px" borderColor={BORDER} borderRadius="24px" boxShadow="0 20px 50px -42px rgba(8,54,45,.4)" transition=".25s ease" _hover={{ transform: "translateY(-4px)", boxShadow: "0 24px 55px -38px rgba(8,54,45,.35)" }}>
                                    <Flex justify="space-between" align="center">
                                        <Flex w={11} h={11} align="center" justify="center" borderRadius="16px" bg="#EAF7F2" color={GREEN}><Icon as={icon} boxSize={5} /></Flex>
                                        <Text fontFamily="mono" color="#91A09B" fontSize="10px">{number}</Text>
                                    </Flex>
                                    <Heading as="h3" mt={7} color="#17352E" fontSize="20px" letterSpacing="-.03em">{title}</Heading>
                                    <Text mt={3} color={SLATE} fontSize="14px" lineHeight="1.5rem">{text}</Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Container>
                </ScrollReveal>
            </Box>

            <Box as="section" id="about" scrollMarginTop="82px" py={{ base: 20, lg: 28 }}>
                <ScrollReveal>
                    <Container maxW="1280px" px={{ base: 5, lg: 10 }}>
                        <Grid alignItems="center" templateColumns={{ base: "1fr", lg: ".9fr 1.1fr" }} gap={{ base: 12, lg: 16 }}>
                            <Box position="relative" minH="440px" overflow="hidden" p={{ base: 8, sm: 10 }} borderRadius="32px" bg={GREEN} color="white">
                                <Box position="absolute" right="-80px" top="-80px" w="256px" h="256px" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="full" />
                                <Flex position="relative" minH="360px" direction="column" justify="space-between">
                                    <Flex justify="space-between">
                                        <Badge px={3} py={1.5} borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="full" bg="transparent" color="whiteAlpha.700" fontSize="10px">MADE FOR NIGERIA</Badge>
                                        <Icon as={Home} boxSize={5} color="#77DDB7" />
                                    </Flex>
                                    <Box>
                                        <Heading fontSize={{ base: "60px", sm: "82px" }} lineHeight="1" letterSpacing="-.07em">Better</Heading>
                                        <Heading color="#78D9B6" fontSize={{ base: "60px", sm: "82px" }} lineHeight="1" letterSpacing="-.07em">renting.</Heading>
                                        <HStack mt={8} pt={6} borderTopWidth="1px" borderColor="whiteAlpha.200" color="whiteAlpha.700" fontSize="xs">
                                            <Box w={2} h={2} borderRadius="full" bg="#77DDB7" /><Text>Lagos first. Nigeria next.</Text>
                                        </HStack>
                                    </Box>
                                </Flex>
                            </Box>
                            <Box pl={{ lg: 10 }}>
                                <Text color={GREEN} fontSize="11px" fontWeight="800" letterSpacing=".16em">ABOUT RENTGIDI</Text>
                                <Heading mt={4} color={INK} fontSize={{ base: "36px", sm: "48px" }} lineHeight="1.08" letterSpacing="-.045em">The trust layer for Nigeria&apos;s rental market.</Heading>
                                <Text mt={7} color={SLATE} fontSize="17px" lineHeight="2rem">Renting a home should not feel uncertain. RentGidi brings property discovery, identity verification, secure payments, and clear records into one dependable platform built around the realities of the Nigerian market.</Text>
                                <Text mt={5} color={SLATE} fontSize="17px" lineHeight="2rem">We are creating a marketplace where good landlords find responsible tenants faster, and renters can move forward without the usual fear of scams or hidden surprises.</Text>
                                {/* <Button mt={8} variant="outline" borderColor="#CDDBD6" color={GREEN} borderRadius="full" rightIcon={<Icon as={ArrowRight} boxSize={4} />} onClick={scrollToWaitlist} _hover={{ bg: "#F2F8F5", borderColor: GREEN }}>Be part of the first cohort</Button> */}
                            </Box>
                        </Grid>
                    </Container>
                </ScrollReveal>
            </Box>

            <Box as="section" id="get-started" scrollMarginTop="82px" bg={SOFT} py={{ base: 20, lg: 28 }}>
                <ScrollReveal>
                    <Container maxW="1280px" px={{ base: 5, lg: 10 }}>
                        <Flex mb={12} direction={{ base: "column", lg: "row" }} justify="space-between" align={{ lg: "end" }} gap={6}>
                            <Box>
                                <Text color={GREEN} fontSize="11px" fontWeight="800" letterSpacing=".16em">YOUR SIDE OF THE MARKETPLACE</Text>
                                <Heading mt={4} maxW="650px" color={INK} fontSize={{ base: "36px", sm: "48px" }} lineHeight="1.1" letterSpacing="-.045em">One platform. A better rental experience for everyone.</Heading>
                            </Box>
                            <Text maxW="380px" color={SLATE} fontSize="15px" lineHeight="1.75">Join the priority list that fits you. We&apos;ll tailor your onboarding for a faster start.</Text>
                        </Flex>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            {audienceCards.map((card) => (
                                <Box key={card.title} p={{ base: 7, sm: 10 }} bg="white" borderWidth="1px" borderColor={BORDER} borderRadius="32px" boxShadow="0 25px 65px -45px rgba(8,54,45,.42)" transition=".25s ease" _hover={{ transform: "translateY(-4px)" }}>
                                    <Flex justify="space-between" align="start">
                                        <Flex w={12} h={12} align="center" justify="center" borderRadius="16px" bg={card.pale} color={card.color}><Icon as={card.icon} boxSize={5} /></Flex>
                                        <Text color="#7C8B86" fontSize="10px" fontWeight="800" letterSpacing=".15em">{card.eyebrow}</Text>
                                    </Flex>
                                    <Heading as="h3" mt={8} color="#17352E" fontSize="28px" letterSpacing="-.035em">{card.title}</Heading>
                                    <Text mt={3} maxW="430px" color={SLATE} fontSize="14px" lineHeight="1.5rem">{card.description}</Text>
                                    <VStack as="ul" my={8} align="stretch" spacing={4} listStyleType="none">
                                        {card.bullets.map((bullet) => (
                                            <HStack as="li" key={bullet} color="#304A43" fontSize="14px" fontWeight="700">
                                                <Flex w={6} h={6} flexShrink={0} align="center" justify="center" borderRadius="full" bg={card.pale} color={card.color}><Icon as={Check} boxSize={3.5} /></Flex>
                                                <Text>{bullet}</Text>
                                            </HStack>
                                        ))}
                                    </VStack>
                                    <SignupButton compact buttonLabel={card.button} color={card.color} externalUrl={card.url} />
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Container>
                </ScrollReveal>
            </Box>

            <Box as="section" id="safety" scrollMarginTop="82px" px={{ base: 5, lg: 10 }} py={{ base: 20, lg: 28 }}>
                <ScrollReveal>
                    <Container maxW="1200px" p={0}>
                        <Grid alignItems="center" templateColumns={{ base: "1fr", lg: "1fr auto" }} gap={10} px={{ base: 7, sm: 12, lg: 16 }} py={{ base: 12, lg: 16 }} borderWidth="1px" borderColor="#E2E7E5" borderRadius="32px" bg="#F4F6F5">
                            <Box maxW="710px">
                                <HStack display="inline-flex" mb={5} px={3} py={1.5} bg="white" borderRadius="full" color={GREEN} boxShadow="sm" fontSize="10px" fontWeight="800" letterSpacing=".12em">
                                    <Icon as={ShieldCheck} boxSize={3.5} /><Text>TRUST & COMPLIANCE</Text>
                                </HStack>
                                <Heading color="#15352E" fontSize={{ base: "32px", sm: "42px" }} letterSpacing="-.04em">Bank-Grade Transaction Security</Heading>
                                <Text mt={5} color={SLATE} fontSize="15px" lineHeight="1.75">All in-app wallet balances, protected fund-holding, and rental processing pipelines are powered in direct technical partnership with CBN-licensed payment switching networks.</Text>
                            </Box>
                            <HStack spacing={3}>
                                {[{ icon: Fingerprint, label: "IDENTITY" }, { icon: CreditCard, label: "PAYMENTS" }, { icon: LockKeyhole, label: "SECURITY" }].map(({ icon, label }) => (
                                    <VStack key={label} justify="center" spacing={2} w={{ base: "76px", sm: "96px" }} h={{ base: "96px", sm: "112px" }} bg="white" borderWidth="1px" borderColor={BORDER} borderRadius="20px" color={GREEN} boxShadow="0 12px 30px -22px rgba(9,65,53,.4)">
                                        <Icon as={icon} boxSize={5} /><Text color="#71817C" fontSize="8px" fontWeight="800" letterSpacing=".12em">{label}</Text>
                                    </VStack>
                                ))}
                            </HStack>
                        </Grid>
                    </Container>
                </ScrollReveal>
            </Box>

            <Box as="section" id="download" scrollMarginTop="82px" bg="#0A3F35" color="white" py={{ base: 20, lg: 28 }}>
                <ScrollReveal>
                    <Container maxW="1200px" px={{ base: 5, lg: 10 }}>
                        <Grid alignItems="center" templateColumns={{ base: "1fr", lg: "1fr .9fr" }} gap={14}>
                            <Box>
                                <Text color="#7ADDB9" fontSize="11px" fontWeight="800" letterSpacing=".16em">RENTGIDI IN YOUR POCKET</Text>
                                <Heading mt={4} maxW="650px" fontSize={{ base: "38px", sm: "54px" }} lineHeight="1.06" letterSpacing="-.05em">Your next home, wallet, and rent history—always within reach.</Heading>
                                <Text mt={6} maxW="600px" color="whiteAlpha.700" fontSize="16px" lineHeight="2rem">The RentGidi mobile app is coming soon to iOS and Android. Join the early access list and be first to know when downloads open.</Text>
                                <HStack mt={8} spacing={3} flexWrap="wrap">
                                    {["App Store", "Google Play"].map((store) => (
                                        <Button key={store} h="56px" px={5} justifyContent="start" variant="outline" borderColor="whiteAlpha.300" borderRadius="16px" bg="whiteAlpha.100" color="white" leftIcon={<Icon as={Download} boxSize={5} color="#7ADDB9" />} onClick={scrollToWaitlist} _hover={{ bg: "whiteAlpha.200", transform: "translateY(-2px)" }}>
                                            <Box textAlign="left"><Text fontSize="9px" color="whiteAlpha.600" letterSpacing=".12em">COMING SOON ON</Text><Text fontSize="sm">{store}</Text></Box>
                                        </Button>
                                    ))}
                                </HStack>
                            </Box>
                            <Box position="relative" mx="auto" w="full" maxW="430px">
                                <Box mx="auto" w="275px" p={2} border="7px solid #17352F" borderRadius="42px" bg="white" color="#17352F" boxShadow="0 38px 80px -30px rgba(0,0,0,.7)">
                                    <Box overflow="hidden" borderRadius="31px" bg="#F5F8F7">
                                        <Box mx="auto" mt={2} w="80px" h="20px" borderRadius="full" bg="#17352F" />
                                        <Box px={4} pb={5} pt={5}>
                                            <Flex justify="space-between" align="center">
                                                <Box><Text color="#71817C" fontSize="9px">Good morning</Text><Text fontSize="xs" fontWeight="800">Adaobi</Text></Box>
                                                <Flex w={8} h={8} align="center" justify="center" borderRadius="full" bg={GREEN} color="white" fontSize="9px" fontWeight="800">AO</Flex>
                                            </Flex>
                                            <Box mt={5} p={4} borderRadius="20px" bg={GREEN} color="white">
                                                <Flex justify="space-between"><Icon as={WalletCards} boxSize={4} color="#81DCB9" /><Text fontSize="8px" color="whiteAlpha.600">RG WALLET</Text></Flex>
                                                <Text mt={6} fontSize="9px" color="whiteAlpha.600">Available balance</Text>
                                                <Text mt={1} fontFamily="mono" fontSize="xl">₦250,000</Text>
                                            </Box>
                                            <Text mb={3} mt={5} fontSize="10px" fontWeight="800">Recommended homes</Text>
                                            <Box p={2} borderRadius="16px" bg="white" boxShadow="sm">
                                                <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=250&fit=crop&auto=format" alt="Verified modern rental property" h="96px" w="full" objectFit="cover" borderRadius="12px" />
                                                <Box px={1} py={2}><Text fontSize="10px" fontWeight="800">2-Bedroom Terrace</Text><Text mt={1} color="#71817C" fontSize="8px">Lekki Phase 1, Lagos</Text></Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Flex display={{ base: "none", sm: "flex" }} position="absolute" right={4} top="50%" p={3} borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="16px" bg="whiteAlpha.100"><Icon as={Smartphone} boxSize={5} color="#7ADDB9" /></Flex>
                            </Box>
                        </Grid>
                    </Container>
                </ScrollReveal>
            </Box>

            <Box as="section" id="faq" scrollMarginTop="82px" py={{ base: 20, lg: 28 }}>
                <ScrollReveal>
                    <Container maxW="1100px" px={{ base: 5, lg: 10 }}>
                        <Grid templateColumns={{ base: "1fr", lg: ".65fr 1.35fr" }} gap={12}>
                            <Box>
                                <Text color={GREEN} fontSize="11px" fontWeight="800" letterSpacing=".16em">FREQUENTLY ASKED</Text>
                                <Heading mt={4} color={INK} fontSize={{ base: "36px", sm: "46px" }} lineHeight="1.08" letterSpacing="-.045em">Questions, answered clearly.</Heading>
                                <Text mt={5} color={SLATE} fontSize="15px" lineHeight="1.75">Everything you need to know before joining the RentGidi early access community.</Text>
                            </Box>
                            <Accordion allowToggle defaultIndex={[0]}>
                                {faqs.map((faq) => (
                                    <AccordionItem key={faq.question} borderColor={BORDER}>
                                        <AccordionButton px={0} py={6} _hover={{ bg: "transparent" }}>
                                            <Box as="span" flex="1" textAlign="left" color="#1B3932" fontFamily="heading" fontSize="17px" fontWeight="800">{faq.question}</Box>
                                            <AccordionIcon color={GREEN} boxSize={6} />
                                        </AccordionButton>
                                        <AccordionPanel px={0} pb={6} pr={12} color={SLATE} fontSize="15px" lineHeight="1.75">{faq.answer}</AccordionPanel>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </Grid>
                    </Container>
                </ScrollReveal>
            </Box>

            <Box as="footer" bg="#082F28">
                <ScrollReveal>
                    <Container maxW="1280px" px={{ base: 5, lg: 10 }} py={8}>
                        <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ sm: "center" }} gap={5} color="whiteAlpha.600" fontSize="11px">
                            <Text maxW="820px" lineHeight="1.25rem">© 2026 RentGidi Limited. All rights reserved. Registered with the Corporate Affairs Commission (CAC), Nigeria.</Text>
                            <HStack color="whiteAlpha.800" fontWeight="800"><Box w="6px" h="6px" borderRadius="full" bg="#5CD2A6" /><Text>Lagos, Nigeria</Text></HStack>
                        </Flex>
                    </Container>
                </ScrollReveal>
            </Box>
        </Box>
    );
}
