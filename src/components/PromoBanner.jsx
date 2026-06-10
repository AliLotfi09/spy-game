import React from "react";
import "../App.css";

export default function PromoBanner({ title, subtitle, label, profileSrc, onClick }) {
  return (
    <div className="banner-wrapper" onClick={onClick}>
      <div className="banner-content">
        <img src={profileSrc} className="banner-avatar" alt="profile" />

        <div className="banner-text">
          <div className="banner-title">{title}</div>
          <div className="banner-subtitle">{subtitle}</div>
        </div>

        <div className="banner-icon">↗</div>
      </div>

      {/* لیبل پایین کارت */}
      {/* <div className="banner-label">{label}</div> */}
    </div>
  );
}
