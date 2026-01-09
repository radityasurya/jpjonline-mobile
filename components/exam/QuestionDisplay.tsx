import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { decodeHtmlEntities } from '@/utils/htmlDecoder';
import { convertImageUrl } from '@/utils/markdownImageHandler';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import { RetryImage } from '@/components/shared/RetryImage';

interface QuestionDisplayProps {
  question: any;
  questionIndex: number;
}

export function QuestionDisplay({
  question,
  questionIndex,
}: QuestionDisplayProps) {
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');

  // Support both imageUrl (from API) and image (legacy)
  // Use useMemo to prevent recalculating on every render
  const questionImageUrl = useMemo(() => {
    const rawImageUrl = question.imageUrl || question.image;
    return rawImageUrl && rawImageUrl.trim() !== ''
      ? convertImageUrl(rawImageUrl)
      : null;
  }, [question.id, question.imageUrl, question.image]);

  // Markdown styles - matching result page styling
  const markdownStyles = useMemo(
    () => ({
      body: {
        color: '#333333',
      },
      text: {
        fontSize: 18,
        color: '#333333',
        lineHeight: 26,
      },
      paragraph: {
        marginTop: 0,
        marginBottom: 8,
        fontSize: 18,
        color: '#333333',
        lineHeight: 26,
      },
      strong: {
        fontWeight: '900' as const,
        color: '#000000',
      },
      em: {
        fontStyle: 'italic' as const,
        color: '#333333',
      },
      list_item: {
        flexDirection: 'row' as const,
        marginBottom: 4,
        fontSize: 18,
        color: '#333333',
        lineHeight: 26,
      },
      bullet_list: {
        marginTop: 8,
        marginBottom: 8,
      },
      ordered_list: {
        marginTop: 8,
        marginBottom: 8,
      },
      bullet_list_icon: {
        fontSize: 18,
        lineHeight: 26,
        marginRight: 8,
      },
      ordered_list_icon: {
        fontSize: 18,
        lineHeight: 26,
        marginRight: 8,
      },
    }),
    [],
  );

  // Custom rules for markdown rendering
  const markdownRules = useMemo(
    () => ({
      image: (node: any) => {
        const imageUrl = convertImageUrl(node.attributes.src);
        return (
          <View key={node.key} style={styles.markdownImageContainer}>
            <RetryImage
              uri={imageUrl}
              style={styles.markdownImage}
              resizeMode="contain"
              showZoomButton={true}
              onZoomPress={() => {
                setLightboxImageUrl(imageUrl);
                setLightboxVisible(true);
              }}
              maxRetries={3}
              retryDelay={2000}
            />
          </View>
        );
      },
    }),
    [],
  );

  return (
    <>
      <ImageLightbox
        visible={lightboxVisible}
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxVisible(false)}
      />
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>

        {questionImageUrl && questionImageUrl.trim() !== '' && (
          <RetryImage
            uri={questionImageUrl}
            style={styles.questionImage}
            containerStyle={styles.imageContainer}
            resizeMode="contain"
            showZoomButton={true}
            onZoomPress={() => {
              setLightboxImageUrl(questionImageUrl);
              setLightboxVisible(true);
            }}
            maxRetries={3}
            retryDelay={2000}
          />
        )}

        {question.text && question.text.trim() && (
          <Markdown style={markdownStyles} rules={markdownRules}>
            {decodeHtmlEntities(question.text)}
          </Markdown>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  questionContainer: {
    marginBottom: 30,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  imageContainer: {
    marginVertical: 16,
    height: 200,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  markdownImageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  markdownImage: {
    width: '100%',
    minHeight: 150,
    height: undefined,
    aspectRatio: 1,
    borderRadius: 8,
  },
  markdownImageAlt: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
