import '../Spinner.css';

const Spinner = ({ size = 'medium', color = '#5F41E4' }) => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };
  
  return (
    <div className="spinner" style={{ 
      width: sizes[size], 
      height: sizes[size],
      borderColor: color,
      borderTopColor: 'transparent'
    }}></div>
  );
};

export default Spinner;