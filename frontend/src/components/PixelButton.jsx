function PixelButton({ className = "", children, ...props }) {
  return (
    <button className={`pixel-button ${className}`} {...props}>
      {children}
    </button>
  );
}

export default PixelButton;
