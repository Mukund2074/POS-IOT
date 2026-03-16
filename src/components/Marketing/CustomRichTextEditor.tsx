/**
 * CustomRichTextEditor - A completely custom rich text editor built from scratch
 * No external libraries - uses contentEditable and native browser APIs
 *
 * Features:
 * - Text formatting: size (8-72px), color, bold, italic, underline
 * - Paragraph formatting: bullet list, numbered list
 * - Alignment: left, center, right
 * - Links and buttons with custom styling
 * - Image inserter with upload support
 *
 * All output HTML uses inline styles only (no CSS classes)
 */

import React, { useRef, useEffect, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { t } from 'i18next';
import { toast } from 'react-toastify';
// @ts-ignore - interCeptor.js doesn't have type definitions
import apiFetcher from '@/utils/interCeptor';
import { cnMerge } from '@/utils/cnMerge';
import { RadixDialog, RadixInput, RadixButton, RadixDropdown } from '@/components/radix';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
// import {
//     ImageIcon,
//     HTMLIcon,
//     LinkIcon,
//     TextSizeIcon,
//     BoldIcon,
//     ItalicIcon,
//     UnderlineIcon,
//     TextColorIcon,
//     BulletListIcon,
//     NumberedListIcon,
// } from '@/assets/Marketing/quill';

import {
    ImageIconPng,
    HTMLIconPng,
    LinkIconPng,
    TextSizeIconPng,
    BoldIconPng,
    ItalicIconPng,
    UnderlineIconPng,
    TextColorIconPng,
    BulletListIconPng,
    NumberedListIconPng,
} from '@/assets/Marketing/quill';

export interface CustomRichTextEditorProps {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    disabled?: boolean;
    className?: string;
    /** When false, toolbar and HTML view are hidden (e.g. for SMS content) */
    showToolbar?: boolean;
}

export interface CustomRichTextEditorHandle {
    insertTextAtCursor: (text: string) => void;
}

const CustomRichTextEditor = forwardRef<CustomRichTextEditorHandle, CustomRichTextEditorProps>(
    function CustomRichTextEditor(
        {
            value = '',
            onChange,
            placeholder = t('Marketing.EnterContent'),
            readOnly = false,
            disabled = false,
            className,
            showToolbar = true,
        },
        ref,
    ) {
        const editorRef = useRef<HTMLDivElement>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);
        /** Saved selection when opening Button/Link dialog (focus move clears selection) */
        const savedRangeRef = useRef<Range | null>(null);
        /** Saved selection when opening font size dropdown (focus move clears selection) */
        const toolbarSavedRangeRef = useRef<Range | null>(null);
        const [isUploading, setIsUploading] = useState(false);
        const [linkButtonDialogOpen, setLinkButtonDialogOpen] = useState(false);
        const [linkButtonDialogMode, setLinkButtonDialogMode] = useState<'link' | 'button'>('link');
        const [currentFormat, setCurrentFormat] = useState<any>({});

        // Button form state
        const [buttonForm, setButtonForm] = useState({
            href: '',
            backgroundColor: '#fa873c',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '8',
            borderColor: '',
            borderWidth: '1',
            text: '',
        });

        const [linkForm, setLinkForm] = useState({
            href: '',
            text: '',
            color: '#fa873c',
        });

        const [showHTMLView, setShowHTMLView] = useState(false);
        const [htmlSource, setHtmlSource] = useState('');
        /** When switching back from HTML view, apply this HTML after editor mounts */
        const pendingHtmlRef = useRef<string | null>(null);
        /** HTML we last sent via onChange; used to avoid overwriting editor when value is still stale (parent hasn't re-rendered yet) */
        const lastEmittedHtmlRef = useRef<string | null>(null);

        // Font size options (8-72px)
        const fontSizeOptions = useMemo(
            () =>
                Array.from({ length: 65 }, (_, i) => ({
                    label: `${i + 8}px`,
                    value: `${i + 8}px`,
                })),
            [],
        );

        // Get current selection format
        const getCurrentFormat = useCallback(() => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                // No selection - return default format
                return { fontSize: '16px' };
            }

            const range = selection.getRangeAt(0);
            const format: any = {};

            // Helper function to get inline style value
            const getInlineStyle = (element: HTMLElement, property: string): string | null => {
                const style = element.getAttribute('style');
                if (!style) return null;
                const regex = new RegExp(`${property}:\\s*([^;]+)`, 'i');
                const match = style.match(regex);
                return match ? match[1].trim() : null;
            };

            // Helper function to walk up DOM tree and find styles
            const findStyleInTree = (node: Node | null, property: string): string | null => {
                let current: HTMLElement | null = null;

                if (node) {
                    current = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
                }

                while (current && current !== editorRef.current) {
                    const inlineValue = getInlineStyle(current, property);
                    if (inlineValue) {
                        return inlineValue;
                    }
                    current = current.parentElement;
                }
                return null;
            };

            // Get the start container element (where selection starts)
            const startNode = range.startContainer;
            const startElement =
                startNode.nodeType === Node.TEXT_NODE ? startNode.parentElement : (startNode as HTMLElement);

            // Get the end container element (where selection ends)
            const endNode = range.endContainer;
            const endElement = endNode.nodeType === Node.TEXT_NODE ? endNode.parentElement : (endNode as HTMLElement);

            // Use start element for formatting detection
            const element = startElement || endElement;
            if (!element) {
                // If no element found, return default format
                return { fontSize: '16px' };
            }

            // Ensure the element is within the editor
            if (editorRef.current && !editorRef.current.contains(element)) {
                // Selection is outside editor, return default format
                return { fontSize: '16px' };
            }

            const style = window.getComputedStyle(element);

            // Check bold
            if (style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700) {
                format.bold = true;
            }

            // Check italic
            if (style.fontStyle === 'italic') {
                format.italic = true;
            }

            // Check underline
            if (style.textDecoration.includes('underline')) {
                format.underline = true;
            }

            // Get font size - check inline styles first, then computed
            let fontSize = findStyleInTree(startNode, 'font-size');
            if (!fontSize) {
                fontSize = findStyleInTree(endNode, 'font-size');
            }
            if (!fontSize) {
                // Check computed style, but only if it's not the default
                const computedSize = style.fontSize;
                if (computedSize && computedSize !== '16px') {
                    fontSize = computedSize;
                }
            }
            if (fontSize) {
                // Normalize font size to match our options format (ensure it ends with 'px')
                fontSize = fontSize.trim();
                if (!fontSize.endsWith('px')) {
                    // Try to parse as number and add 'px'
                    const numMatch = fontSize.match(/(\d+)/);
                    if (numMatch) {
                        fontSize = `${numMatch[1]}px`;
                    }
                }
                // Try to match with our font size options
                const matchedOption = fontSizeOptions.find(
                    (opt: { label: string; value: string }) => opt.value === fontSize,
                );
                if (matchedOption) {
                    format.fontSize = matchedOption.value;
                } else {
                    format.fontSize = fontSize;
                }
            }

            // Get color
            const color = style.color;
            if (color && color !== 'rgb(0, 0, 0)') {
                format.color = rgbToHex(color);
            }

            // Get background color
            const bgColor = style.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                format.backgroundColor = rgbToHex(bgColor);
            }

            // Get text align
            const textAlign = style.textAlign;
            if (textAlign && textAlign !== 'left') {
                format.textAlign = textAlign;
            }

            return format;
        }, [fontSizeOptions]);

        // Convert RGB to hex
        const rgbToHex = (rgb: string): string => {
            const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (match) {
                return (
                    '#' +
                    [1, 2, 3]
                        .map((i) => {
                            const hex = parseInt(match[i]).toString(16);
                            return hex.length === 1 ? '0' + hex : hex;
                        })
                        .join('')
                );
            }
            return rgb;
        };

        // Normalize URL so "google.com" becomes "https://google.com" and opens in new tab instead of relative path
        const toAbsoluteUrl = (url: string): string => {
            const trimmed = url?.trim() || '';
            if (!trimmed || trimmed === '#') return trimmed || '#';
            if (/^https?:\/\//i.test(trimmed)) return trimmed;
            return `https://${trimmed}`;
        };

        // Get HTML from editor - return raw innerHTML so email/complex HTML is preserved exactly
        const getHTML = useCallback((): string => {
            if (!editorRef.current) return '';

            const html = editorRef.current.innerHTML;

            // Remove empty content
            if (html === '<br>' || html.trim() === '') {
                return '';
            }

            return html;
        }, []);

        // Update format state
        const updateFormat = useCallback(() => {
            const format = getCurrentFormat();
            setCurrentFormat(format);
        }, [getCurrentFormat]);

        // Apply formatting command
        const execCommand = useCallback(
            (command: string, value?: string | boolean) => {
                document.execCommand(command, false, value as string);
                updateFormat();
                getHTML();
            },
            [updateFormat, getHTML],
        );

        // Handle content change
        const handleInput = useCallback(() => {
            const html = getHTML();
            lastEmittedHtmlRef.current = html;
            onChange?.(html);
            updateFormat();
        }, [getHTML, onChange, updateFormat]);

        // Insert text at current cursor (for variable insertion from parent, e.g. ContentBox)
        const insertTextAtCursor = useCallback(
            (text: string) => {
                if (!editorRef.current || !text) return;
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) {
                    editorRef.current.focus();
                    const range = document.createRange();
                    range.selectNodeContents(editorRef.current);
                    range.collapse(false);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return;
                const range = sel.getRangeAt(0);
                if (!editorRef.current.contains(range.commonAncestorContainer)) {
                    const r = document.createRange();
                    r.selectNodeContents(editorRef.current);
                    r.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(r);
                    const newRange = sel.getRangeAt(0);
                    newRange.deleteContents();
                    const textNode = document.createTextNode(text);
                    newRange.insertNode(textNode);
                    newRange.setStartAfter(textNode);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                } else {
                    range.deleteContents();
                    const textNode = document.createTextNode(text);
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                handleInput();
            },
            [handleInput],
        );

        useImperativeHandle(ref, () => ({ insertTextAtCursor }), [insertTextAtCursor]);

        // Handle paste - preserve font sizes and formatting
        const handlePaste = useCallback(
            (e: React.ClipboardEvent<HTMLDivElement>) => {
                e.preventDefault();
                if (!editorRef.current) return;

                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const range = selection.getRangeAt(0);
                if (!range) return;

                // Get clipboard data
                const clipboardData = e.clipboardData;
                const html = clipboardData.getData('text/html');
                const text = clipboardData.getData('text/plain');

                if (html) {
                    // Process HTML to preserve inline styles (especially font-size)
                    // Insert into a temporary container in the DOM so we can get computed styles
                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.visibility = 'hidden';
                    tempContainer.style.top = '-9999px';
                    document.body.appendChild(tempContainer);
                    tempContainer.innerHTML = html;

                    // Process all elements to ensure font-size and other styles are preserved as inline styles
                    const processElement = (element: HTMLElement) => {
                        // Get computed styles (now element is in DOM)
                        const computedStyle = window.getComputedStyle(element);
                        let inlineStyle = element.getAttribute('style') || '';

                        // Preserve font-size if present in computed style (from font tags, CSS, etc.)
                        const fontSize = computedStyle.fontSize;
                        if (fontSize && fontSize !== '16px' && !inlineStyle.includes('font-size')) {
                            inlineStyle = `${inlineStyle} font-size: ${fontSize};`.trim();
                        }

                        // Preserve color if present
                        const color = computedStyle.color;
                        if (color && color !== 'rgb(0, 0, 0)' && !inlineStyle.includes('color')) {
                            inlineStyle = `${inlineStyle} color: ${color};`.trim();
                        }

                        // Preserve background-color if present
                        const bgColor = computedStyle.backgroundColor;
                        if (
                            bgColor &&
                            bgColor !== 'rgba(0, 0, 0, 0)' &&
                            bgColor !== 'transparent' &&
                            !inlineStyle.includes('background-color')
                        ) {
                            inlineStyle = `${inlineStyle} background-color: ${bgColor};`.trim();
                        }

                        // Preserve font-weight
                        const fontWeight = computedStyle.fontWeight;
                        if (fontWeight && (fontWeight === 'bold' || parseInt(fontWeight) >= 700)) {
                            if (!inlineStyle.includes('font-weight')) {
                                inlineStyle = `${inlineStyle} font-weight: ${fontWeight};`.trim();
                            }
                        }

                        // Preserve font-style
                        const fontStyle = computedStyle.fontStyle;
                        if (fontStyle === 'italic' && !inlineStyle.includes('font-style')) {
                            inlineStyle = `${inlineStyle} font-style: italic;`.trim();
                        }

                        // Preserve text-decoration
                        const textDecoration = computedStyle.textDecoration;
                        if (textDecoration && textDecoration !== 'none' && !inlineStyle.includes('text-decoration')) {
                            inlineStyle = `${inlineStyle} text-decoration: ${textDecoration};`.trim();
                        }

                        if (inlineStyle) {
                            element.setAttribute('style', inlineStyle);
                        }

                        // Process children
                        Array.from(element.children).forEach((child) => {
                            processElement(child as HTMLElement);
                        });
                    };

                    // Process all top-level children
                    Array.from(tempContainer.children).forEach((child) => {
                        processElement(child as HTMLElement);
                    });

                    // Delete selected content and insert processed HTML
                    range.deleteContents();

                    // Insert nodes individually and track the last one
                    let lastInsertedNode: Node | null = null;
                    while (tempContainer.firstChild) {
                        const node = tempContainer.firstChild;
                        range.insertNode(node);
                        lastInsertedNode = node;
                    }
                    document.body.removeChild(tempContainer);

                    // Move cursor after inserted content
                    if (lastInsertedNode) {
                        const newRange = document.createRange();
                        newRange.setStartAfter(lastInsertedNode);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    } else {
                        // Fallback: collapse range at insertion point
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                } else if (text) {
                    // Plain text fallback - insert as text node
                    const textNode = document.createTextNode(text);
                    range.deleteContents();
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                handleInput();
            },
            [handleInput],
        );

        // Set font size
        const setFontSize = useCallback(
            (size: string) => {
                const selection = window.getSelection();
                if (!selection) return;

                let range: Range | null = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                if (!range || !editorRef.current?.contains(range.commonAncestorContainer)) {
                    range = toolbarSavedRangeRef.current;
                }
                if (range && editorRef.current?.contains(range.commonAncestorContainer)) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else if (selection.rangeCount === 0 && editorRef.current) {
                    const fallback = document.createRange();
                    fallback.selectNodeContents(editorRef.current);
                    selection.removeAllRanges();
                    selection.addRange(fallback);
                }

                if (!selection.rangeCount) return;
                range = selection.getRangeAt(0);
                if (!range) return;

                // Check if selection is collapsed (cursor only)
                if (range.collapsed) {
                    // Apply font size to the parent element
                    const container = range.commonAncestorContainer;
                    let element =
                        container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as HTMLElement);

                    // Find the nearest block or inline element
                    while (element && element !== editorRef.current) {
                        if (element.tagName === 'SPAN' || element.tagName === 'DIV' || element.tagName === 'P') {
                            element.style.fontSize = size;
                            handleInput();
                            // Update format after a short delay to ensure DOM is updated
                            setTimeout(() => updateFormat(), 10);
                            return;
                        }
                        element = element.parentElement;
                    }

                    // If no suitable element found, wrap in span
                    const span = document.createElement('span');
                    span.style.fontSize = size;
                    span.appendChild(document.createTextNode('\u200B')); // Zero-width space
                    range.insertNode(span);
                    range.setStartAfter(span);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    // Selection has content - wrap it
                    try {
                        const span = document.createElement('span');
                        span.style.fontSize = size;
                        span.appendChild(range.extractContents());
                        range.insertNode(span);

                        // Move selection after the span
                        range.setStartAfter(span);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        // Fallback: use execCommand and then fix styles
                        document.execCommand('fontSize', false, '7');
                        setTimeout(() => {
                            const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
                            fontElements?.forEach((el) => {
                                const span = document.createElement('span');
                                span.style.fontSize = size;
                                el.parentNode?.replaceChild(span, el);
                                while (el.firstChild) {
                                    span.appendChild(el.firstChild);
                                }
                            });
                            handleInput();
                            updateFormat();
                        }, 0);
                        return;
                    }
                }

                handleInput();
                // Update format after a short delay to ensure DOM is updated
                setTimeout(() => updateFormat(), 10);
                toolbarSavedRangeRef.current = null;
                editorRef.current?.focus();
            },
            [handleInput, updateFormat],
        );

        // Set color
        const setColor = useCallback(
            (color: string) => {
                const selection = window.getSelection();
                if (!selection) return;

                if (selection.rangeCount === 0) {
                    if (editorRef.current) {
                        const range = document.createRange();
                        range.selectNodeContents(editorRef.current);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        return;
                    }
                }

                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                if (!range) return;

                // Convert hex to RGB for execCommand (it doesn't work well with hex)
                const hexToRgb = (hex: string): string => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    if (result) {
                        return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
                    }
                    return hex;
                };

                // Try using execCommand first
                try {
                    // execCommand foreColor works better with RGB
                    const rgbColor = hexToRgb(color);
                    document.execCommand('foreColor', false, rgbColor);
                } catch (e) {
                    // Fallback: manually apply color
                    if (range.collapsed) {
                        // Cursor only - wrap in span
                        const span = document.createElement('span');
                        span.style.color = color;
                        span.appendChild(document.createTextNode('\u200B'));
                        range.insertNode(span);
                        range.setStartAfter(span);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        // Selection has content - wrap it
                        try {
                            const span = document.createElement('span');
                            span.style.color = color;
                            span.appendChild(range.extractContents());
                            range.insertNode(span);
                            range.setStartAfter(span);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        } catch (err) {
                            // Final fallback
                            document.execCommand('foreColor', false, color);
                        }
                    }
                }

                handleInput();
                setTimeout(() => updateFormat(), 10);
            },
            [handleInput, updateFormat],
        );

        // Apply button
        const handleApplyButton = useCallback(() => {
            const selection = window.getSelection();
            // Use saved range when dialog was opened (selection is lost when focus moves to dialog)
            let range: Range | null = savedRangeRef.current;
            if (selection && selection.rangeCount > 0) {
                const selRange = selection.getRangeAt(0);
                if (editorRef.current?.contains(selRange.commonAncestorContainer)) {
                    range = selRange;
                }
            }
            if (!range) {
                toast.error(t('Marketing.SelectTextForButton'));
                return;
            }

            // Use the label from the dialog (Text field) when provided, so the button shows the intended label not the selection
            const text = (buttonForm.text != null && buttonForm.text.trim() !== '') ? buttonForm.text.trim() : range.toString();
            if (!text) {
                toast.error(t('Marketing.SelectTextForButton'));
                return;
            }

            // Use anchor styled as button so it redirects in emails (buttons don't navigate in email clients)
            const anchor = document.createElement('a');
            anchor.href = toAbsoluteUrl(buttonForm.href ?? '');
            anchor.textContent = text;
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('rel', 'noopener noreferrer');

            let style = 'text-decoration: none; display: inline-block; ';
            if (buttonForm.backgroundColor) {
                style += `background-color: ${buttonForm.backgroundColor}; `;
            }
            if (buttonForm.color) {
                style += `color: ${buttonForm.color}; `;
            }
            if (buttonForm.padding) {
                style += `padding: ${buttonForm.padding}; `;
            }
            if (buttonForm.borderRadius) {
                style += `border-radius: ${buttonForm.borderRadius}px; `;
            }
            if (buttonForm.borderColor) {
                const borderWidth = `${buttonForm.borderWidth}px`;
                style += `border: ${borderWidth} solid ${buttonForm.borderColor}; `;
            }

            anchor.setAttribute('style', style.trim());

            range.deleteContents();
            range.insertNode(anchor);

            // Place cursor after the anchor and refocus editor
            const newRange = document.createRange();
            newRange.setStartAfter(anchor);
            newRange.collapse(true);
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
            editorRef.current?.focus();

            savedRangeRef.current = null;
            handleInput();
            setLinkButtonDialogOpen(false);
        }, [buttonForm, handleInput]);

        // Apply link
        const handleApplyLink = useCallback(() => {
            if (!linkForm.href?.trim()) {
                toast.error(t('Marketing.EnterURL'));
                return;
            }

            const selection = window.getSelection();
            // Use saved range when dialog was opened (selection is lost when focus moves to dialog)
            let range: Range | null = savedRangeRef.current;
            if (selection && selection.rangeCount > 0) {
                const selRange = selection.getRangeAt(0);
                if (editorRef.current?.contains(selRange.commonAncestorContainer)) {
                    range = selRange;
                }
            }

            // When no range (no selection): insert link at end of editor using manual text
            if (!range) {
                if (!editorRef.current) {
                    toast.error(t('Marketing.SelectTextForLink'));
                    return;
                }
                range = document.createRange();
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
            }

            const text = (linkForm.text ?? '').trim() || range.toString().trim();
            if (!text) {
                toast.error(t('Marketing.EnterLinkText'));
                return;
            }

            const link = document.createElement('a');
            link.href = toAbsoluteUrl(linkForm.href.trim());
            link.textContent = text;
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            const linkColor = linkForm.color || '#fa873c';
            link.setAttribute('style', `text-decoration: underline; color: ${linkColor};`);

            range.deleteContents();
            range.insertNode(link);

            // Place cursor after the link and refocus editor
            const newRange = document.createRange();
            newRange.setStartAfter(link);
            newRange.collapse(true);
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
            editorRef.current?.focus();

            savedRangeRef.current = null;
            handleInput();
            setLinkButtonDialogOpen(false);
        }, [linkForm, handleInput]);

        // Handle image upload
        const handleImageUpload = async (file: File) => {
            if (!file || isUploading || disabled) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(t('Common.InvalidImageFile'));
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error(t('Common.ImageTooLarge'));
                return;
            }

            setIsUploading(true);
            const toastId = toast.loading(t('POS.Processing'));

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await apiFetcher.post('api/v1/store/file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (response?.data?.data?.url) {
                    const imageUrl = `${process.env.REACT_APP_IMG_URL || ''}${response.data.data.url}`;

                    toast.update(toastId, {
                        type: 'success',
                        isLoading: false,
                        render: t('Customer.ADVUploadSuccess'),
                        autoClose: 2000,
                    });
                    // Insert image at cursor/selection (do not replace entire content)
                    if (editorRef.current) {
                        const selection = window.getSelection();
                        let range: Range | null = savedRangeRef.current;
                        if (selection && selection.rangeCount > 0) {
                            const selRange = selection.getRangeAt(0);
                            if (editorRef.current.contains(selRange.commonAncestorContainer)) {
                                range = selRange;
                            }
                        }
                        if (!range) {
                            range = document.createRange();
                            range.selectNodeContents(editorRef.current);
                            range.collapse(false);
                        }
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = 'Image';
                        img.setAttribute('style', 'max-width: 100%; height: auto;');
                        range.insertNode(img);
                        const newRange = document.createRange();
                        newRange.setStartAfter(img);
                        newRange.collapse(true);
                        const sel = window.getSelection();
                        if (sel) {
                            sel.removeAllRanges();
                            sel.addRange(newRange);
                        }
                        editorRef.current.focus();
                        savedRangeRef.current = null;
                        handleInput();
                    }
                } else {
                    toast.update(toastId, {
                        type: 'error',
                        isLoading: false,
                        render: t('Customer.ADVUploadFailed'),
                        autoClose: 2000,
                    });
                }
            } catch (error: any) {
                toast.update(toastId, {
                    type: 'error',
                    isLoading: false,
                    render: t('Customer.ADVUploadFailed'),
                    autoClose: 2000,
                });
            } finally {
                setIsUploading(false);
            }
        };

        const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleImageUpload(file);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        // Sync value → editor when value is from parent. Root cause of font revert: we overwrote editor with stale value
        // because parent state updates after onChange are async. Skip when editor already has our just-emitted HTML
        // and value hasn't caught up; only write to DOM when content actually differs to avoid blink.
        useEffect(() => {
            if (!editorRef.current) return;
            const editorHtml = editorRef.current.innerHTML;
            const normalizedValue = value || '';
            if (
                lastEmittedHtmlRef.current != null &&
                (editorHtml === lastEmittedHtmlRef.current ||
                    (editorHtml === '<br>' && lastEmittedHtmlRef.current === '')) &&
                normalizedValue !== lastEmittedHtmlRef.current
            ) {
                return;
            }
            if (
                normalizedValue === editorHtml ||
                (normalizedValue === '' && (editorHtml === '' || editorHtml === '<br>'))
            ) {
                return;
            }
            lastEmittedHtmlRef.current = normalizedValue;
            editorRef.current.innerHTML = normalizedValue || '';
        }, [value]);

        // Handle selection change
        useEffect(() => {
            const handleSelectionChange = () => {
                updateFormat();
            };

            document.addEventListener('selectionchange', handleSelectionChange);
            return () => {
                document.removeEventListener('selectionchange', handleSelectionChange);
            };
        }, [updateFormat]);

        // Toggle HTML view
        const toggleHTMLView = useCallback(() => {
            if (showHTMLView) {
                // Switching back to visual editor - store HTML to apply after editor mounts
                const htmlToSet = htmlSource !== undefined && htmlSource !== null ? htmlSource : '';
                pendingHtmlRef.current = htmlToSet;
            } else {
                // Switching to HTML view - capture current editor content
                if (editorRef.current) {
                    setHtmlSource(editorRef.current.innerHTML || '');
                }
            }
            setShowHTMLView(!showHTMLView);
        }, [showHTMLView, htmlSource]);

        // Strip inter-tag whitespace so indented HTML source doesn't create
        // visible text nodes when rendered (matches standalone HTML file behaviour).
        const normalizeEmailHtml = (html: string): string => {
            return html.replace(/>\s+</g, '><').trim();
        };

        // When editor mounts after switching back from HTML view, apply pending HTML
        useEffect(() => {
            if (!showHTMLView && editorRef.current && pendingHtmlRef.current !== null) {
                editorRef.current.innerHTML = normalizeEmailHtml(pendingHtmlRef.current);
                const processedHTML = getHTML();
                onChange?.(processedHTML);
                pendingHtmlRef.current = null;
            }
        }, [showHTMLView, getHTML, onChange]);

        const handleAlignmentChange = useCallback(
            (value: string) => {
                execCommand(value === 'left' ? 'justifyLeft' : value === 'center' ? 'justifyCenter' : 'justifyRight');
            },
            [execCommand],
        );

        return (
            <div
                className={cnMerge(
                    'custom-rich-text-editor flex flex-col border-[1px] border-solid rounded-md border-border-default overflow-hidden',
                    className,
                )}
            >
                {/* Editor - only one panel rendered at a time */}
                {!showHTMLView ? (
                    <div className="relative flex-1 flex flex-col min-h-0">
                        <div
                            ref={editorRef}
                            contentEditable={!readOnly && !disabled}
                            onInput={handleInput}
                            onBlur={handleInput}
                            onPaste={handlePaste}
                            onFocus={() => {
                                if (
                                    editorRef.current &&
                                    (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>')
                                ) {
                                    editorRef.current.innerHTML = '';
                                }
                            }}
                            className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 outline-none"
                            style={{
                                wordWrap: 'break-word',
                                background: 'transparent',
                                color: 'inherit',
                            }}
                            suppressContentEditableWarning
                        />
                        {(!value || value === '' || value === '<br>') && (
                            <div
                                className="absolute top-4 left-4 text-text-secondary pointer-events-none"
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {placeholder}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0 p-4 ">
                        <textarea
                            value={htmlSource}
                            onChange={(e) => setHtmlSource(e.target.value)}
                            className={cnMerge(
                                'w-full min-h-[200px] max-h-[400px] overflow-y-auto p-2 font-mono text-sm resize-none',
                                'border-0 border-t-[1px] border-solid border-border-default',
                            )}
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                )}

                {/* Toolbar at Bottom - horizontally scrollable on mobile (hidden when showToolbar=false, e.g. SMS) */}
                {showToolbar && (
                    <div
                        className={cnMerge(
                            'flex flex-row flex-wrap items-center gap-1 p-2 bg-white overflow-y-hidden min-w-0',
                            'border-0 border-t-[1px] border-solid border-border-default',
                        )}
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {/* Font Size (Text Size) - button opens dropdown; save selection on pointer down so it can be restored after dropdown closes */}
                        <RadixDropdown
                            items={fontSizeOptions.map((opt: { label: string; value: string }) => ({
                                label: opt.label,
                                value: opt.value,
                                onClick: () => setFontSize(opt.value),
                            }))}
                            contentClassName="max-h-60 overflow-y-auto"
                            trigger={
                                <button
                                    type="button"
                                    onPointerDown={() => {
                                        const sel = window.getSelection();
                                        if (
                                            sel &&
                                            sel.rangeCount > 0 &&
                                            editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)
                                        ) {
                                            toolbarSavedRangeRef.current = sel.getRangeAt(0).cloneRange();
                                        } else {
                                            toolbarSavedRangeRef.current = null;
                                        }
                                    }}
                                    className={cnMerge(
                                        'w-9 h-9 flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent p-0 shrink-0 text-[#010101]',
                                        currentFormat.fontSize &&
                                            currentFormat.fontSize !== '16px' &&
                                            '!border-primary-500',
                                    )}
                                    title={t('Marketing.FontSize')}
                                    disabled={disabled || readOnly}
                                >
                                    <img src={TextSizeIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                                </button>
                            }
                        />

                        {/* Divider */}
                        <div className="w-px h-5 bg-grey-200 mx-0.5" />

                        {/* Text Formatting */}
                        <button
                            type="button"
                            onClick={() => execCommand('bold')}
                            className={cnMerge(
                                'w-9 h-9 rounded-none flex items-center justify-center bg-transparent hover:bg-transparent p-0 border-0 border-b-[2px] border-transparent shrink-0 text-[#010101]',
                                currentFormat.bold && '!border-primary-500',
                            )}
                            title={t('Common.Bold')}
                            disabled={disabled || readOnly}
                        >
                            <img src={BoldIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>
                        <button
                            type="button"
                            onClick={() => execCommand('italic')}
                            className={cnMerge(
                                'w-9 h-9 rounded-none flex items-center justify-center bg-transparent hover:bg-transparent p-0 border-0 border-b-[2px] border-transparent shrink-0 text-[#010101]',
                                currentFormat.italic && '!border-primary-500',
                            )}
                            title={t('Common.Italic')}
                            disabled={disabled || readOnly}
                        >
                            <img src={ItalicIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>
                        <button
                            type="button"
                            onClick={() => execCommand('underline')}
                            className={cnMerge(
                                'w-9 h-9 rounded-none flex items-center justify-center bg-transparent hover:bg-transparent p-0 border-0 border-b-[2px] border-transparent shrink-0 text-[#010101]',
                                currentFormat.underline && '!border-primary-500',
                            )}
                            title={t('Common.Underline')}
                            disabled={disabled || readOnly}
                        >
                            <img src={UnderlineIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>

                        {/* Divider */}
                        <div className="w-px h-5 bg-grey-200 mx-0.5" />

                        {/* Text Color */}
                        <div className="relative w-9 h-9 flex items-center justify-center shrink-0 text-[#010101] border-0 border-b-[2px] border-transparent">
                            <img src={TextColorIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                            <input
                                type="color"
                                value={currentFormat.color || '#000000'}
                                onChange={(e) => setColor(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title={t('Marketing.TextColor')}
                            />
                        </div>

                        {/* Alignment Dropdown with Icons */}
                        <RadixDropdown
                            items={[
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <AlignLeft />
                                            <span>{t('Common.AlignLeft')}</span>
                                        </div>
                                    ),
                                    value: 'left',
                                    onClick: () => handleAlignmentChange('left'),
                                },
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <AlignCenter />
                                            <span>{t('Common.AlignCenter')}</span>
                                        </div>
                                    ),
                                    value: 'center',
                                    onClick: () => handleAlignmentChange('center'),
                                },
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <AlignRight />
                                            <span>{t('Common.AlignRight')}</span>
                                        </div>
                                    ),
                                    value: 'right',
                                    onClick: () => handleAlignmentChange('right'),
                                },
                            ]}
                            trigger={
                                <button
                                    type="button"
                                    className={cnMerge(
                                        'w-9 h-9 flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent p-0 shrink-0 text-[#010101]',
                                        currentFormat.textAlign &&
                                            currentFormat.textAlign !== 'left' &&
                                            '!border-primary-500',
                                    )}
                                    title={t('Common.AlignLeft')}
                                >
                                    {currentFormat.textAlign === 'center' ? (
                                        <AlignCenter className="text-[20px]" />
                                    ) : currentFormat.textAlign === 'right' ? (
                                        <AlignRight className="text-[20px]" />
                                    ) : (
                                        <AlignLeft className="text-[20px]" />
                                    )}
                                </button>
                            }
                        />

                        {/* Lists */}
                        <button
                            type="button"
                            onClick={() => execCommand('insertUnorderedList')}
                            className="w-9 h-9 rounded-none flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent p-0 shrink-0 text-[#010101]"
                            title={t('Common.BulletList')}
                            disabled={disabled || readOnly}
                        >
                            <img src={BulletListIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>
                        <button
                            type="button"
                            onClick={() => execCommand('insertOrderedList')}
                            className="w-9 h-9 rounded-none flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent p-0 shrink-0 text-[#010101]"
                            title={t('Common.NumberedList')}
                            disabled={disabled || readOnly}
                        >
                            <img src={NumberedListIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>

                        {/* Image */}
                        <button
                            type="button"
                            onClick={() => {
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0) {
                                    const selRange = selection.getRangeAt(0);
                                    if (editorRef.current?.contains(selRange.commonAncestorContainer)) {
                                        savedRangeRef.current = selRange.cloneRange();
                                    }
                                } else {
                                    savedRangeRef.current = null;
                                }
                                fileInputRef.current?.click();
                            }}
                            className="w-9 h-9 rounded-none flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent p-0 shrink-0 text-[#010101]"
                            title={t('POS.Image')}
                            disabled={disabled || readOnly || isUploading}
                        >
                            <img src={ImageIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>

                        {/* HTML View Toggle */}
                        <button
                            type="button"
                            onClick={toggleHTMLView}
                            className={cnMerge(
                                'w-9 h-9 rounded-none flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent p-0 shrink-0 text-[#010101]',
                                showHTMLView && '!border-primary-500',
                            )}
                            title="HTML View"
                            disabled={disabled || readOnly}
                        >
                            <img src={HTMLIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>

                        {/* Button */}
                        <button
                            type="button"
                            onClick={() => {
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0) {
                                    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
                                } else {
                                    savedRangeRef.current = null;
                                }
                                const text = selection?.toString() || '';
                                setButtonForm({ ...buttonForm, text });
                                setLinkButtonDialogMode('button');
                                setLinkButtonDialogOpen(true);
                            }}
                            className="h-9 min-w-9 px-2 rounded-none flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent shrink-0 text-[#010101]"
                            title={t('Marketing.ButtonSettings')}
                            disabled={disabled || readOnly}
                        >
                            <span className="text-xs font-medium cursor-pointer">Button</span>
                        </button>

                        {/* Link */}
                        <button
                            type="button"
                            onClick={() => {
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0) {
                                    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
                                } else {
                                    savedRangeRef.current = null;
                                }
                                const text = selection?.toString() || '';
                                setLinkForm({ ...linkForm, text });
                                setLinkButtonDialogMode('link');
                                setLinkButtonDialogOpen(true);
                            }}
                            className="w-9 h-9 rounded-none flex items-center justify-center bg-transparent border-0 border-b-[2px] border-transparent hover:bg-transparent p-0 shrink-0 text-[#010101]"
                            title={t('Common.Link')}
                            disabled={disabled || readOnly}
                        >
                            <img src={LinkIconPng} alt="" className="shrink-0 w-5 h-5 cursor-pointer" />
                        </button>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                />

                {/* Link / Button unified Dialog */}
                <RadixDialog
                    open={linkButtonDialogOpen}
                    onOpenChange={setLinkButtonDialogOpen}
                    title={linkButtonDialogMode === 'link' ? t('Common.Link') : t('Marketing.ButtonSettings')}
                    footer={
                        <div className="flex gap-2 justify-end">
                            <RadixButton variant="outline" onClick={() => setLinkButtonDialogOpen(false)}>
                                {t('Marketing.Cancel')}
                            </RadixButton>
                            <RadixButton
                                onClick={linkButtonDialogMode === 'link' ? handleApplyLink : handleApplyButton}
                            >
                                {t('Marketing.Apply')}
                            </RadixButton>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">{t('Marketing.ButtonLink')}</label>
                            <RadixInput
                                value={linkButtonDialogMode === 'link' ? linkForm.href : buttonForm.href}
                                onChange={(e) =>
                                    linkButtonDialogMode === 'link'
                                        ? setLinkForm({ ...linkForm, href: e.target.value })
                                        : setButtonForm({ ...buttonForm, href: e.target.value })
                                }
                                placeholder={t('Marketing.EnterURL')}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">{t('Common.Text')}</label>
                            <RadixInput
                                value={linkButtonDialogMode === 'link' ? linkForm.text : buttonForm.text}
                                onChange={(e) =>
                                    linkButtonDialogMode === 'link'
                                        ? setLinkForm({ ...linkForm, text: e.target.value })
                                        : setButtonForm({ ...buttonForm, text: e.target.value })
                                }
                                placeholder={t('Common.Text')}
                            />
                        </div>

                        {linkButtonDialogMode === 'link' ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">{t('Marketing.LinkColor')}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={linkForm.color || '#fa873c'}
                                        onChange={(e) => setLinkForm({ ...linkForm, color: e.target.value })}
                                        className="min-w-9 min-h-9 w-9 h-9 cursor-pointer border-0"
                                    />
                                    <RadixInput
                                        value={linkForm.color || ''}
                                        onChange={(e) => setLinkForm({ ...linkForm, color: e.target.value })}
                                        placeholder="#fa873c"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">{t('Marketing.BackgroundColor')}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={buttonForm.backgroundColor || '#fa873c'}
                                            onChange={(e) =>
                                                setButtonForm({ ...buttonForm, backgroundColor: e.target.value })
                                            }
                                            className="min-w-9 min-h-9 w-9 h-9 cursor-pointer border-0"
                                        />
                                        <RadixInput
                                            value={buttonForm.backgroundColor || ''}
                                            onChange={(e) =>
                                                setButtonForm({ ...buttonForm, backgroundColor: e.target.value })
                                            }
                                            placeholder={t('Marketing.EnterHexColor')}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">{t('Marketing.TextColor')}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={buttonForm.color || '#ffffff'}
                                            onChange={(e) => setButtonForm({ ...buttonForm, color: e.target.value })}
                                            className="min-w-9 min-h-9 w-9 h-9 cursor-pointer border-0"
                                        />
                                        <RadixInput
                                            value={buttonForm.color || ''}
                                            onChange={(e) => setButtonForm({ ...buttonForm, color: e.target.value })}
                                            placeholder={t('Marketing.EnterHexColor')}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">{t('Marketing.Padding')}</label>
                                    <RadixInput
                                        value={buttonForm.padding}
                                        onChange={(e) => setButtonForm({ ...buttonForm, padding: e.target.value })}
                                        placeholder={t('Marketing.EnterPadding')}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">{t('Marketing.BorderRadius')}</label>
                                    <RadixInput
                                        type="number"
                                        value={buttonForm.borderRadius}
                                        onChange={(e) => setButtonForm({ ...buttonForm, borderRadius: e.target.value })}
                                        placeholder={t('Marketing.EnterPixels')}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </RadixDialog>
            </div>
        );
    },
);

CustomRichTextEditor.displayName = 'CustomRichTextEditor';
export default CustomRichTextEditor;
