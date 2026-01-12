import { useState, useEffect } from 'react';
import api from '../api';
import CardForm from '../components/CardForm';
import { Plus, Edit, Trash } from 'lucide-react';

const CardManager = () => {
    const [cards, setCards] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 350, height: 280, radius: 5 });

    // Mock fetching dimensions from Settings API (in real app, we'd add these fields to Setting model)
    // For now, local state management for the UI demo

    const fetchCards = async () => {
        try {
            const { data } = await api.get('/cards');
            setCards(data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleEdit = (card) => {
        setCurrentCard(card);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentCard(null);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                await api.delete(`/cards/${id}`);
                fetchCards();
            } catch (error) {
                console.error('Error deleting card:', error);
            }
        }
    };

    const handleSuccess = () => {
        setIsEditing(false);
        fetchCards();
    };

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto">
                <CardForm
                    initialData={currentCard}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div>
            {/* Phase 6: Dimensions UI Upgrade */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Card Dimensions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Card Width (px)</label>
                        <input
                            type="number"
                            value={dimensions.width}
                            onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Default: 280px</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Card Height (px)</label>
                        <input
                            type="number"
                            value={dimensions.height}
                            onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Default: 200px</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Border Radius (px)</label>
                        <input
                            type="number"
                            value={dimensions.radius}
                            onChange={(e) => setDimensions({ ...dimensions, radius: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Default: 16px</p>
                    </div>
                </div>
                <div className="mt-8">
                    <p className="text-xs text-gray-500 mb-4">* These settings apply to all cards on the homepage</p>
                    <button className="bg-[#1a1f2e] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-black transition">
                        UPDATE DIMENSIONS
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-700 uppercase tracking-wider">Home Page Cards List</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#1a1f2e] text-white px-4 py-2 rounded-lg hover:bg-black transition text-sm font-bold shadow"
                >
                    <Plus size={16} />
                    ADD NEW CARD
                </button>
            </div>

            {/* Table View matching Image 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-20">Preview</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-20">Sort</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {cards.map((card, index) => (
                            <tr key={card.id} className="hover:bg-gray-50 transition">
                                <td className="py-4 px-6">
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden border border-gray-200">
                                        {card.section2_image ? (
                                            <img src={`http://localhost:5000/${card.section2_image}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-6 font-medium text-gray-600">{index + 1}</td>
                                <td className="py-4 px-6 font-bold text-gray-800">{card.title}</td>
                                <td className="py-4 px-6 text-sm text-gray-500 max-w-xs truncate">{card.description}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Active</span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-4">
                                    <button onClick={() => handleEdit(card)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Edit</button>
                                    <button onClick={() => handleDelete(card.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {cards.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-400">No cards found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CardManager;
