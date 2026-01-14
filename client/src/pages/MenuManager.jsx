import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, GripVertical, Check, X, Edit } from 'lucide-react';

const MenuManager = () => {
    const [menus, setMenus] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ label: '', url: '', order: 0, is_active: true });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        const { data } = await api.get('/menus');
        setMenus(data);
    };

    const handleEdit = (menu) => {
        setEditingId(menu.id);
        setFormData(menu);
        setIsCreating(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this menu item?')) {
            await api.delete(`/menus/${id}`);
            fetchMenus();
        }
    };

    const handleSave = async () => {
        try {
            if (isCreating) {
                await api.post('/menus', formData);
            } else {
                await api.put(`/menus/${editingId}`, formData);
            }
            setIsCreating(false);
            setEditingId(null);
            fetchMenus();
        } catch (error) {
            console.error(error);
        }
    };

    const startCreate = () => {
        setFormData({ label: '', url: '', order: menus.length + 1, is_active: true });
        setIsCreating(true);
        setEditingId(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
                <button onClick={startCreate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
                    <Plus size={20} /> Add Menu Item
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-semibold text-gray-600 border-b bg-gray-50">
                    <div className="col-span-1">Order</div>
                    <div className="col-span-4">Label</div>
                    <div className="col-span-4">URL</div>
                    <div className="col-span-1">Active</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Desktop Create Row */}
                {isCreating && (
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center bg-blue-50 border-b">
                        <div className="col-span-1">
                            <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full border rounded p-1" />
                        </div>
                        <div className="col-span-4">
                            <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-1" placeholder="Label" autoFocus />
                        </div>
                        <div className="col-span-4">
                            <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-1" placeholder="/url" />
                        </div>
                        <div className="col-span-1">
                            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                        </div>
                        <div className="col-span-2 flex justify-end gap-2">
                            <button onClick={handleSave} className="text-green-600 p-1 hover:bg-white rounded"><Check size={20} /></button>
                            <button onClick={() => setIsCreating(false)} className="text-gray-500 p-1 hover:bg-white rounded"><X size={20} /></button>
                        </div>
                    </div>
                )}

                {/* Mobile Create Form */}
                {isCreating && (
                    <div className="md:hidden p-4 bg-blue-50 border-b space-y-3">
                        <h4 className="font-bold text-blue-800 text-sm uppercase">New Menu Item</h4>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Label</label>
                            <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-2" placeholder="Label" autoFocus />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">URL</label>
                            <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-2" placeholder="/url" />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-20">
                                <label className="text-xs font-bold text-gray-500">Order</label>
                                <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full border rounded p-2" />
                            </div>
                            <div className="flex items-center pt-5">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                                    Active
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500 hover:bg-white rounded font-bold text-sm">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700">Save</button>
                        </div>
                    </div>
                )}

                {menus.map((menu) => (
                    <div key={menu.id} className="border-b last:border-0 hover:bg-gray-50">
                        {/* Desktop Row */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                            {editingId === menu.id ? (
                                <>
                                    <div className="col-span-1">
                                        <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full border rounded p-1" />
                                    </div>
                                    <div className="col-span-4">
                                        <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-1" />
                                    </div>
                                    <div className="col-span-4">
                                        <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-1" />
                                    </div>
                                    <div className="col-span-1">
                                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2">
                                        <button onClick={handleSave} className="text-green-600 p-1 hover:bg-white rounded"><Check size={20} /></button>
                                        <button onClick={() => setEditingId(null)} className="text-gray-500 p-1 hover:bg-white rounded"><X size={20} /></button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="col-span-1 text-gray-500 text-center">{menu.order}</div>
                                    <div className="col-span-4 font-medium">{menu.label}</div>
                                    <div className="col-span-4 text-gray-500 text-sm font-mono">{menu.url}</div>
                                    <div className="col-span-1">
                                        <span className={`px-2 py-1 rounded text-xs ${menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {menu.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2">
                                        <button onClick={() => handleEdit(menu)} className="text-blue-600 hover:text-blue-800">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(menu.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile Row */}
                        <div className="md:hidden p-4">
                            {editingId === menu.id ? (
                                <div className="space-y-3 bg-gray-50 -m-2 p-4 rounded-lg">
                                    <h4 className="font-bold text-gray-800 text-sm uppercase">Edit Item</h4>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Label</label>
                                        <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">URL</label>
                                        <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-2" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-20">
                                            <label className="text-xs font-bold text-gray-500">Order</label>
                                            <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full border rounded p-2" />
                                        </div>
                                        <div className="flex items-center pt-5">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-500 hover:bg-white rounded font-bold text-sm">Cancel</button>
                                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                                            {menu.order}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{menu.label}</div>
                                            <div className="text-xs text-gray-500 font-mono">{menu.url}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {menu.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                        <button onClick={() => handleEdit(menu)} className="text-blue-600 p-1"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(menu.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {menus.length === 0 && !isCreating && (
                    <div className="p-8 text-center text-gray-500">No menu items found.</div>
                )}
            </div>
        </div>
    );
};

export default MenuManager;
