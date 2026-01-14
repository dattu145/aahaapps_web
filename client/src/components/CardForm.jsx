import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import api from '../api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableThumbnail = ({ url, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group w-20 h-20 cursor-move">
            <img src={`/${url}`} alt="Thumbnail" className="w-full h-full object-cover rounded border border-gray-200" />
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
                onClick={() => onRemove(url)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
            >
                <X size={12} />
            </button>
        </div>
    );
};

const CardForm = ({ initialData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        enquiry_link: '',
        card_bg_color: '#ffffff',
        title_color: '#000000',
        desc_color: '#555555',
        buttons: [],
        section1_images: [],
        section2_image: null,
        thumbnail_width: 160,
        thumbnail_height: 104,
        sort_order: 0
    });

    const [newSection2Image, setNewSection2Image] = useState(null);
    const [newSection1Images, setNewSection1Images] = useState([]);
    const [loading, setLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                buttons: typeof initialData.buttons === 'string' ? JSON.parse(initialData.buttons) : (initialData.buttons || []),
                section1_images: typeof initialData.section1_images === 'string' ? JSON.parse(initialData.section1_images) : (initialData.section1_images || []),
                thumbnail_width: initialData.thumbnail_width || 160,
                thumbnail_height: initialData.thumbnail_height || 104,
                sort_order: initialData.sort_order || 0
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFormData((prev) => {
                const oldIndex = prev.section1_images.indexOf(active.id);
                const newIndex = prev.section1_images.indexOf(over.id);
                return {
                    ...prev,
                    section1_images: arrayMove(prev.section1_images, oldIndex, newIndex),
                };
            });
        }
    };

    // Button Management
    const addButton = () => {
        setFormData(prev => ({
            ...prev,
            buttons: [...prev.buttons, {
                text: 'New Button',
                link: '#',
                type: 'link', // 'link' or 'popup'
                popup_content: '',
                bg_color: '#0000ff',
                text_color: '#ffffff',
                font_size: 15
            }]
        }));
    };

    const removeButton = (index) => {
        setFormData(prev => ({
            ...prev,
            buttons: prev.buttons.filter((_, i) => i !== index)
        }));
    };

    const updateButton = (index, field, value) => {
        const updatedButtons = [...formData.buttons];
        updatedButtons[index][field] = value;
        setFormData(prev => ({ ...prev, buttons: updatedButtons }));
    };

    // Image Handlers
    const handleSection2ImageChange = (e) => {
        if (e.target.files[0]) {
            setNewSection2Image(e.target.files[0]);
        }
    };

    const handleSection1ImagesChange = (e) => {
        if (e.target.files) {
            // Append new files instead of replacing, if that's desired behavior, or just replace.
            // Standard file input behavior replaces. Here we'll stick to replacing "current selection" 
            // but we might want to accumulate if the user wants to add more?
            // User request implies "remove selected", suggesting they might want to manage this list.
            // Let's create an array from the FileList.
            setNewSection1Images(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewImage = (index) => {
        setNewSection1Images(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imagePath) => {
        setFormData(prev => ({
            ...prev,
            section1_images: prev.section1_images.filter(img => img !== imagePath)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('enquiry_link', formData.enquiry_link);
        data.append('card_bg_color', formData.card_bg_color);
        data.append('title_color', formData.title_color);
        data.append('desc_color', formData.desc_color);
        data.append('buttons', JSON.stringify(formData.buttons));
        data.append('section1_images', JSON.stringify(formData.section1_images));
        data.append('thumbnail_width', formData.thumbnail_width);

        data.append('thumbnail_height', formData.thumbnail_height);
        data.append('sort_order', formData.sort_order);

        if (newSection2Image) {
            data.append('section2_image', newSection2Image);
        }

        newSection1Images.forEach(file => {
            data.append('section1_images', file);
        });

        try {
            if (initialData?.id) {
                await api.put(`/cards/${initialData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/cards', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
        } catch (error) {
            alert('Error saving card: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Home Page Card' : 'Add New Home Page Card'}</h3>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-black">
                    <X />
                </button>
            </div>

            {/* Section 1: Top Thumbnails */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Section 1: Top Thumbnails</h4>

                {formData.section1_images.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Current Thumbnails (Drag to Reorder)</label>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex flex-wrap gap-3 p-3 bg-white rounded-lg border border-dashed border-gray-300">
                                <SortableContext items={formData.section1_images} strategy={horizontalListSortingStrategy}>
                                    {formData.section1_images.map((img) => (
                                        <SortableThumbnail key={img} url={img} onRemove={removeExistingImage} />
                                    ))}
                                </SortableContext>
                            </div>
                        </DndContext>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Add New Thumbnail Images</label>
                    <input type="file" multiple onChange={handleSection1ImagesChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border-gray-200 hover:file:bg-gray-100 border border-gray-200 rounded-lg bg-white p-1" />

                    {newSection1Images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {newSection1Images.map((file, idx) => (
                                <div key={`new-${idx}`} className="w-16 h-16 relative group">
                                    <img src={URL.createObjectURL(file)} alt="New upload" className="w-full h-full object-cover rounded border-2 border-green-400" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Thumbnail Width (px)</label>
                        <input
                            type="number"
                            name="thumbnail_width"
                            value={formData.thumbnail_width}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Thumbnail Height (px)</label>
                        <input
                            type="number"
                            name="thumbnail_height"
                            value={formData.thumbnail_height}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Main Content */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Section 2: Main Content</h4>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Main Image</label>
                    <input type="file" onChange={handleSection2ImageChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border-gray-200 hover:file:bg-gray-100 border border-gray-200 rounded-lg bg-white p-1" />

                    {(newSection2Image || formData.section2_image) && (
                        <div className="mt-4 h-48 w-full bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                            <img
                                src={newSection2Image ? URL.createObjectURL(newSection2Image) : `/${formData.section2_image}`}
                                alt="Preview"
                                className="h-full object-contain"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none" rows="4" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Enquiry Button Link</label>
                        <input name="enquiry_link" value={formData.enquiry_link} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none" placeholder="/contact or https://..." />
                        <p className="text-[10px] text-gray-400 mt-1">This link will be used for the "Enquiry" button (common for all cards)</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Display Order</label>
                        <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none" placeholder="e.g. 1, 2, 3" />
                        <p className="text-[10px] text-gray-400 mt-1">Lower numbers appear first on the home page</p>
                    </div>
                </div>
            </div>

            {/* Section 3: Buttons */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase">Section 3: Buttons</h4>
                    <button type="button" onClick={addButton} className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition">
                        <Plus size={14} /> Add Button
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.buttons.map((btn, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 relative">
                            <button type="button" onClick={() => removeButton(index)} className="absolute top-4 right-4 text-red-500 text-xs font-bold hover:underline">
                                Remove
                            </button>
                            <h5 className="text-xs font-bold text-gray-600 mb-3">Button {index + 1}</h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Button Text</label>
                                    <input value={btn.text} onChange={(e) => updateButton(index, 'text', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Type</label>
                                    <select
                                        value={btn.type || 'link'}
                                        onChange={(e) => updateButton(index, 'type', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                                    >
                                        <option value="link">Link</option>
                                        <option value="popup">Popup</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                {btn.type === 'popup' ? (
                                    <div className="h-64">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Popup Content</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={btn.popup_content || ''}
                                            onChange={(value) => updateButton(index, 'popup_content', value)}
                                            className="h-48 bg-white"
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['link'],
                                                    ['clean']
                                                ]
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link URL</label>
                                        <input value={btn.link} onChange={(e) => updateButton(index, 'link', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">BG Color</label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-white">
                                        <input type="color" value={btn.bg_color} onChange={(e) => updateButton(index, 'bg_color', e.target.value)} className="w-6 h-6 border-none p-0 cursor-pointer" />
                                        <span className="text-xs text-gray-500 font-mono">{btn.bg_color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Text Color</label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-white">
                                        <input type="color" value={btn.text_color} onChange={(e) => updateButton(index, 'text_color', e.target.value)} className="w-6 h-6 border-none p-0 cursor-pointer" />
                                        <span className="text-xs text-gray-500 font-mono">{btn.text_color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Font Size (px)</label>
                                    <input
                                        type="number"
                                        value={btn.font_size || 15}
                                        onChange={(e) => updateButton(index, 'font_size', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.buttons.length === 0 && <p className="text-sm text-gray-400 italic">No buttons added.</p>}
                </div>
            </div>

            {/* Color Overrides */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Color Overrides (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Card Background Color</label>
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <input type="color" name="card_bg_color" value={formData.card_bg_color} onChange={handleChange} className="h-8 w-10 p-0 border rounded" />
                            <input type="text" name="card_bg_color" value={formData.card_bg_color} onChange={handleChange} className="flex-1 text-xs font-mono outline-none uppercase" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Override global card background</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Title Text Color</label>
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <input type="color" name="title_color" value={formData.title_color} onChange={handleChange} className="h-8 w-10 p-0 border rounded" />
                            <input type="text" name="title_color" value={formData.title_color} onChange={handleChange} className="flex-1 text-xs font-mono outline-none uppercase" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Override global title color</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Description Text Color</label>
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <input type="color" name="desc_color" value={formData.desc_color} onChange={handleChange} className="h-8 w-10 p-0 border rounded" />
                            <input type="text" name="desc_color" value={formData.desc_color} onChange={handleChange} className="flex-1 text-xs font-mono outline-none uppercase" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Override global description color</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#1a1f2e] text-white rounded-lg hover:bg-black font-bold text-sm disabled:opacity-50 shadow-lg transition-transform transform hover:scale-105">
                    {loading ? 'SAVING...' : (initialData ? 'UPDATE CARD' : 'CREATE CARD')}
                </button>
            </div>
        </form>
    );
};

export default CardForm;
