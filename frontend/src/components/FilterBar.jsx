import { useState } from 'react'

export default function FilterBar({ groups, active, onSelect, onReset }) {
  const [openGroup, setOpenGroup] = useState(null)

  function toggleGroup(key) {
    setOpenGroup(openGroup === key ? null : key)
  }

  function selectValue(key, value) {
    onSelect(key, value)
    setOpenGroup(null)
  }

  return (
    <div className="filter-bar">
      <span className="filter-group-label">Filtra per</span>
      {groups.map((group) => (
        <div className="filter-dropdown" key={group.key}>
          <button
            className={`filter-pill ${active?.type === group.key ? 'active' : ''}`}
            onClick={() => toggleGroup(group.key)}
          >
            {active?.type === group.key ? `${group.label}: ${active.value}` : group.label}
          </button>
          {openGroup === group.key && (
            <div className="filter-dropdown-menu">
              {group.values.map((value) => (
                <button key={value} onClick={() => selectValue(group.key, value)}>
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {active && (
        <button className="filter-reset" onClick={onReset}>Rimuovi filtro</button>
      )}
    </div>
  )
}
