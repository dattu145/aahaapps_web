import { useState, useEffect } from 'react';
import api from '../api';
import PublicCard from '../components/PublicCard';

const Home = () => {
    const [cards, setCards] = useState([]);
    const [settings, setSettings] = useState({ card_radius: '16', card_scroll_speed: '0.8' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cardsRes, settingsRes] = await Promise.all([
                    api.get('/cards'),
                    api.get('/settings')
                ]);
                setCards(cardsRes.data);
                if (settingsRes.data) {
                    setSettings({
                        card_radius: settingsRes.data.card_radius || '16',
                        card_scroll_speed: settingsRes.data.card_scroll_speed || '0.8'
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-white/50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12">


            <div className="flex flex-col gap-12">
                {cards.map((card, index) => (
                    <PublicCard
                        key={card.id}
                        card={card}
                        index={index}
                        borderRadius={parseInt(settings.card_radius) || 16}
                        scrollSpeed={parseFloat(settings.card_scroll_speed) || 0.8}
                    />
                ))}
            </div>

            {cards.length === 0 && (
                <div className="text-center text-gray-400 py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-xl">No content available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default Home;
