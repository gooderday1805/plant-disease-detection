import React from 'react';
interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = ({ content }: MarkdownContentProps) => {
  // Function to format the content
  const formatContent = (text: string) => {
    return text
      // Convert **text** to bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *text* to italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert numbered lists
      .replace(/^(\d+\.\s)/gm, '<br/><strong>$1</strong>')
      // Convert bullet points
      .replace(/^\*\s/gm, '<br/>• ')
      // Convert line breaks
      .replace(/\n/g, '<br/>')
      // Clean up multiple breaks
      .replace(/(<br\/>){3,}/g, '<br/><br/>');
  };

  return (
    <div 
      className="prose prose-sm max-w-none text-secondary-foreground"
      dangerouslySetInnerHTML={{ 
        __html: formatContent(content) 
      }}
    />
  );
};

export default MarkdownContent;