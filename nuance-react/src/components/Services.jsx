import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Services() {
  const [activeService, setActiveService] = useState('1');
  
  // Custom hook to handle scroll reveal logic
  useScrollReveal();

  const services = [
    { id: '1', name: 'Signature Cut' },
    { id: '2', name: 'Colour & Balayage' },
    { id: '3', name: 'Hair Spa' },
    { id: '4', name: 'Styling' },
    { id: '5', name: "Men's Grooming" },
    { id: '6', name: 'Bridal & Occasion' },
  ];

  const serviceImages = [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=800',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=800',
  ];

  return (
    <section className="section" id="services">
      <div className="container-custom">
        <div className="section-head rv">
          <h2 className="display-lg">Signature<br/><span className="italic brass-text">Services.</span></h2>
          <a href="#booking" className="link-arrow">View All Services
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 5H15M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="1.4"/></svg>
          </a>
        </div>

        <div className="services-wrap">
          <ul className="services-list" id="servicesList">
            {services.map((service, idx) => (
              <li 
                key={service.id}
                className={`service-row ${activeService === service.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveService(service.id)}
                onClick={() => setActiveService(service.id)}
              >
                <span className="mono-num">0{idx + 1}</span>
                <h3>{service.name}</h3>
                <span className="row-arrow">→</span>
              </li>
            ))}
          </ul>
          <div className="services-visual" id="servicesVisual">
            {services.map((service, idx) => (
              <div 
                key={service.id}
                className={`ph ph-service ${activeService === service.id ? 'is-active' : ''}`} 
              >
                <img className="ph-img" src={serviceImages[idx]} alt={service.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
