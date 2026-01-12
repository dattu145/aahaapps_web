import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../api';
import { Save, ArrowLeft } from 'lucide-react';

const PageForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const isEdit = !!id && id !== 'create';

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        is_active: true
    });

    useEffect(() => {
        if (isEdit) {
            const fetchPage = async () => {
                try {
                    const { data } = await api.get(`/pages/${id}`);
                    setFormData(data);
                } catch (error) {
                    console.error('Error fetching page:', error);
                }
            };
            fetchPage();
        }
    }, [id, isEdit]);

    // Image Handler for Quill
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            const form = new FormData();
            form.append('image', file);

            try {
                // Upload to our server endpoint
                const { data } = await api.post('/pages/upload-image', form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Insert into editor
                const range = quillRef.current.getEditor().getSelection();
                quillRef.current.getEditor().insertEmbed(range.index, 'image', data.url);
            } catch (error) {
                console.error('Image upload failed', error);
                alert('Image upload failed');
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put(`/pages/${id}`, formData);
            } else {
                await api.post('/pages', formData);
            }
            navigate('/admin/pages');
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Failed to save page');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button onClick={() => navigate('/admin/pages')} className="flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm">
                <ArrowLeft size={16} /> Back to Pages
            </button>

            <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Page' : 'Create Page'}</h2>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-blue-600"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">URL: website.com/{formData.slug}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Content</label>
                        <div className="h-[400px] mb-12">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                                modules={modules}
                                className="h-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm font-bold text-gray-700">Active</label>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button type="submit" className="flex items-center gap-2 bg-[#1a1f2e] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition">
                            <Save size={16} />
                            {isEdit ? 'UPDATE' : 'CREATE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PageForm;
