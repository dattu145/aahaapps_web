import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await api.get(`/pages/slug/${slug}`);
                setPage(data);
            } catch (err) {
                console.error(err);
                setError('Page not found');
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center pt-20 text-red-500 font-bold text-2xl">404 - {error}</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">{page.title}</h1>
            <div
                className="prose prose-lg prose-blue max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </div>
    );
};

export default DynamicPage;
