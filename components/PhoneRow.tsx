import React from 'react';
import { PhoneData, PhoneStatus, PhoneType } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  PhoneOff, 
  Ban, 
  GripVertical, 
  Smartphone, 
  Phone, 
  Globe, 
  HelpCircle, 
  PhoneForwarded,
  Trash2
} from './Icons';
import { formatDateMMDDYYYY, formatPhoneNumber, isValidPhone } from '../utils';

interface PhoneRowProps {
  phone: PhoneData;
  index: number;
  isEditing: boolean;
  onUpdate: (updatedPhone: PhoneData) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const PhoneRow: React.FC<PhoneRowProps> = ({ 
  phone, 
  index, 
  isEditing,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) => {
  const handleStatusChange = (newStatus: PhoneStatus) => {
    onUpdate({
      ...phone,
      status: newStatus,
      statusChangedDate: new Date().toISOString()
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhoneNumber(raw);
    onUpdate({ ...phone, number: formatted });
  };
  
  const handleTypeChange = (newType: PhoneType) => {
    onUpdate({ ...phone, type: newType });
  };

  const isValid = phone.number === '' || isValidPhone(phone.number);

  // Styles
  const getStatusColor = () => {
    switch (phone.status) {
      case 'CORRECT': return 'bg-green-50 border-green-200';
      case 'WRONG': return 'bg-orange-50 border-orange-200';
      case 'DISCONNECTED': return 'bg-gray-100 border-gray-200 opacity-75';
      case 'DNC': return 'bg-red-50 border-red-200';
      case 'ATTEMPTED': return 'bg-blue-50 border-blue-200';
      default: return 'bg-white border-slate-100 hover:border-slate-300';
    }
  };

  const getTextColor = () => {
    if (!isValid) return 'text-red-500 font-medium';
    if (phone.status === 'DISCONNECTED') return 'text-gray-400 line-through';
    if (phone.status === 'DNC') return 'text-red-600 font-bold';
    if (phone.status === 'CORRECT') return 'text-green-700 font-bold';
    if (phone.status === 'ATTEMPTED') return 'text-blue-700 font-medium';
    return 'text-slate-800 font-medium';
  };

  const TypeIcon = () => {
    switch (phone.type) {
      case 'Mobile': return <Smartphone size={16} className="text-slate-500" />;
      case 'Landline': return <Phone size={16} className="text-slate-500" />;
      case 'Voip': return <Globe size={16} className="text-slate-500" />;
      default: return <HelpCircle size={16} className="text-slate-500" />;
    }
  };

  return (
    <div 
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, index)}
      onDragOver={(e) => !isEditing && onDragOver(e, index)}
      onDrop={(e) => !isEditing && onDrop(e, index)}
      onDragEnd={!isEditing ? onDragEnd : undefined}
      className={`group flex items-center gap-2 p-2 rounded-md border transition-all duration-200 mb-2 ${getStatusColor()}`}
    >
      {/* Drag Handle (View Mode Only) */}
      {!isEditing && (
        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 flex-shrink-0">
          <GripVertical size={14} />
        </div>
      )}

      {/* Type Selector/Icon */}
      <div className="relative group cursor-pointer p-1.5 rounded hover:bg-slate-100 flex-shrink-0" title={phone.type}>
        <TypeIcon />
        {isEditing && (
          <select 
            value={phone.type}
            onChange={(e) => handleTypeChange(e.target.value as PhoneType)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="Mobile">Mobile</option>
            <option value="Landline">Landline</option>
            <option value="Voip">Voip</option>
            <option value="Other">Other</option>
          </select>
        )}
      </div>

      {/* Number Display/Input */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={phone.number}
            onChange={handleTextChange}
            placeholder="(555) 000-0000"
            className={`w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${!isValid ? 'border-red-300 bg-red-50' : ''}`}
          />
        ) : (
          <div className={`text-sm ${getTextColor()}`}>{phone.number || 'No number'}</div>
        )}
      </div>

      {/* Status Date (View Mode) */}
      {!isEditing && phone.statusChangedDate && (
        <div className="w-20 text-right flex-shrink-0">
           <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap block">
             {formatDateMMDDYYYY(phone.statusChangedDate)}
           </span>
        </div>
      )}

      {/* Actions */}
      {isEditing ? (
        <button 
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete Number"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <div className="flex items-center gap-1 pl-2 border-l border-slate-200/50 flex-shrink-0">
          <button
            onClick={() => handleStatusChange('ATTEMPTED')}
            title="Mark Attempted"
            className={`p-1.5 rounded-full hover:bg-blue-100 transition-colors ${phone.status === 'ATTEMPTED' ? 'bg-blue-200 text-blue-700' : 'text-slate-300 hover:text-blue-600'}`}
          >
            <PhoneForwarded size={14} />
          </button>
          <button
            onClick={() => handleStatusChange('CORRECT')}
            title="Mark Correct"
            className={`p-1.5 rounded-full hover:bg-green-100 transition-colors ${phone.status === 'CORRECT' ? 'bg-green-200 text-green-700' : 'text-slate-300 hover:text-green-600'}`}
          >
            <CheckCircle2 size={14} />
          </button>
          <button
            onClick={() => handleStatusChange('WRONG')}
            title="Mark Wrong Number"
            className={`p-1.5 rounded-full hover:bg-orange-100 transition-colors ${phone.status === 'WRONG' ? 'bg-orange-200 text-orange-700' : 'text-slate-300 hover:text-orange-600'}`}
          >
            <XCircle size={14} />
          </button>
          <button
            onClick={() => handleStatusChange('DISCONNECTED')}
            title="Mark Disconnected"
            className={`p-1.5 rounded-full hover:bg-gray-200 transition-colors ${phone.status === 'DISCONNECTED' ? 'bg-gray-300 text-gray-700' : 'text-slate-300 hover:text-gray-600'}`}
          >
            <PhoneOff size={14} />
          </button>
          <button
            onClick={() => handleStatusChange('DNC')}
            title="Mark Do Not Call"
            className={`p-1.5 rounded-full hover:bg-red-100 transition-colors ${phone.status === 'DNC' ? 'bg-red-200 text-red-700' : 'text-slate-300 hover:text-red-600'}`}
          >
            <Ban size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneRow;