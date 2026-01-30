import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const InputField = ({ label, type, placeholder, icon: Icon, id, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="space-y-2 group">
            <label
                htmlFor={id}
                className="block text-sm font-semibold uppercase tracking-wider text-slate-400 pl-1"
            >
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    {Icon && <Icon size={20} />}
                </div>
                <input
                    id={id}
                    value={value}
                    onChange={onChange}
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 font-medium shadow-sm hover:border-slate-300"
                    placeholder={placeholder}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InputField;
