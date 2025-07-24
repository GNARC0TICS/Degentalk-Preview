import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@app/hooks/use-auth';

interface ProfileCardContextValue {
	currentUsername: string | null;
	setCurrentUsername: (username: string | null) => void;
	showOwnProfile: () => void;
}

const ProfileCardContext = createContext<ProfileCardContextValue | undefined>(undefined);

export const useProfileCard = () => {
	const ctx = useContext(ProfileCardContext);
	if (!ctx) throw new Error('useProfileCard must be used within a ProfileCardProvider');
	return ctx;
};

interface ProviderProps {
	children: ReactNode;
}

export const ProfileCardProvider: React.FC<ProviderProps> = ({ children }) => {
	const { user } = useAuth();
	const [currentUsername, setCurrentUsername] = useState<string | null>(user?.username ?? null);

	const showOwnProfile = useCallback(() => {
		if (user?.username) setCurrentUsername(user.username);
	}, [user?.username]);

	const value: ProfileCardContextValue = {
		currentUsername,
		setCurrentUsername,
		showOwnProfile
	};

	return <ProfileCardContext.Provider value={value}>{children}</ProfileCardContext.Provider>;
};
