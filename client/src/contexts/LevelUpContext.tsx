import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
	useEffect
} from 'react';
import LevelUpModal from '@/components/xp/LevelUpModal';
import { setupLevelUpListener } from '@/utils/queryClient';

// Types
interface Reward {
	type: 'badge' | 'title' | 'feature' | 'dgt';
	name: string;
	description?: string;
	icon?: React.ReactNode;
}

interface LevelUpContextType {
	showLevelUp: (level: number, title?: string, rewards?: Reward[]) => void;
}

// Create context with default values
const LevelUpContext = createContext<LevelUpContextType>({
	showLevelUp: () => {}
});

// Custom hook to use the level up context
export const useLevelUp = () => useContext(LevelUpContext);

// Provider component
export const LevelUpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [levelData, setLevelData] = useState({
		level: 1,
		title: '',
		rewards: [] as Reward[]
	});

	// Show the level up modal
	const showLevelUp = useCallback((level: number, title?: string, rewards?: Reward[]) => {
		setLevelData({
			level,
			title: title || '',
			rewards: rewards || []
		});
		setIsOpen(true);
	}, []);

	// Close the modal
	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	// Set up level up event listener
	useEffect(() => {
		// Setup the level up event listener
		const cleanup = setupLevelUpListener(showLevelUp);
		return cleanup;
	}, [showLevelUp]);

	return (
		<LevelUpContext.Provider value={{ showLevelUp }}>
			{children}

			{/* Level Up Modal */}
			<LevelUpModal
				isOpen={isOpen}
				onClose={handleClose}
				level={levelData.level}
				title={levelData.title}
				rewards={levelData.rewards}
			/>
		</LevelUpContext.Provider>
	);
};

export default LevelUpProvider;
