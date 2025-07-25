import React from 'react';
import './ShopCard3D.css';

interface ShopCard3DProps {
  bgColor?: string;
  title?: string;
  description?: string;
  price?: string;
  badge?: string;
}

const ShopCard3D: React.FC<ShopCard3DProps> = ({
  bgColor = '#ff6b6b',
  title = 'Dynamic Design',
  description = 'Experience interactive hover effects',
  price = '$143.99',
  badge = 'TRENDING'
}) => {
  return (
    <div className="shop-card-3d-wrapper">
      <div className="card-container">
        <div className="card-effect">
          <div className="card-inner">
            <div className="card__liquid" />
            <div className="card__shine" />
            <div className="card__glow" />
            <div className="card__content">
              <div className="card__badge">{badge}</div>
              <div className="card__image" style={{ backgroundColor: bgColor }} />
              <div className="card__text">
                <p className="card__title">{title}</p>
                <p className="card__description">{description}</p>
              </div>
              <div className="card__footer">
                <div className="card__price">{price}</div>
                <div className="card__button">
                  <svg viewBox="0 0 24 24" width={16} height={16}>
                    <path fill="currentColor" d="M5 12H19M12 5V19" stroke="currentColor" strokeWidth={2} />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopCard3D;