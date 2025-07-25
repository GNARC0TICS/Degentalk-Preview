import React from 'react';
import './RevenueWidget.css';

const RevenueWidget: React.FC = () => {
  return (
    <div className="revenue-widget-wrapper">
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-title">Monthly Revenue</div>
          <div className="menu-wrapper">
            <input className="menu-toggle" id="menu-toggle" type="checkbox" />
            <label className="menu-dots" htmlFor="menu-toggle">
              <span />
              <span />
              <span />
            </label>
            <div className="menu-select">
              <div>View</div>
              <div>Edit</div>
              <div>Delete</div>
            </div>
          </div>
        </div>
        <div className="stat-card-chart">
          <svg className="linechart" viewBox="0 0 360 120">
            <defs>
              <linearGradient y2={1} x2={0} y1={0} x1={0} id="lineGradient">
                <stop stopColor="#3d8bff" offset="0%" />
                <stop stopColor="#1ecb6b" offset="100%" />
              </linearGradient>
              <linearGradient y2={1} x2={0} y1={0} x1={0} id="areaGradient">
                <stop stopOpacity="0.3" stopColor="#3d8bff" offset="0%" />
                <stop stopOpacity={0} stopColor="#1ecb6b" offset="100%" />
              </linearGradient>
              <linearGradient y2={1} x2={0} y1={0} x1={0} id="tooltipGradient">
                <stop stopOpacity="0.95" stopColor="#3d8bff" offset="0%" />
                <stop stopOpacity="0.95" stopColor="#1ecb6b" offset="100%" />
              </linearGradient>
              <filter height="140%" width="140%" y="-20%" x="-20%" id="glow">
                <feGaussianBlur result="coloredBlur" stdDeviation={3} />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path fill="url(#areaGradient)" d="M15,90 L45,40 L75,60 L105,35 L135,60 L165,80 L195,60 L225,70 L255,40 L285,60 L315,50 L345,70 L345,120 L15,120 Z" />
            <polyline filter="url(#glow)" points="15,90 45,40 75,60 105,35 135,60 165,80 195,60 225,70 255,40 285,60 315,50 345,70" strokeWidth={4} stroke="url(#lineGradient)" fill="none" />
            <g className="dot-group">
              <circle fill="#3d8bff" r={6} cy={90} cx={15} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={54} x={5} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={74} x={40}>
                  Jan: 12
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#3d8bff" r={6} cy={40} cx={45} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={4} x={10} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={24} x={45}>
                  Feb: 40
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#3d8bff" r={6} cy={60} cx={75} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={24} x={40} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={44} x={75}>
                  Mar: 28
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#3d8bff" r={6} cy={35} cx={105} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={-5} x={70} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={15} x={105}>
                  Apr: 50
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#3d8bff" r={6} cy={60} cx={135} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={24} x={100} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={44} x={135}>
                  May: 30
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#1ecb6b" r={6} cy={80} cx={165} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={44} x={130} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={64} x={165}>
                  Jun: 18
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#1ecb6b" r={6} cy={60} cx={195} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={24} x={160} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={44} x={195}>
                  Jul: 22
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#1ecb6b" r={6} cy={70} cx={225} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={34} x={190} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={54} x={225}>
                  Aug: 25
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#1ecb6b" r={6} cy={40} cx={255} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={4} x={220} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={24} x={255}>
                  Sep: 38
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#1ecb6b" r={6} cy={60} cx={285} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={24} x={250} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={44} x={285}>
                  Oct: 27
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#1ecb6b" r={6} cy={50} cx={315} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={14} x={280} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={34} x={315}>
                  Nov: 32
                </text>
              </g>
            </g>
            <g className="dot-group">
              <circle fill="#1ecb6b" r={6} cy={70} cx={345} />
              <g className="tooltip">
                <rect opacity="0.92" fill="#232733" rx={8} height={32} width={70} y={34} x={285} />
                <text fontWeight={500} fontSize={15} fill="#fff" textAnchor="middle" y={54} x={320}>
                  Dec: 20
                </text>
              </g>
            </g>
            <g fill="#b0b6c3" fontSize={12} className="x-labels">
              <text textAnchor="middle" y={115} x={15}>Jan</text>
              <text textAnchor="middle" y={115} x={45}>Feb</text>
              <text textAnchor="middle" y={115} x={75}>Mar</text>
              <text textAnchor="middle" y={115} x={105}>Apr</text>
              <text textAnchor="middle" y={115} x={135}>May</text>
              <text textAnchor="middle" y={115} x={165}>Jun</text>
              <text textAnchor="middle" y={115} x={195}>Jul</text>
              <text textAnchor="middle" y={115} x={225}>Aug</text>
              <text textAnchor="middle" y={115} x={255}>Sep</text>
              <text textAnchor="middle" y={115} x={285}>Oct</text>
              <text textAnchor="middle" y={115} x={315}>Nov</text>
              <text textAnchor="middle" y={115} x={345}>Dec</text>
            </g>
          </svg>
        </div>
        <div className="stat-card-legend">
          <div className="legend-item">
            <span>Avrage monthly sale for every author</span>
          </div>
          <div className="legend-item">
            <span className="legend-value">68.9%</span>
            <span className="legend-change">▲ 34.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueWidget;