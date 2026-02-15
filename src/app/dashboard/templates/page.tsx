'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './templates.css';

const SYSTEM_TEMPLATES = [
    {
        id: 'announce',
        category: 'Ankündigung',
        icon: '📢',
        templates: [
            { title: 'Neues Produkt', content: '🎉 Wir freuen uns, [Produktname] vorzustellen!\n\n[Kurze Beschreibung des Produkts und seiner Vorteile]\n\n✅ [Vorteil 1]\n✅ [Vorteil 2]\n✅ [Vorteil 3]\n\nJetzt mehr erfahren 👉 [Link]\n\n#Neuheit #Innovation #[BranchenHashtag]' },
            { title: 'Firmenupdate', content: '📣 Aufregende Neuigkeiten bei [Firma]!\n\n[Details zum Update]\n\nWas bedeutet das für Sie?\n→ [Vorteil für Kunden]\n\nWir halten Sie auf dem Laufenden! 🚀\n\n#Update #News #[Firmenname]' },
        ],
    },
    {
        id: 'educational',
        category: 'Bildung / Tipps',
        icon: '📚',
        templates: [
            { title: '3 Tipps Post', content: '💡 3 Tipps für [Thema], die Sie sofort umsetzen können:\n\n1️⃣ [Tipp 1]\n→ [Kurze Erklärung]\n\n2️⃣ [Tipp 2]\n→ [Kurze Erklärung]\n\n3️⃣ [Tipp 3]\n→ [Kurze Erklärung]\n\nWelchen Tipp setzen Sie als erstes um? 👇\n\n#Tipps #[Branche] #Wissen' },
            { title: 'Wussten Sie...?', content: '🤔 Wussten Sie, dass...?\n\n[Interessante Statistik oder Fakt]\n\nDas bedeutet für Ihr Unternehmen:\n📌 [Implikation 1]\n📌 [Implikation 2]\n\n➡️ Unsere Lösung: [Kurze Erwähnung]\n\n#DidYouKnow #[Branche] #Wissen' },
        ],
    },
    {
        id: 'behind_scenes',
        category: 'Behind the Scenes',
        icon: '🎬',
        templates: [
            { title: 'Team Vorstellung', content: '👋 Lernen Sie [Name] kennen!\n\n[Name] ist unser/e [Position] und sorgt dafür, dass [Aufgabe].\n\n🎯 Was [Name] an der Arbeit liebt:\n"[Zitat vom Teammitglied]"\n\n🏆 Fun Fact: [Lustiger/interessanter Fakt]\n\n#Team #BehindTheScenes #[Firmenname]' },
            { title: 'Arbeitstag', content: '📸 Ein Blick hinter die Kulissen!\n\nSo sieht ein typischer Tag bei [Firma] aus:\n\n☕ 08:00 – [Aktivität]\n💻 10:00 – [Aktivität]\n🤝 14:00 – [Aktivität]\n🎉 16:00 – [Aktivität]\n\nWas interessiert Sie am meisten? 👇\n\n#BehindTheScenes #TeamLife #[Firmenname]' },
        ],
    },
    {
        id: 'testimonial',
        category: 'Kundenstimmen',
        icon: '⭐',
        templates: [
            { title: 'Kundenbewertung', content: '⭐⭐⭐⭐⭐\n\n"[Kundenzitat über positive Erfahrung]"\n\n— [Kundenname], [Firma/Position]\n\nDanke für das Vertrauen! 🙏\n\nSie möchten ähnliche Ergebnisse?\n➡️ [Call to Action + Link]\n\n#Kundenstimme #Testimonial #Vertrauen' },
            { title: 'Erfolgsgeschichte', content: '📈 Erfolgsgeschichte: [Kundenname]\n\n🔴 Herausforderung:\n[Problem des Kunden]\n\n🟢 Lösung:\n[Wie Sie geholfen haben]\n\n📊 Ergebnis:\n✅ [Messbares Ergebnis 1]\n✅ [Messbares Ergebnis 2]\n\nBereit für Ihre Erfolgsgeschichte? 🚀\n\n#CaseStudy #Erfolg #[Branche]' },
        ],
    },
    {
        id: 'engagement',
        category: 'Engagement',
        icon: '💬',
        templates: [
            { title: 'Umfrage / Frage', content: '🗳️ Ihre Meinung ist gefragt!\n\n[Frage zum Thema]\n\nA) [Option A]\nB) [Option B]\nC) [Option C]\n\nStimmen Sie ab und teilen Sie uns Ihre Gedanken mit! 👇\n\n#Umfrage #IhreMeinung #[Branche]' },
            { title: 'This or That', content: '⚡ This or That – [Thema] Edition!\n\n☕ oder 🍵?\n📱 oder 💻?\n🏠 oder 🏢?\n📧 oder 📞?\n\nTeilt eure Antworten! 👇\n\n#ThisOrThat #Fun #Community' },
        ],
    },
    {
        id: 'product',
        category: 'Produkt / Service',
        icon: '🛍️',
        templates: [
            { title: 'Feature Highlight', content: '✨ Feature Spotlight: [Feature Name]\n\n[Kurze Beschreibung was das Feature macht]\n\n🎯 Perfekt für:\n→ [Anwendungsfall 1]\n→ [Anwendungsfall 2]\n→ [Anwendungsfall 3]\n\n🔗 Jetzt ausprobieren: [Link]\n\n#Feature #Produktnews #[Produktname]' },
        ],
    },
];

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredTemplates = selectedCategory === 'all'
        ? SYSTEM_TEMPLATES
        : SYSTEM_TEMPLATES.filter(cat => cat.id === selectedCategory);

    const useTemplate = (content: string) => {
        // Store in sessionStorage and navigate to creator
        sessionStorage.setItem('template_content', content);
        router.push('/dashboard/creator');
    };

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Vorlagen</h1>
            <p className="page-subtitle">Fertige Post-Templates für jede Gelegenheit</p>

            {/* Category Filter */}
            <div className="template-filters">
                <button
                    className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setSelectedCategory('all')}
                >
                    Alle
                </button>
                {SYSTEM_TEMPLATES.map(cat => (
                    <button
                        key={cat.id}
                        className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.icon} {cat.category}
                    </button>
                ))}
            </div>

            {/* Templates */}
            {filteredTemplates.map(category => (
                <div key={category.id} style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 className="section-title">{category.icon} {category.category}</h2>
                    <div className="templates-grid">
                        {category.templates.map((template, idx) => (
                            <div key={idx} className="glass-card template-card">
                                <div className="template-card-header">
                                    <span className="font-semibold">{template.title}</span>
                                </div>
                                <div className="template-card-body">
                                    <pre className="template-preview">{template.content}</pre>
                                </div>
                                <div className="template-card-footer">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => useTemplate(template.content)}
                                    >
                                        ✨ Verwenden
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => navigator.clipboard.writeText(template.content)}
                                    >
                                        📋 Kopieren
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
