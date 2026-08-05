cat << 'CSS_EOF' >> css/style.css
/* Cropper.js specific overrides and layout */
.crop-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .crop-layout {
    flex-direction: row;
    align-items: flex-start;
  }
  .crop-layout__left {
    flex: 1;
    min-width: 0;
  }
  .crop-layout__right {
    width: 320px;
    flex-shrink: 0;
    position: sticky;
    top: 24px;
  }
}

.cropper-container {
  width: 100%;
  max-height: 60vh;
  background-color: #0b0f19;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.aspect-chips {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 8px;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.aspect-chips::-webkit-scrollbar {
  display: none;
}
.aspect-chip {
  flex: 0 0 auto;
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.aspect-chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.control-group {
  margin-bottom: 20px;
}
.control-group__title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.btn-group {
  display: flex;
  gap: 8px;
}
.btn-group .btn {
  flex: 1;
  justify-content: center;
}

/* Range Slider */
.zoom-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}
.zoom-slider {
  flex: 1;
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: var(--border-subtle);
  border-radius: 3px;
  outline: none;
}
.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
CSS_EOF
