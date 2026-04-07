import { useState } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import './CategoryForm.css';

const ATTRIBUTE_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select (Dropdown)' },
    { value: 'multiselect', label: 'Multi-Select' },
    { value: 'boolean', label: 'Yes/No Toggle' }
];

function CategoryForm({ category = null, onSubmit, onCancel }) {
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');
    const [attributes, setAttributes] = useState(
        category?.attributes || []
    );
    const [errors, setErrors] = useState({});

    const addAttribute = () => {
        setAttributes([
            ...attributes,
            {
                name: '',
                key: '',
                type: 'text',
                options: [],
                required: false,
                filterable: false,
                unit: ''
            }
        ]);
    };

    const removeAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const updateAttribute = (index, field, value) => {
        const updated = [...attributes];
        updated[index] = { ...updated[index], [field]: value };

        if (field === 'name') {
            updated[index].key = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/(^_|_$)/g, '');
        }

        setAttributes(updated);
    };

    const updateOptions = (index, optionsStr) => {
        const updated = [...attributes];
        updated[index].options = optionsStr.split(',').map(o => o.trim()).filter(Boolean);
        setAttributes(updated);
    };

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Category name is required';
        if (attributes.length === 0) errs.attributes = 'Add at least one attribute';

        attributes.forEach((attr, i) => {
            if (!attr.name.trim()) errs[`attr_${i}_name`] = 'Required';
            if ((attr.type === 'select' || attr.type === 'multiselect') && attr.options.length === 0) {
                errs[`attr_${i}_options`] = 'Add at least one option';
            }
        });

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onSubmit({
            name: name.trim(),
            description: description.trim(),
            attributes
        });
    };

    return (
        <form className="category-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">
                    Category Name <span className="required">*</span>
                </label>
                <input
                    type="text"
                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Mobile, Bangles, Laptops"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    className="form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the category"
                    rows={2}
                />
            </div>

            <div className="attributes-section">
                <div className="attributes-header">
                    <h4>Attributes</h4>
                    <button type="button" className="btn btn-primary btn-sm" onClick={addAttribute}>
                        <FiPlus /> Add Attribute
                    </button>
                </div>

                {errors.attributes && (
                    <span className="form-error" style={{ display: 'block', marginBottom: 12 }}>
                        {errors.attributes}
                    </span>
                )}

                {attributes.length === 0 ? (
                    <div className="no-attributes">
                        <p>No attributes defined yet. Click "Add Attribute" to start.</p>
                    </div>
                ) : (
                    <div className="attributes-list">
                        {attributes.map((attr, index) => (
                            <div key={index} className="attribute-item">
                                <div className="attribute-item-header">
                                    <span className="attribute-number">{index + 1}</span>
                                    <button
                                        type="button"
                                        className="remove-attr-btn"
                                        onClick={() => removeAttribute(index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>

                                <div className="attribute-fields">
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors[`attr_${index}_name`] ? 'input-error' : ''}`}
                                            value={attr.name}
                                            onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                                            placeholder="e.g., RAM, Color, Size"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <select
                                            className="form-select"
                                            value={attr.type}
                                            onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                                        >
                                            {ATTRIBUTE_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Unit (optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={attr.unit}
                                            onChange={(e) => updateAttribute(index, 'unit', e.target.value)}
                                            placeholder="e.g., GB, cm, kg"
                                        />
                                    </div>

                                    {(attr.type === 'select' || attr.type === 'multiselect') && (
                                        <div className="form-group full-width">
                                            <label className="form-label">
                                                Options <span className="form-hint">(comma separated)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${errors[`attr_${index}_options`] ? 'input-error' : ''}`}
                                                value={attr.options.join(', ')}
                                                onChange={(e) => updateOptions(index, e.target.value)}
                                                placeholder="e.g., 4GB, 6GB, 8GB, 12GB"
                                            />
                                            {errors[`attr_${index}_options`] && (
                                                <span className="form-error">{errors[`attr_${index}_options`]}</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="attribute-toggles">
                                        <label className="toggle-inline">
                                            <input
                                                type="checkbox"
                                                checked={attr.required}
                                                onChange={(e) => updateAttribute(index, 'required', e.target.checked)}
                                            />
                                            <span>Required</span>
                                        </label>
                                        <label className="toggle-inline">
                                            <input
                                                type="checkbox"
                                                checked={attr.filterable}
                                                onChange={(e) => updateAttribute(index, 'filterable', e.target.checked)}
                                            />
                                            <span>Filterable</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    <FiX /> Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    <FiSave /> {category ? 'Update Category' : 'Create Category'}
                </button>
            </div>
        </form>
    );
}

export default CategoryForm;
