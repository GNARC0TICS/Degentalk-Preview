import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './use-local-storage';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import debounce from 'lodash/debounce';

interface DraftData {
	id?: number;
	title?: string;
	content?: string;
	categoryId?: number;
	prefixId?: number;
	tags?: number[];
	lastSaved?: Date;
}

interface UseDraftOptions {
	key: string;
	autoSaveInterval?: number; // milliseconds
	enableCloudSync?: boolean;
	onAutoSave?: () => void;
}

export function useDraft({
	key,
	autoSaveInterval = 30000, // 30 seconds default
	enableCloudSync = true,
	onAutoSave
}: UseDraftOptions) {
	const { user } = useAuth();
	const { toast } = useToast();
	const [localDraft, setLocalDraft] = useLocalStorage<DraftData>(`draft-${key}`, {});
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const lastSavedRef = useRef<Date | null>(null);

	// Cloud sync mutation
	const saveDraftToCloud = useMutation({
		mutationFn: async (data: DraftData) => {
			if (!user || !enableCloudSync) return null;

			return apiRequest({
				url: '/api/forum/drafts',
				method: data.id ? 'PUT' : 'POST',
				data: {
					...data,
					key
				}
			});
		},
		onSuccess: (response) => {
			if (response?.id) {
				setLocalDraft((prev) => ({ ...prev, id: response.id }));
			}
			lastSavedRef.current = new Date();
			setIsDirty(false);
		},
		onError: (error) => {
			console.error('Failed to save draft to cloud:', error);
			// Still mark as saved locally
			lastSavedRef.current = new Date();
			setIsDirty(false);
		}
	});

	// Load cloud draft on mount
	useEffect(() => {
		if (!user || !enableCloudSync) return;

		const loadCloudDraft = async () => {
			try {
				const response = await apiRequest<DraftData>({
					url: `/api/forum/drafts/${key}`,
					method: 'GET'
				});

				if (response && Object.keys(response).length > 0) {
					// Cloud draft exists, prompt user
					const useCloud = window.confirm(
						'A saved draft was found in the cloud. Would you like to restore it?'
					);

					if (useCloud) {
						setLocalDraft(response);
						toast({
							title: 'Draft restored',
							description: 'Your previous work has been restored.',
							variant: 'default'
						});
					}
				}
			} catch (error) {
				// No cloud draft or error loading it
				console.log('No cloud draft found or error loading:', error);
			}
		};

		loadCloudDraft();
	}, [user, enableCloudSync, key]);

	// Debounced save function
	const debouncedSave = useCallback(
		debounce((data: DraftData) => {
			setIsSaving(true);

			// Save to localStorage immediately
			setLocalDraft(data);

			// Save to cloud if enabled
			if (enableCloudSync && user) {
				saveDraftToCloud.mutate(data);
			} else {
				lastSavedRef.current = new Date();
				setIsDirty(false);
			}

			setIsSaving(false);
			onAutoSave?.();
		}, 2000),
		[enableCloudSync, user, onAutoSave]
	);

	// Update draft
	const updateDraft = useCallback(
		(updates: Partial<DraftData>) => {
			const newDraft = { ...localDraft, ...updates };
			setLocalDraft(newDraft);
			setIsDirty(true);
			debouncedSave(newDraft);
		},
		[localDraft, debouncedSave]
	);

	// Clear draft
	const clearDraft = useCallback(async () => {
		// Clear local storage
		setLocalDraft({});
		setIsDirty(false);

		// Delete from cloud if it exists
		if (localDraft.id && enableCloudSync && user) {
			try {
				await apiRequest({
					url: `/api/forum/drafts/${localDraft.id}`,
					method: 'DELETE'
				});
			} catch (error) {
				console.error('Failed to delete cloud draft:', error);
			}
		}
	}, [localDraft.id, enableCloudSync, user, setLocalDraft]);

	// Auto-save interval
	useEffect(() => {
		if (!isDirty || !autoSaveInterval) return;

		const interval = setInterval(() => {
			if (isDirty && localDraft && Object.keys(localDraft).length > 0) {
				debouncedSave(localDraft);
			}
		}, autoSaveInterval);

		return () => clearInterval(interval);
	}, [isDirty, localDraft, autoSaveInterval, debouncedSave]);

	// Warn before leaving with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isDirty && Object.keys(localDraft).length > 0) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty, localDraft]);

	return {
		draft: localDraft,
		updateDraft,
		clearDraft,
		isDirty,
		isSaving,
		lastSaved: lastSavedRef.current,
		hasDraft: Object.keys(localDraft).length > 0
	};
}
