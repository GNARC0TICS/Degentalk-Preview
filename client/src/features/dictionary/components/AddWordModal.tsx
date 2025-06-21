import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dictionaryApi } from '../services/dictionaryApi';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils/generateSlug';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const FormSchema = z.object({
	word: z.string().min(2).max(50),
	definition: z.string().min(20).max(5000),
	usageExample: z.string().optional(),
	tags: z.string().optional() // comma separated
});

type FormState = z.infer<typeof FormSchema>;

interface WordSubmission extends Omit<FormState, 'tags'> {
	tags: string[];
	slug: string;
}

interface Props {
	open: boolean;
	onClose: () => void;
}

export const AddWordModal: React.FC<Props> = ({ open, onClose }) => {
	const [form, setForm] = useState<FormState>({
		word: '',
		definition: '',
		usageExample: '',
		tags: ''
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const queryClient = useQueryClient();

	const { toast } = useToast();
	const mutation = useMutation({
		mutationFn: async (data: WordSubmission) => {
			return dictionaryApi.submit(data);
		},
		onSuccess: () => {
			toast({ description: '📖 Word submitted for review!' });
			queryClient.invalidateQueries({ queryKey: ['dictionary', 'list'] });
			onClose();
			setForm({ word: '', definition: '', usageExample: '', tags: '' });
		}
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = FormSchema.safeParse(form);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			result.error.errors.forEach((err) => {
				if (err.path[0]) fieldErrors[err.path[0]] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}
		setErrors({});
		const tagsArr = form.tags
			? form.tags
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean)
			: [];
		mutation.mutate({
			...result.data,
			tags: tagsArr,
			slug: generateSlug(form.word)
		});
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>Add a new definition</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="word">Word</Label>
							<Input
								id="word"
								name="word"
								value={form.word}
								onChange={handleChange}
								maxLength={50}
							/>
							{errors.word && <p className="text-sm text-red-500">{errors.word}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="definition">Definition</Label>
							<Textarea
								id="definition"
								name="definition"
								value={form.definition}
								onChange={handleChange}
								rows={6}
							/>
							{errors.definition && <p className="text-sm text-red-500">{errors.definition}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="usageExample">Usage Example (optional)</Label>
							<Textarea
								id="usageExample"
								name="usageExample"
								value={form.usageExample}
								onChange={handleChange}
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tags">Tags (comma separated)</Label>
							<Input id="tags" name="tags" value={form.tags} onChange={handleChange} />
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
							Cancel
						</Button>
						<Button type="submit" disabled={mutation.isPending}>
							{mutation.isPending ? 'Submitting…' : 'Submit'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
