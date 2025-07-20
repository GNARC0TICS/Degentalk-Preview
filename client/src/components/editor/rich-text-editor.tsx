import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Mention from '@tiptap/extension-mention';
// Temporarily disabled for build test
// import suggestion from './suggestion.ts';
const lowlight = createLowlight(common);
import { Button } from '@/components/ui/button';
import { GifPicker } from './gif-picker';
import { EnhancedGifPicker } from './enhanced-gif-picker';
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Code,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Link as LinkIcon,
	Image as ImageIcon,
	RotateCcw,
	RotateCw,
	Smile,
	Code2,
	Palette,
	Sticker,
	AtSign
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { cn } from '@/utils/utils';

export interface RichTextEditorProps {
	content?: string;
	onChange?: (html: string, json: Record<string, unknown>) => void;
	placeholder?: string;
	readOnly?: boolean;
	autoFocus?: boolean;
	editorClass?: string;
	userLevel?: number;
	userRoles?: string[];
	featurePermissions?: {
		[key: string]: boolean;
	};
	onSaveDraft?: (html: string, json: Record<string, unknown>) => void;
}

// Feature -> level mapping, can be overridden by featurePermissions prop
const defaultFeatureLevels = {
	basic_formatting: 1, // Bold, italic, underline
	images: 4,
	gifs: 5,
	link_embeds: 3,
	custom_emojis: 2,
	colored_text: 6,
	code_blocks: 7,
	mentions: 2
};

// Map features to role overrides - users with these roles can use features regardless of level
const defaultRoleOverrides = {
	images: ['mod', 'admin'],
	gifs: ['mod', 'admin'],
	link_embeds: ['mod', 'admin'],
	custom_emojis: ['mod', 'admin'],
	colored_text: ['mod', 'admin'],
	code_blocks: ['developer', 'mod', 'admin'],
	mentions: ['mod', 'admin']
};

export function RichTextEditor({
	content = '',
	onChange,
	placeholder = 'Write something...',
	readOnly = false,
	autoFocus = false,
	editorClass = '',
	userLevel = 1,
	userRoles = [],
	featurePermissions,
	onSaveDraft
}: RichTextEditorProps) {
	const [isMounted, setIsMounted] = useState(false);

	// Check if a feature is available to the current user
	const canUseFeature = useCallback(
		(featureName: string) => {
			// If explicitly provided feature permissions, use those
			if (featurePermissions && featurePermissions[featureName] !== undefined) {
				return featurePermissions[featureName];
			}

			// Check role overrides first
			const roleOverrides = defaultRoleOverrides[featureName as keyof typeof defaultRoleOverrides];
			if (roleOverrides && roleOverrides.some((role) => userRoles.includes(role))) {
				return true;
			}

			// If no role override, check level requirements
			const requiredLevel = defaultFeatureLevels[featureName as keyof typeof defaultFeatureLevels];
			return userLevel >= requiredLevel;
		},
		[featurePermissions, userLevel, userRoles]
	);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3]
				}
			}),
			Underline,
			Link.configure({
				openOnClick: true,
				autolink: true
			}),
			Placeholder.configure({
				placeholder
			}),
			TextStyle,
			FontFamily,
			Color,
			TextAlign.configure({
				types: ['heading', 'paragraph']
			}),
			canUseFeature('code_blocks')
				? CodeBlockLowlight.configure({
						lowlight,
						languageClassPrefix: 'language-',
						HTMLAttributes: {
							class: 'hljs bg-zinc-900 text-zinc-200 p-4 rounded-md overflow-auto'
						}
					})
				: null,
			canUseFeature('images') ? Image : null
			// Mention.configure({
			//	HTMLAttributes: {
			//		class: 'mention'
			//	},
			//	suggestion
			// })
		].filter(Boolean) as any,
		content,
		editable: !readOnly,
		autofocus: autoFocus,
		onUpdate: ({ editor }) => {
			if (onChange) {
				onChange(editor.getHTML(), editor.getJSON());
			}
		}
	});

	// Auto-save draft
	useEffect(() => {
		if (!editor || !onSaveDraft) return;

		const interval = setInterval(() => {
			onSaveDraft(editor.getHTML(), editor.getJSON());
		}, 10000); // Save every 10 seconds

		return () => clearInterval(interval);
	}, [editor, onSaveDraft]);

	// Handle initial mount
	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	// Button for showing a feature that requires higher level
	const LockedFeatureButton = ({
		feature,
		icon,
		requiredLevel
	}: {
		feature: string;
		icon: React.ReactNode;
		requiredLevel: number;
	}) => (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground opacity-50 cursor-not-allowed"
					>
						{icon}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>
						Unlock at Level {requiredLevel} to use {feature}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);

	if (!editor) {
		return null;
	}

	const mentionButton = canUseFeature('mentions') ? (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().insertContent('@').run()}
						className="hover:bg-zinc-700"
					>
						<AtSign className="h-4 w-4 text-white" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Mention a user</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	) : (
		<LockedFeatureButton
			feature="Mentions"
			icon={<AtSign className="h-4 w-4 text-white" />}
			requiredLevel={2}
		/>
	);

	const mentionStyles = `
    .ProseMirror .mention {
      background-color: rgba(#375A7F, 0.1);
      color: #375A7F;
      font-weight: bold;
      border-radius: 0.25rem;
      padding: 0.125rem 0.25rem;
      white-space: nowrap;
    }
    
    .ProseMirror .mention:hover {
      background-color: rgba(#375A7F, 0.2);
    }
  `;

	return (
		<div className="rich-text-editor-wrapper rounded-md border border-zinc-700">
			<div className="toolbar flex flex-wrap gap-1 p-1 border-b border-b-zinc-700 bg-zinc-800 text-black rounded-t-md">
				{/* Basic formatting - always available */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive('bold') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<Bold className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive('italic') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<Italic className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					className={editor.isActive('underline') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<UnderlineIcon className="h-4 w-4 text-white" />
				</Button>

				<div className="border-r border-zinc-600 mx-1 h-6" />

				{/* Headings */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					className={editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<Heading1 className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					className={editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<Heading2 className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					className={editor.isActive('heading', { level: 3 }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<Heading3 className="h-4 w-4 text-white" />
				</Button>

				<div className="border-r border-zinc-600 mx-1 h-6" />

				{/* Lists */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive('bulletList') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<List className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive('orderedList') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<ListOrdered className="h-4 w-4 text-white" />
				</Button>

				<div className="border-r border-zinc-600 mx-1 h-6" />

				{/* Alignment */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign('left').run()}
					className={editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<AlignLeft className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign('center').run()}
					className={editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<AlignCenter className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign('right').run()}
					className={editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
				>
					<AlignRight className="h-4 w-4 text-white" />
				</Button>

				<div className="border-r border-zinc-600 mx-1 h-6" />

				{/* Font Selection */}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Select
								onValueChange={(value) => {
									if (editor.can().setFontFamily(value)) {
										editor.chain().focus().setFontFamily(value).run();
									} else if (value === 'Inter' && editor.can().unsetFontFamily()) {
										editor.chain().focus().unsetFontFamily().run();
									}
								}}
								value={editor.getAttributes('textStyle').fontFamily || ''}
							>
								<SelectTrigger className="h-8 w-20 bg-zinc-800 border-zinc-700 text-white text-xs">
									<SelectValue placeholder="Font" />
								</SelectTrigger>
								<SelectContent className="bg-zinc-800 border border-zinc-700 text-white">
									<SelectItem value="Inter">Inter</SelectItem>
									<SelectItem value="Arial">Arial</SelectItem>
									<SelectItem value="Georgia">Georgia</SelectItem>
									<SelectItem value="monospace">Monospace</SelectItem>
									<SelectItem value="cursive">Cursive</SelectItem>
								</SelectContent>
							</Select>
						</TooltipTrigger>
						<TooltipContent>
							<p>Change font</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="border-r border-zinc-600 mx-1 h-6" />

				{/* Color text - Level 6+ */}
				{canUseFeature('colored_text') ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center">
									<Button
										variant="ghost"
										size="sm"
										className="p-0 h-8 w-8 relative hover:bg-zinc-700"
									>
										<Palette className="h-4 w-4 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
										<input
											type="color"
											value="#000000"
											onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
											className="opacity-0 w-full h-full cursor-pointer"
										/>
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Change text color</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<LockedFeatureButton
						feature="Colored Text"
						icon={<Palette className="h-4 w-4 text-white" />}
						requiredLevel={defaultFeatureLevels.colored_text}
					/>
				)}

				{/* Link insertion - Level 3+ */}
				{canUseFeature('link_embeds') ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										const url = window.prompt('Enter URL');
										if (url) {
											editor.chain().focus().setLink({ href: url }).run();
										}
									}}
									className={editor.isActive('link') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
								>
									<LinkIcon className="h-4 w-4 text-white" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Insert link</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<LockedFeatureButton
						feature="Links"
						icon={<LinkIcon className="h-4 w-4 text-white" />}
						requiredLevel={defaultFeatureLevels.link_embeds}
					/>
				)}

				{/* Image upload - Level 4+ */}
				{canUseFeature('images') ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										const url = window.prompt('Enter image URL');
										if (url) {
											editor.chain().focus().setImage({ src: url }).run();
										}
									}}
									className={editor.isActive('image') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
								>
									<ImageIcon className="h-4 w-4 text-white" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Insert image</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<LockedFeatureButton
						feature="Images"
						icon={<ImageIcon className="h-4 w-4 text-white" />}
						requiredLevel={defaultFeatureLevels.images}
					/>
				)}

				{/* GIF insertion */}
				{canUseFeature('gifs') ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										// Show the GIF Picker dialog
										const dialog = document.createElement('dialog');
										dialog.className =
											'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
										dialog.style.width = '100vw';
										dialog.style.height = '100vh';
										dialog.style.maxWidth = '100%';
										dialog.style.maxHeight = '100%';
										dialog.style.border = 'none';
										dialog.style.padding = '0';
										dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

										const container = document.createElement('div');
										container.className =
											'bg-zinc-900 rounded-lg shadow-lg p-4 w-full max-w-lg max-h-[80vh] overflow-auto';

										// Create a React root and render the EnhancedGifPicker
										const root = ReactDOM.createRoot(container);
										root.render(
											<EnhancedGifPicker
												onSelect={(gifUrl) => {
													editor.chain().focus().setImage({ src: gifUrl }).run();
													dialog.close();
													// Clean up React root
													root.unmount();
													document.body.removeChild(dialog);
												}}
												onClose={() => {
													dialog.close();
													// Clean up React root
													root.unmount();
													document.body.removeChild(dialog);
												}}
												isDialog={false}
											/>
										);

										dialog.appendChild(container);
										document.body.appendChild(dialog);
										dialog.showModal();

										// Add click handler to close dialog when clicking outside
										dialog.addEventListener('click', (e) => {
											if (e.target === dialog) {
												dialog.close();
												root.unmount();
												document.body.removeChild(dialog);
											}
										});
									}}
									className="hover:bg-zinc-700"
								>
									<Sticker className="h-4 w-4 text-white" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Insert GIF</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<LockedFeatureButton
						feature="GIFs"
						icon={<Sticker className="h-4 w-4 text-white" />}
						requiredLevel={defaultFeatureLevels.gifs}
					/>
				)}

				{/* Code block - Level 7+ */}
				{canUseFeature('code_blocks') ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => editor.chain().focus().toggleCodeBlock().run()}
									className={editor.isActive('codeBlock') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
								>
									<Code2 className="h-4 w-4 text-white" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Insert code block</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<LockedFeatureButton
						feature="Code Blocks"
						icon={<Code2 className="h-4 w-4 text-white" />}
						requiredLevel={defaultFeatureLevels.code_blocks}
					/>
				)}

				{/* Custom emojis - Level 2+ */}
				{canUseFeature('custom_emojis') ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										// TO DO: Implement emoji picker
										alert('Emoji picker coming soon!');
									}}
									className="hover:bg-zinc-700"
								>
									<Smile className="h-4 w-4 text-white" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Insert emoji</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<LockedFeatureButton
						feature="Custom Emojis"
						icon={<Smile className="h-4 w-4 text-white" />}
						requiredLevel={defaultFeatureLevels.custom_emojis}
					/>
				)}

				<div className="border-r border-zinc-600 mx-1 h-6" />

				{/* Undo/Redo */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
					className="hover:bg-zinc-700"
				>
					<RotateCcw className="h-4 w-4 text-white" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
					className="hover:bg-zinc-700"
				>
					<RotateCw className="h-4 w-4 text-white" />
				</Button>

				{/* Mentions */}
				{mentionButton}
			</div>

			<EditorContent
				editor={editor}
				className={cn(
					'prose prose-invert max-w-none p-4 focus:outline-none focus:ring-0 min-h-[200px] bg-zinc-900/50 text-white border border-zinc-700 rounded-b-md',
					'[&_.ProseMirror]:bg-transparent [&_.ProseMirror]:text-white [&_.ProseMirror]:outline-none',
					'[&_.ProseMirror_p]:text-white [&_.ProseMirror_h1]:text-white [&_.ProseMirror_h2]:text-white',
					'[&_.ProseMirror_strong]:text-white [&_.ProseMirror_em]:text-white',
					editorClass
				)}
			/>

			{/* Bubble menu for quick formatting */}
			{editor && (
				<BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
					<div className="bg-zinc-800 rounded-md shadow-md border border-zinc-700 flex overflow-hidden">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().toggleBold().run()}
							className={editor.isActive('bold') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
						>
							<Bold className="h-4 w-4 text-white" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().toggleItalic().run()}
							className={editor.isActive('italic') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
						>
							<Italic className="h-4 w-4 text-white" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().toggleUnderline().run()}
							className={editor.isActive('underline') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
						>
							<UnderlineIcon className="h-4 w-4 text-white" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().toggleCode().run()}
							className={editor.isActive('code') ? 'bg-zinc-700' : 'hover:bg-zinc-700'}
						>
							<Code className="h-4 w-4 text-white" />
						</Button>
					</div>
				</BubbleMenu>
			)}

			{/* Add this style tag to the component right before the EditorContent */}
			<style dangerouslySetInnerHTML={{ __html: mentionStyles }} />
		</div>
	);
}

export default RichTextEditor;
