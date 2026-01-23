'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    id: string;
    title: string;
    shortTitle: string;
    items: FAQItem[];
}

const faqData: FAQCategory[] = [
    {
        id: 'video',
        title: 'Video Recording & Privacy',
        shortTitle: 'Video & Privacy',
        items: [
            {
                question: 'Who sees the footage?',
                answer: 'Only you via a secure link and authorized QA staff — never third parties.',
            },
            {
                question: 'Why do you videos record cleaning?',
                answer: 'We offer full transparency of what happens in your home. Video recordings serve as proof of service delivered and help ensure quality.',
            },
            {
                question: 'How can I watch the live stream or videos?',
                answer: 'A secure access link to the videos is available in your personal account for up to 7 days. It can also be sent to your designated phone or via e-mail – you can decide if you do not wish to receive these notifications.',
            },
            {
                question: 'Can I request deletion of videos recording sooner than 7 days?',
                answer: 'Yes, just fill out the form in your personal account. Once the videos is deleted no claims as to quality of cleaning can be made.',
            },
            {
                question: 'I feel worried that my home will be filmed during cleaning. Is my private information safe?',
                answer: 'With us you always know that a videos is being made. It is so easy to take pictures or film someone\'s home without the person ever knowing. We make videos of the cleaning so that you know what is actually going on in your home, even when you are not there. We do not share any private information about you or your home with anyone. Videos are stored on a secure server with no access to unauthorized persons for up to 7 days and then deleted.',
            },
        ],
    },
    {
        id: 'pricing',
        title: 'Pricing, Taxes & Legal Protection',
        shortTitle: 'Pricing',
        items: [
            {
                question: 'Why should I hire a company instead of paying privately cheaper in cash?',
                answer: 'Because you are protected. Our services are insured. We are always accountable. We don\'t disappear if anything gets damaged — it is our cost, never yours. Individual cleaners are cheaper until something goes wrong. And with us you can deduct up to 20% of your cleaning expenses from your taxes according to §35a EstG.',
            },
            {
                question: 'Why are your prices higher than what private cleaners charge?',
                answer: 'Private cleaners pay no taxes, have no insurance or liability. We provide trained, vetted staff, insurance coverage, guaranteed appointments and replacements. You are paying for stability and peace of mind — not for luck. You can also save up to 20% of your cleaning services expenses with us according to §35a EstG.',
            },
            {
                question: 'Can I get an invoice for Steuerermäßigung (household tax deduction)?',
                answer: 'Of course. You receive invoice within 48 hours after every cleaning — you can deduct up to 20% of household service costs legally under §35a EStG.',
            },
        ],
    },
    {
        id: 'cleaners',
        title: 'Cleaners, Reliability & Quality',
        shortTitle: 'Quality',
        items: [
            {
                question: 'What happens if my cleaner is sick or can\'t come?',
                answer: 'We immediately dispatch a replacement. No cancellations, no waiting, no lost time. Continuity is guaranteed.',
            },
            {
                question: 'Do I get the same cleaner every time?',
                answer: 'We generally assign a dedicated cleaner for recurring appointments. You build trust, we deliver consistency. If at any time you want to change the cleaner – just contact us at least 48 hours in advance.',
            },
            {
                question: 'We\'ve had cleaners before and quality was inconsistent — how are you different?',
                answer: 'We monitor quality, provide training, perform replacements when needed, and you have a direct contact if standards slip. You\'re not relying on one person — you have an entire dedicated team at your service.',
            },
            {
                question: 'Are your cleaners background-checked?',
                answer: 'Yes — identity, reference, and reliability screening is mandatory before assignment.',
            },
        ],
    },
    {
        id: 'booking',
        title: 'Booking, Contracts & Cancellation',
        shortTitle: 'Booking',
        items: [
            {
                question: 'Do I have to sign a long-term contract?',
                answer: 'No — we offer flexible terms. We recommend clients to choose regular recurring cleanings (every 7-10 days) because it\'s cheaper in the long run.',
            },
            {
                question: 'Can I cancel my appointment anytime?',
                answer: 'Yes — flexibility is part of the service. You can cancel an appointment free of charge no later than 48 hours prior. Cancellations at a later time (unless a proven emergency) will be charged at 50 Euros – we value your trust and time and expect the same in return.',
            },
        ],
    },
    {
        id: 'process',
        title: 'Cleaning Process & Scope',
        shortTitle: 'Process',
        items: [
            {
                question: 'Do you bring cleaning supplies or do I need to provide them?',
                answer: 'We bring everything required — detergents, cloths, tools. You just enjoy a clean home.',
            },
            {
                question: 'How long does an 80 m² apartment normally take to clean?',
                answer: 'On average 3–4 hours depending on condition, pets, and cleaning frequency. Regular clients often require less time each visit. For larger homes we may engage more than one cleaner at the same time.',
            },
            {
                question: 'What cleaning plan should I choose?',
                answer: 'If your home has not been professionally cleaned for more than 1 month we suggest to start with the Heavy-duty clean. After that we recommend to do the Standard cleaning every 7-10 days to maintain your home pristine. Every 2-3 months we suggest additional window, oven cleaning. Simply book a Consultation now.',
            },
        ],
    },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors"
            >
                <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                {isOpen ? (
                    <Minus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                    <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="pb-5 -mx-4 px-4 animate-fadeIn">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const filteredData = useMemo(() => {
        let data = faqData;

        // Filter by category
        if (activeCategory) {
            data = data.filter(cat => cat.id === activeCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.map(category => ({
                ...category,
                items: category.items.filter(
                    item =>
                        item.question.toLowerCase().includes(query) ||
                        item.answer.toLowerCase().includes(query)
                ),
            })).filter(category => category.items.length > 0);
        }

        return data;
    }, [searchQuery, activeCategory]);

    const toggleItem = (categoryId: string, questionIndex: number) => {
        const key = `${categoryId}-${questionIndex}`;
        setOpenItems(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const categories = [
        { id: null, label: 'Alle' },
        ...faqData.map(cat => ({ id: cat.id, label: cat.shortTitle })),
    ];

    return (
        <>
            <Header/>
            <main className="min-h-screen bg-white mt-[80px]">
                {/* Hero */}
                <section className="px-6 pt-12 pb-4 md:pt-20 md:pb-8 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                        FAQs
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Everything you need to know
                    </p>
                </section>

                {/* Search */}
                <section className="px-6 py-4 max-w-4xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                        />
                    </div>
                </section>

                {/* Category Filters */}
                <section className="px-6 py-4 max-w-4xl mx-auto">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id ?? 'all'}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeCategory === cat.id
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* FAQ Content */}
                <section className="px-6 py-8 max-w-4xl mx-auto">
                    {filteredData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Keine Ergebnisse gefunden</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {filteredData.map((category) => (
                                <div key={category.id}>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span>{category.title}</span>
                                    </h2>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        {category.items.map((item, index) => (
                                            <AccordionItem
                                                key={index}
                                                item={item}
                                                isOpen={openItems.has(`${category.id}-${index}`)}
                                                onToggle={() => toggleItem(category.id, index)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </>

    );
}
