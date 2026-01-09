import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageLightboxProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

export function ImageLightbox({
  visible,
  imageUrl,
  onClose,
}: ImageLightboxProps) {
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: width * 0.95,
                height: height * 0.9,
              },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  image: {
    // Dimensions set dynamically in component
  },
});
