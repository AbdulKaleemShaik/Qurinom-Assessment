import './DynamicForm.css';

function DynamicForm({ attributes = [], values = {}, onChange, errors = {} }) {
    if (!attributes || attributes.length === 0) {
        return (
            <div className="dynamic-form-empty">
                <p>Select a category to see product-specific fields</p>
            </div>
        );
    }

    const handleFieldChange = (key, value) => {
        onChange(key, value);
    };

    const renderField = (attr) => {
        const value = values[attr.key] || '';
        const error = errors[attr.key];

        switch (attr.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        className={`form-input ${error ? 'input-error' : ''}`}
                        value={value}
                        onChange={(e) => handleFieldChange(attr.key, e.target.value)}
                        placeholder={`Enter ${attr.name.toLowerCase()}${attr.unit ? ` (${attr.unit})` : ''}`}
                        id={`spec-${attr.key}`}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        className={`form-input ${error ? 'input-error' : ''}`}
                        value={value}
                        onChange={(e) => handleFieldChange(attr.key, e.target.value)}
                        placeholder={`Enter ${attr.name.toLowerCase()}${attr.unit ? ` (${attr.unit})` : ''}`}
                        id={`spec-${attr.key}`}
                        step="any"
                    />
                );

            case 'select':
                return (
                    <select
                        className={`form-select ${error ? 'input-error' : ''}`}
                        value={value}
                        onChange={(e) => handleFieldChange(attr.key, e.target.value)}
                        id={`spec-${attr.key}`}
                    >
                        <option value="">Select {attr.name}</option>
                        {attr.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case 'multiselect':
                return (
                    <div className="multiselect-group">
                        {attr.options.map((opt) => {
                            const selected = Array.isArray(value) && value.includes(opt);
                            return (
                                <label key={opt} className={`multiselect-option ${selected ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(e) => {
                                            const current = Array.isArray(value) ? [...value] : [];
                                            if (e.target.checked) {
                                                current.push(opt);
                                            } else {
                                                const idx = current.indexOf(opt);
                                                if (idx > -1) current.splice(idx, 1);
                                            }
                                            handleFieldChange(attr.key, current);
                                        }}
                                    />
                                    <span>{opt}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'boolean':
                return (
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={value === true || value === 'true'}
                            onChange={(e) => handleFieldChange(attr.key, e.target.checked)}
                            id={`spec-${attr.key}`}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">{value ? 'Yes' : 'No'}</span>
                    </label>
                );

            default:
                return (
                    <input
                        type="text"
                        className="form-input"
                        value={value}
                        onChange={(e) => handleFieldChange(attr.key, e.target.value)}
                        placeholder={`Enter ${attr.name.toLowerCase()}`}
                    />
                );
        }
    };

    return (
        <div className="dynamic-form">
            <div className="dynamic-form-header">
                <h3>Category-Specific Specifications</h3>
                <span className="field-count">{attributes.length} fields</span>
            </div>
            <div className="dynamic-form-grid">
                {attributes.map((attr) => (
                    <div key={attr.key} className={`form-group ${attr.type === 'multiselect' ? 'full-width' : ''}`}>
                        <label className="form-label" htmlFor={`spec-${attr.key}`}>
                            {attr.name}
                            {attr.unit && <span className="unit-badge">{attr.unit}</span>}
                            {attr.required && <span className="required">*</span>}
                        </label>
                        {renderField(attr)}
                        {errors[attr.key] && (
                            <span className="form-error">{errors[attr.key]}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DynamicForm;
