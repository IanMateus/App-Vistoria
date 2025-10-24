import { useState } from "react";

const InputField = ({ type, placeholder, icon, onChange }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  
  return (
    <div className="input-wrapper">
      <i className="material-symbols-rounded input-icon">{icon}</i>
      
      <input
        type={isPasswordShown ? 'text' : type}
        placeholder={placeholder}
        className="input-field"
        onChange={(e) => onChange(e.target.value)} 
        required
      />
      
      {type === 'password' && (
        <button 
          type="button"
          className="icon-button"
          onClick={() => setIsPasswordShown(prev => !prev)}
          aria-label={isPasswordShown ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <i className="material-symbols-rounded">
            {isPasswordShown ? 'visibility' : 'visibility_off'}
          </i>
        </button>
      )}
    </div>
  )
}

export default InputField;