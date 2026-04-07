import { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import './DynamicFilters.css';

function DynamicFilters({ filters = [], activeFilters = {}, onFilterChange, onClearAll }) {
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (key) => {
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleCheckboxChange = (filterKey, value) => {
        const current = activeFilters[filterKey] || [];
        let updated;
        if (current.includes(value)) {
            updated = current.filter(v => v !== value);
        } else {
            updated = [...current, value];
        }
        onFilterChange(filterKey, updated.length > 0 ? updated : undefined);
    };

    const handleRangeChange = (filterKey, field, value) => {
        const current = activeFilters[filterKey] || {};
        onFilterChange(filterKey, { ...current, [field]: Number(value) });
    };

    const activeCount = Object.keys(activeFilters).filter(k => {
        const v = activeFilters[k];
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object') return v.min !== undefined || v.max !== undefined;
        return v !== undefined && v !== '';
    }).length;

    if (filters.length === 0) {
        return null;
    }

    return (
        <div className="dynamic-filters">
            <div className="filters-header">
                <div className="filters-title">
                    <FiFilter />
                    <span>Filters</span>
                    {activeCount > 0 && (
                        <span className="filter-count">{activeCount}</span>
                    )}
                </div>
                {activeCount > 0 && (
                    <button className="clear-filters" onClick={onClearAll}>
                        <FiX /> Clear All
                    </button>
                )}
            </div>

            <div className="filters-body">
                {filters.map((filter) => {
                    const isExpanded = expandedSections[filter.key] !== false;

                    return (
                        <div key={filter.key} className="filter-section">
                            <button
                                className="filter-section-header"
                                onClick={() => toggleSection(filter.key)}
                            >
                                <span className="filter-name">
                                    {filter.name}
                                    {filter.unit && <span className="filter-unit">({filter.unit})</span>}
                                </span>
                                <span className={`filter-arrow ${isExpanded ? 'expanded' : ''}`}>▸</span>
                            </button>

                            {isExpanded && (
                                <div className="filter-content">
                                    {filter.type === 'range' ? (
                                        <div className="range-filter">
                                            <div className="range-inputs">
                                                <input
                                                    type="number"
                                                    placeholder={`Min ${filter.min || ''}`}
                                                    className="form-input range-input"
                                                    value={activeFilters[filter.key]?.min || ''}
                                                    onChange={(e) => handleRangeChange(filter.key, 'min', e.target.value)}
                                                />
                                                <span className="range-sep">—</span>
                                                <input
                                                    type="number"
                                                    placeholder={`Max ${filter.max || ''}`}
                                                    className="form-input range-input"
                                                    value={activeFilters[filter.key]?.max || ''}
                                                    onChange={(e) => handleRangeChange(filter.key, 'max', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="checkbox-filter">
                                            {(filter.values || []).map((val) => {
                                                const isChecked = (activeFilters[filter.key] || []).includes(val);
                                                return (
                                                    <label key={val} className="checkbox-option">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleCheckboxChange(filter.key, val)}
                                                        />
                                                        <span className="checkmark"></span>
                                                        <span className="option-label">{val}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DynamicFilters;
