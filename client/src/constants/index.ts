import { Icons } from "@/components";

export const perks = [
    {
        icon: Icons.auth,
        title: "Create an Account",
        info: "Sign up for free to start reporting lost items.",
    },
    {
        icon: Icons.customize,
        title: "Report Items",
        info: "Quickly submit details, photos, and contact info for lost items.",
    },
    {
        icon: Icons.launch,
        title: "Connect & Recover",
        info: "Your report goes live for the community—helping items return to their owners.",
    },
];

export const features = [
    {
        icon: Icons.bolt,
        title: "Fast Reporting",
        info: "Submit a lost or found item in under a minute with our simple form.",
    },
    {
        icon: Icons.search,
        title: "Smart Search & Filters",
        info: "Easily browse by category, location, or keywords to find items faster.",
    },
    {
        icon: Icons.bell,
        title: "Real-Time Notifications",
        info: "Get notified when someone makes a claim request to your report.",
    }
];

export const pricingCards = [
    {
        title: "Free Forever",
        description: "All the core features you need to report and recover lost items.",
        price: "Free",
        duration: "",
        highlight: "Includes",
        buttonText: "Get Started",
        features: [
            "Unlimited lost & found reports",
            "Community access",
            "Search & filter tools",
            "Real-time notifications",
            "Open source"
        ]
    },
    {
        title: "Premium (Coming Soon)",
        description: "Extra features for power users and organizations.",
        price: "$5",
        duration: "month",
        highlight: "Includes everything in Free, plus",
        buttonText: "Join Waitlist",
        features: [
            "Priority item matching",
            "Advanced location alerts",
            "Organization & group dashboards",
            "Priority support"
        ]
    },
];

export const bentoCards = [
    {
        title: 'Report in Seconds',
        info: 'Easily log details and upload photos of lost or found items.',
        imgSrc: '/assets/bento-report.svg',
        alt: 'Report lost item form'
    },
    {
        title: 'Smart Item Matching',
        info: 'TraceVault suggests possible matches based on category and description.',
        imgSrc: '/assets/bento-match.svg',
        alt: 'Brilliant matching, for lost items'
    },
    {
        title: 'Community Powered',
        info: 'Connect with people nearby who might have found your lost belongings.',
        imgSrc: '/assets/bento-community.svg',
        alt: 'Community helping each other'
    },
    {
        title: 'Get Notified',
        info: 'Receive instant alerts when someone reports an item that matches yours.',
        imgSrc: '/assets/bento-alert.svg',
        alt: 'Notification system for lost items'
    },
];

