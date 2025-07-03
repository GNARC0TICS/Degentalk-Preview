import React from 'react';
import Editor from '@monaco-editor/react';

export interface JsonEditorProps {
	value: string;
	onChange: (next: string) => void;
	height?: string | number;
	className?: string;
	readOnly?: boolean;
	/** Array of error messages to display above the editor */
	errors?: string[];
}

/**
 * Thin wrapper around Monaco Editor configured for JSON editing.
 */
export const JsonEditor: React.FC<JsonEditorProps> = ({
	value,
	onChange,
	height = '50vh',
	className,
	readOnly,
	errors
}) => {
	return (
		<div className={className}>
			{errors && errors.length > 0 && (
				<ul className="mb-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700 space-y-1">
					{errors.map((e, idx) => (
						<li key={idx}>{e}</li>
					))}
				</ul>
			)}
			<Editor
				defaultLanguage="json"
				language="json"
				theme="vs-dark"
				value={value}
				onChange={(val) => onChange(val ?? '')}
				height={height}
				options={{
					minimap: { enabled: false },
					readOnly: readOnly || false,
					fontSize: 13,
					tabSize: 2
				}}
			/>
		</div>
	);
};

export default JsonEditor;
