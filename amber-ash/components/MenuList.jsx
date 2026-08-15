import { StaggerContainer, StaggerItem } from './ui/Stagger'
import './menuList.css'

export default function MenuList({ category, dark = false }) {
  if (!category) return null
  return (
    <div className={`menu-list ${dark ? 'menu-list--dark' : ''}`}>
      <div className="menu-list-head">
        <h3>{category.label}</h3>
        <span className="menu-list-note">{category.note}</span>
      </div>
      <StaggerContainer as="ul" key={category.id}>
        {category.items.map((item) => (
          <StaggerItem as="li" key={item.name} className="menu-item">
            <div className="menu-item-name">
              <span>{item.name}</span>
              <span className="leader" aria-hidden="true" />
              <span className="menu-item-price">${Number(item.price).toFixed(2)}</span>
            </div>
            <p className="menu-item-desc">{item.desc}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}
