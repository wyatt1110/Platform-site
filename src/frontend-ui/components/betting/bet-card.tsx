'use client';

import { useState } from 'react';
import { Edit, Trash2, Calendar, CheckCircle2, X, CircleDot, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useTheme } from '@/components/providers';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

// Type for the bet object
interface Bet {
  bet_id: string;
  track_name: string;
  race_number: string | null;
  horse_name: string | null;
  jockey: string | null;
  trainer: string | null;
  race_distance: string | null; 
  race_type: string | null;
  created_at: string;
  user_id: string;
  scheduled_race_time: string | null;
  bet_type: string;
  stake: number;
  odds: number;
  each_way: boolean | null;
  status: string;
  bookmaker: string | null;
  model: string | null;
  notes: string | null;
  updated_at: string;
  returns: number | null;
  profit_loss: number | null;
  race_date: string | null;
  horses: { name: string; race_number?: string; venue?: string; odds: number }[];
}

// Component props
interface PendingBetCardProps {
  bet: Bet;
  onRefresh: () => void;
  onEdit: () => void;
}

// Format number helper function without currency symbols
const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
  }).format(amount);
};

// Format horse name with proper formatting
const formatHorseName = (name: string | null) => {
  if (!name) return 'Unknown Horse';
  
  // Replace '/' with '&' and capitalize each part
  const formattedName = name
    .split('/')
    .map(part => part.trim().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' '))
    .join(' & ');
  
  return formattedName.length > 26 ? `${formattedName.substring(0, 23)}...` : formattedName;
};

// Format track name with proper formatting
const formatTrackName = (name: string | null) => {
  if (!name) return 'Unknown Track';
  
  // Replace '/' with '&' and capitalize each part
  return name
    .split('/')
    .map(part => part.trim().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' '))
    .join(' & ');
};

// Horse icon SVG component
const HorseIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="24" 
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 4.5V3.5C21 2.95 20.55 2.5 20 2.5H19C17.97 2.5 16.94 2.54 16 2.66C15.79 2.79 15.69 3.04 15.81 3.26C16.18 3.83 16.4 4.53 16.4 5.07C16.4 7.37 13.94 7.99 13.4 8.08M10 8.5L7 7.5M7 7.5L4 8.5M7 7.5C7 7.5 7 3.5 12 3.5C15 3.5 16.5 5.5 16.5 5.5" stroke="#3B82F6" />
    <path d="M7 7.5V15.5C7 17.99 9 20.5 12 20.5C15 20.5 17 17.99 17 15.5V9.5" stroke="#3B82F6" />
    <path d="M20.5 9.5C20.5 9.5 18.5 11.5 18.5 15.5" stroke="#3B82F6" />
    <path d="M20.4 9.5C20.4 9.5 22.5 12 21 17.5" stroke="#3B82F6" />
    <path d="M8 17L6 19.5" stroke="#3B82F6" />
    <path d="M16 17L17.5 19.5" stroke="#3B82F6" />
  </svg>
);

export default function PendingBetCard({ bet, onRefresh, onEdit }: PendingBetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme } = useTheme();
  
  // Format scheduled race time if available
  const formattedTime = bet.scheduled_race_time 
    ? new Date(bet.scheduled_race_time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    : '';
  
  const getCardBg = () => theme === 'dark' ? 'bg-gray-800' : theme === 'racing' ? 'bg-charcoal-800' : 'bg-white';
  const getBorderColor = () => theme === 'dark' ? 'border-gray-700' : theme === 'racing' ? 'border-charcoal-700' : 'border-gray-100';
  const getTextColor = () => theme === 'dark' || theme === 'racing' ? 'text-white' : 'text-gray-900';
  const getMutedTextColor = () => theme === 'dark' ? 'text-gray-400' : theme === 'racing' ? 'text-gray-300' : 'text-gray-500';
  const getProfitColor = (amount: number) => amount >= 0 ? 'text-green-500' : 'text-red-500';
  
  // Get status display value and color
  const getStatusInfo = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase().trim();
    
    // Check for pending status only
    if (normalizedStatus === 'pending') {
      return {
        display: 'Pending',
        color: 'yellow',
        rgbColor: theme === 'dark' ? '234, 179, 8' : '234, 179, 8', // Yellow
        bgClass: 'bg-yellow-500',
        borderClass: 'border-yellow-500'
      };
    }
    // Check for placed status
    else if (normalizedStatus === 'placed' || normalizedStatus === 'open') {
      return {
        display: 'Placed',
        color: 'blue',
        rgbColor: theme === 'dark' ? '59, 130, 246' : '59, 130, 246', // Blue
        bgClass: 'bg-blue-500',
        borderClass: 'border-blue-500'
      };
    }
    // Check for won status
    else if (normalizedStatus === 'won' || normalizedStatus === 'win') {
      return {
        display: 'Won',
        color: 'green',
        rgbColor: theme === 'dark' ? '34, 197, 94' : '34, 197, 94', // Green
        bgClass: 'bg-green-500',
        borderClass: 'border-green-500'
      };
    } 
    // Lost status
    else if (normalizedStatus === 'lost' || normalizedStatus === 'lose') {
      return {
        display: 'Lost',
        color: 'red',
        rgbColor: theme === 'dark' ? '239, 68, 68' : '239, 68, 68', // Red
        bgClass: 'bg-red-500',
        borderClass: 'border-red-500'
      };
    }
    // Void status
    else if (normalizedStatus === 'void' || normalizedStatus === 'voided') {
      return {
        display: 'Void',
        color: 'gray',
        rgbColor: theme === 'dark' ? '156, 163, 175' : '156, 163, 175', // Gray
        bgClass: 'bg-gray-500',
        borderClass: 'border-gray-500'
      };
    }
    // Default status (unknown)
    else {
      return {
        display: status || 'Unknown',
        color: 'gray',
        rgbColor: theme === 'dark' ? '156, 163, 175' : '156, 163, 175', // Gray
        bgClass: 'bg-gray-500',
        borderClass: 'border-gray-400'
      };
    }
  };

  // Get status info
  const statusInfo = getStatusInfo(bet.status);
  
  // Get border color based on bet status
  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' ? 'border-yellow-400' : 'border-yellow-500';
      case 'won':
        return theme === 'dark' ? 'border-green-400' : 'border-green-500';
      case 'lost':
        return theme === 'dark' ? 'border-red-400' : 'border-red-500';
      default:
        return getBorderColor();
    }
  };
  
  // Get neon glow effect based on bet status
  const getStatusGlowEffect = (status: string) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' 
          ? '0 0 10px 2px rgba(234, 179, 8, 0.7), 0 0 15px 5px rgba(234, 179, 8, 0.4)' 
          : '0 0 10px 2px rgba(234, 179, 8, 0.6), 0 0 15px 5px rgba(234, 179, 8, 0.3)';
      case 'won':
        return theme === 'dark' 
          ? '0 0 10px 2px rgba(34, 197, 94, 0.7), 0 0 15px 5px rgba(34, 197, 94, 0.4)' 
          : '0 0 10px 2px rgba(34, 197, 94, 0.6), 0 0 15px 5px rgba(34, 197, 94, 0.3)';
      case 'lost':
        return theme === 'dark' 
          ? '0 0 10px 2px rgba(239, 68, 68, 0.7), 0 0 15px 5px rgba(239, 68, 68, 0.4)' 
          : '0 0 10px 2px rgba(239, 68, 68, 0.6), 0 0 15px 5px rgba(239, 68, 68, 0.3)';
      default:
        return 'none';
    }
  };
  
  // Enhanced hover glow effect
  const getHoverGlowEffect = (status: string) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), 0 0 20px 5px rgba(234, 179, 8, 0.7)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 20px 5px rgba(234, 179, 8, 0.5)';
      case 'won':
        return theme === 'dark' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), 0 0 20px 5px rgba(34, 197, 94, 0.7)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 20px 5px rgba(34, 197, 94, 0.5)';
      case 'lost':
        return theme === 'dark' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), 0 0 20px 5px rgba(239, 68, 68, 0.7)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 20px 5px rgba(239, 68, 68, 0.5)';
      default:
        return theme === 'dark' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    }
  };
  
  // Handle deleting a bet
  const handleDelete = async () => {
    if (!bet.bet_id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('racing_bets')
        .delete()
        .eq('bet_id', bet.bet_id);
        
      if (error) throw error;
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting bet:', error);
      alert('Failed to delete bet');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Get outcome summary based on status
  const getOutcomeSummary = () => {
    if (bet.status === 'pending') return null;
    
    const profitLoss = bet.profit_loss || 0;
    const prefix = profitLoss >= 0 ? '+' : '';
    
    return (
      <div className="flex items-center mt-1">
        <span className={`text-xs font-medium ${getProfitColor(profitLoss)}`}>
          {prefix}£{Math.abs(profitLoss).toFixed(2)}
        </span>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.03, 
        y: -5,
        boxShadow: `0 10px 15px -3px rgba(0, 0, 0, ${theme === 'dark' ? '0.4' : '0.1'}), 
                    0 4px 6px -2px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.05'}), 
                    0 0 20px 5px rgba(${statusInfo.rgbColor}, ${theme === 'dark' ? '0.6' : '0.4'})` 
      }}
      transition={{ 
        duration: 0.2,
        ease: "easeOut"
      }}
      className={`
        flex flex-col 
        w-full h-full 
        relative z-10
        rounded-lg overflow-hidden
        ${statusInfo.borderClass} border-1
        ${getCardBg()}
        cursor-pointer
      `}
      style={{ 
        maxWidth: "288px",
        boxShadow: `0 0 10px 1px rgba(${statusInfo.rgbColor}, 0.3), 0 0 15px 4px rgba(${statusInfo.rgbColor}, 0.15)`,
      }}
    >
      {/* Header */}
      <div 
        className={`
          flex justify-between items-center p-3
          ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-100'}
        `}
      >
        <div className="flex items-center flex-1 pr-2 overflow-hidden">
          <HorseIcon className={`h-4 w-4 mr-1.5 flex-shrink-0 ${getMutedTextColor()}`} />
          <span 
            className={`
              font-medium text-sm truncate
              ${getTextColor()}
            `}
          >
            {bet.horses && bet.horses.length > 0 
              ? formatHorseName(bet.horses[0].name) 
              : formatHorseName(bet.horse_name || '')}
          </span>
        </div>
        
        <div className="flex items-center space-x-1.5">
          {/* Status badge */}
          <span className={`px-2 py-0.5 ${statusInfo.bgClass} text-white text-xs rounded flex items-center`}>
            {statusInfo.display}
          </span>
        </div>
      </div>
      
      {/* Body */}
      <div className="flex flex-col flex-grow p-3">
        {/* Venue and Race info */}
        <div className="flex justify-between mb-3">
          <div className="flex flex-col">
            <span 
              className={`
                font-bold text-sm
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}
            >
              {formatTrackName(bet.track_name)}
            </span>
            <span 
              className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
              `}
            >
              {formattedTime}
            </span>
          </div>
          
          {/* Bet type badge */}
          <span 
            className={`
              px-2 py-0.5 text-xs rounded h-fit
              ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
            `}
          >
            {bet.bet_type}{bet.each_way ? ' (E/W)' : ''}
          </span>
        </div>
        
        {/* Financial info */}
        <div className="flex justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Stake:</span>
            <span className={`font-medium text-sm ${getTextColor()}`}>
              {formatNumber(bet.stake)}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">Odds:</span>
            <span className={`font-medium text-sm ${getTextColor()}`}>
              {bet.odds.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Additional data fields */}
        {bet.bookmaker && (
          <div className="flex justify-between mb-3">
            <span className="text-xs text-gray-500">Bookmaker:</span>
            <span className={`text-xs font-medium ${getTextColor()}`}>{bet.bookmaker}</span>
          </div>
        )}
        
        {/* Outcome summary for settled bets */}
        {bet.status !== "pending" && bet.profit_loss !== null && (
          <div className="mt-1 mb-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Returns:</span>
              <span className={`text-sm font-medium ${getTextColor()}`}>
                {formatNumber(bet.returns || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Profit/Loss:</span>
              <span className={`text-sm font-medium ${getProfitColor(bet.profit_loss)}`}>
                {bet.profit_loss >= 0 ? '+' : ''}{formatNumber(Math.abs(bet.profit_loss))}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div 
        className={`
          flex justify-between p-2.5
          ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-100'}
        `}
      >
        <div className="flex items-center space-x-1.5">
          {/* Edit button */}
          {onEdit && (
            <button
              onClick={() => onEdit()}
              className={`
                p-1.5 rounded
                ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
              `}
              title="Edit bet"
            >
              <Edit className={`w-3.5 h-3.5 ${getMutedTextColor()}`} />
            </button>
          )}
          
          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`
              p-1.5 rounded
              ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
              ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title="Delete bet"
          >
            <Trash2 className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
          </button>
        </div>
        
        {bet.status === "pending" && onRefresh && (
          <div className="flex space-x-2">
            <button
              onClick={() => onRefresh()}
              className="px-2.5 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Mark Won
            </button>
            
            <button
              onClick={() => onRefresh()}
              className="px-2.5 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Mark Lost
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
} 