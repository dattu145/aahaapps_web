import { useState, useEffect } from 'react';
import api from '../api';
import PublicCard from '../components/PublicCard';

const Home = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const { data } = await api.get('/cards');
                setCards(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
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
                    <PublicCard key={card.id} card={card} index={index} />
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
