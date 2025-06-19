import React, { useState } from 'react';
import { Modal, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dictionaryApi } from '../services/dictionaryApi';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils/generateSlug';
import { toast } from '@/components/ui/use-toast';

const FormSchema = z.object({
    word: z.string().min(2).max(50),
    definition: z.string().min(20).max(5000),
    usageExample: z.string().optional(),
    tags: z.string().optional() // comma separated
});

type FormState = z.infer<typeof FormSchema>;

interface Props {
    open: boolean;
    onClose: () => void;
}

export const AddWordModal: React.FC<Props> = ({ open, onClose }) => {
    const [form, setForm] = useState<FormState>({ word: '', definition: '', usageExample: '', tags: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return dictionaryApi.submit(data);
        },
        onSuccess: () => {
            toast({ description: '📖 Word submitted for review!' });
            queryClient.invalidateQueries(['dictionary', 'list']);
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
        const tagsArr = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
        mutation.mutate({
            ...result.data,
            tags: tagsArr,
            slug: generateSlug(form.word)
        });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader>Add a new definition</ModalHeader>
            <form onSubmit={handleSubmit}>
                <ModalContent>
                    <div className="space-y-4">
                        <Input
                            label="Word"
                            name="word"
                            value={form.word}
                            onChange={handleChange}
                            error={errors.word}
                            maxLength={50}
                        />
                        <Textarea
                            label="Definition"
                            name="definition"
                            value={form.definition}
                            onChange={handleChange}
                            rows={6}
                            error={errors.definition}
                        />
                        <Textarea
                            label="Usage Example (optional)"
                            name="usageExample"
                            value={form.usageExample}
                            onChange={handleChange}
                            rows={3}
                        />
                        <Input
                            label="Tags (comma separated)"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                        />
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isLoading}>
                        {mutation.isLoading ? 'Submitting…' : 'Submit'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
