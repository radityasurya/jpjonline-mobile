/**
 * Utility to handle markdown images in React Native
 * Converts markdown image syntax to React Native Image components with proper URLs
 */

/**
 * Convert relative image URLs to absolute URLs
 * @param {string} url - Image URL (can be relative or absolute)
 * @returns {string} - Absolute image URL
 */
export const convertImageUrl = (url) => {
  if (!url) return url;
  return url.startsWith('http') ? url : `https://jpjonline.com${url}`;
};

/**
 * Extract markdown image references from text
 * @param {string} text - Text containing markdown images
 * @returns {Array} - Array of image objects with src, alt, and positions
 */
export const extractMarkdownImages = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;
  
  while ((match = imageRegex.exec(text)) !== null) {
    images.push({
      alt: match[1] || '',
      src: match[2],
      fullMatch: match[0],
      index: match.index
    });
  }
  
  return images;
};

/**
 * Split text into segments with markdown images
 * @param {string} text - Text containing markdown images
 * @returns {Array} - Array of segments (text or image objects)
 */
export const splitTextWithImages = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const images = extractMarkdownImages(text);
  if (images.length === 0) return [{ type: 'text', content: text }];
  
  const segments = [];
  let lastIndex = 0;
  
  images.forEach((image, imageIndex) => {
    // Add text before image
    if (image.index > lastIndex) {
      const textBefore = text.substring(lastIndex, image.index);
      if (textBefore.trim()) {
        segments.push({ type: 'text', content: textBefore });
      }
    }
    
    // Add image
    segments.push({
      type: 'image',
      src: image.src,
      alt: image.alt
    });
    
    lastIndex = image.index + image.fullMatch.length;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) {
      segments.push({ type: 'text', content: remainingText });
    }
  }
  
  return segments;
};

/**
 * Create custom markdown rules for react-native-markdown-display
 * @returns {Object} - Custom rules for image rendering
 */
export const createMarkdownImageRules = () => {
  return {
    image: (node, children, parent, styles) => {
      const imageUrl = convertImageUrl(node.attributes.src);
      const altText = node.children?.[0]?.content || 'Image';

      return {
        type: 'Image',
        key: node.key,
        props: {
          source: { uri: imageUrl },
          style: styles.markdownImage,
          resizeMode: 'contain',
          onError: (error) => {
            console.log('Markdown image load error:', error.nativeEvent.error);
          }
        }
      };
    }
  };
};

/**
 * Create styles for markdown images
 * @returns {Object} - Styles for markdown image components
 */
export const createMarkdownImageStyles = () => {
  return {
    markdownImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginVertical: 8,
    },
    markdownImageAlt: {
      fontSize: 12,
      color: '#666666',
      marginTop: 4,
      textAlign: 'center',
      fontStyle: 'italic',
    }
  };
};